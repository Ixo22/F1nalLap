-- Core F1 data loaded from Jolpica, plus the circuit catalogue used by the strategy simulator.

CREATE TABLE season (
    year       INTEGER PRIMARY KEY,
    loaded_at  TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE driver (
    id               BIGSERIAL PRIMARY KEY,
    driver_ref       VARCHAR(64)  NOT NULL UNIQUE,
    code             VARCHAR(3),
    given_name       VARCHAR(100) NOT NULL,
    family_name      VARCHAR(100) NOT NULL,
    nationality      VARCHAR(64),
    permanent_number INTEGER
);

CREATE TABLE constructor (
    id               BIGSERIAL PRIMARY KEY,
    constructor_ref  VARCHAR(64)  NOT NULL UNIQUE,
    name             VARCHAR(100) NOT NULL,
    nationality      VARCHAR(64)
);

-- circuit_ref is kept as text: historic races use circuits that are not in the simulator catalogue.
CREATE TABLE race (
    id            BIGSERIAL PRIMARY KEY,
    season_year   INTEGER      NOT NULL REFERENCES season (year) ON DELETE CASCADE,
    round         INTEGER      NOT NULL,
    name          VARCHAR(100) NOT NULL,
    race_date     DATE,
    circuit_ref   VARCHAR(64)  NOT NULL,
    circuit_name  VARCHAR(100),
    CONSTRAINT uk_race_season_round UNIQUE (season_year, round)
);
CREATE INDEX idx_race_season ON race (season_year);

-- result_order is the row order published by Jolpica (unique per race). position is not unique:
-- with shared drives in the 1950s two drivers could be classified in the same position.
CREATE TABLE race_result (
    id               BIGSERIAL PRIMARY KEY,
    race_id          BIGINT       NOT NULL REFERENCES race (id) ON DELETE CASCADE,
    driver_id        BIGINT       NOT NULL REFERENCES driver (id),
    constructor_id   BIGINT       NOT NULL REFERENCES constructor (id),
    result_order     INTEGER      NOT NULL,
    position         INTEGER      NOT NULL,
    position_text    VARCHAR(8)   NOT NULL,
    grid             INTEGER,
    points           NUMERIC(6, 2) NOT NULL,
    status           VARCHAR(64),
    laps             INTEGER,
    fastest_lap_time VARCHAR(16),
    CONSTRAINT uk_result_race_order UNIQUE (race_id, result_order)
);
CREATE INDEX idx_result_race ON race_result (race_id);
CREATE INDEX idx_result_driver ON race_result (driver_id);
CREATE INDEX idx_result_constructor ON race_result (constructor_id);

CREATE TABLE driver_standing (
    id             BIGSERIAL PRIMARY KEY,
    season_year    INTEGER      NOT NULL REFERENCES season (year) ON DELETE CASCADE,
    driver_id      BIGINT       NOT NULL REFERENCES driver (id),
    position       INTEGER,
    position_text  VARCHAR(8)   NOT NULL,
    points         NUMERIC(6, 2) NOT NULL,
    wins           INTEGER      NOT NULL,
    CONSTRAINT uk_driver_standing UNIQUE (season_year, driver_id)
);
CREATE INDEX idx_driver_standing_season ON driver_standing (season_year);

-- A driver can race for several constructors in one season; order matches Jolpica.
CREATE TABLE driver_standing_constructor (
    driver_standing_id BIGINT  NOT NULL REFERENCES driver_standing (id) ON DELETE CASCADE,
    constructor_id     BIGINT  NOT NULL REFERENCES constructor (id),
    sort_order         INTEGER NOT NULL,
    PRIMARY KEY (driver_standing_id, sort_order)
);

CREATE TABLE constructor_standing (
    id              BIGSERIAL PRIMARY KEY,
    season_year     INTEGER      NOT NULL REFERENCES season (year) ON DELETE CASCADE,
    constructor_id  BIGINT       NOT NULL REFERENCES constructor (id),
    position        INTEGER,
    position_text   VARCHAR(8)   NOT NULL,
    points          NUMERIC(6, 2) NOT NULL,
    wins            INTEGER      NOT NULL,
    CONSTRAINT uk_constructor_standing UNIQUE (season_year, constructor_id)
);
CREATE INDEX idx_constructor_standing_season ON constructor_standing (season_year);

CREATE TABLE circuit (
    id              INTEGER PRIMARY KEY,
    circuit_ref     VARCHAR(64)  NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    grand_prix_name VARCHAR(100) NOT NULL,
    country         VARCHAR(64)  NOT NULL,
    laps            INTEGER      NOT NULL,
    length_km       NUMERIC(6, 3) NOT NULL,
    lap_record_ms   INTEGER      NOT NULL,
    image_url       VARCHAR(255)
);

-- Audit trail of every ingestion attempt.
CREATE TABLE ingest_run (
    id           BIGSERIAL PRIMARY KEY,
    season_year  INTEGER     NOT NULL,
    trigger_type VARCHAR(16) NOT NULL,
    status       VARCHAR(16) NOT NULL,
    started_at   TIMESTAMP WITH TIME ZONE NOT NULL,
    finished_at  TIMESTAMP WITH TIME ZONE,
    requests     INTEGER,
    rows_written INTEGER,
    error        TEXT
);
CREATE INDEX idx_ingest_run_season ON ingest_run (season_year);

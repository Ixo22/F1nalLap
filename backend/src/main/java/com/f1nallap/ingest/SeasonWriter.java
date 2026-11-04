package com.f1nallap.ingest;

import com.f1nallap.season.Constructor;
import com.f1nallap.season.ConstructorRepository;
import com.f1nallap.season.Driver;
import com.f1nallap.season.DriverRepository;
import com.f1nallap.season.Race;
import com.f1nallap.season.RaceRepository;
import com.f1nallap.season.RaceResult;
import com.f1nallap.season.RaceResultRepository;
import com.f1nallap.season.Season;
import com.f1nallap.season.SeasonRepository;
import com.f1nallap.standings.ConstructorStanding;
import com.f1nallap.standings.ConstructorStandingRepository;
import com.f1nallap.standings.DriverStanding;
import com.f1nallap.standings.DriverStandingRepository;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Writes a downloaded season in a single transaction: either the whole season is stored or
 * nothing changes. Drivers and constructors are upserted by their Jolpica id. Races, results and
 * standings of the season are replaced, so running the same ingest twice leaves the same data.
 */
@Component
public class SeasonWriter {

	private final SeasonRepository seasons;

	private final DriverRepository drivers;

	private final ConstructorRepository constructors;

	private final RaceRepository races;

	private final RaceResultRepository results;

	private final DriverStandingRepository driverStandings;

	private final ConstructorStandingRepository constructorStandings;

	private final Clock clock;

	public SeasonWriter(SeasonRepository seasons, DriverRepository drivers,
			ConstructorRepository constructors, RaceRepository races, RaceResultRepository results,
			DriverStandingRepository driverStandings,
			ConstructorStandingRepository constructorStandings, Clock clock) {
		this.seasons = seasons;
		this.drivers = drivers;
		this.constructors = constructors;
		this.races = races;
		this.results = results;
		this.driverStandings = driverStandings;
		this.constructorStandings = constructorStandings;
		this.clock = clock;
	}

	/** Stores the season and returns the number of rows written. */
	@Transactional
	public int write(SeasonData data) {
		int season = data.season();
		Season seasonRow = seasons.findById(season).orElseGet(() -> new Season(season, now()));
		seasonRow.setLoadedAt(now());
		seasons.save(seasonRow);

		results.deleteBySeasonYear(season);
		races.deleteBySeasonYear(season);
		driverStandings.deleteBySeasonYear(season);
		constructorStandings.deleteBySeasonYear(season);

		Map<String, Driver> driverByRef = upsertDrivers(data);
		Map<String, Constructor> constructorByRef = upsertConstructors(data);

		int rows = 0;
		Map<String, Race> raceByRound = new HashMap<>();
		for (JolpicaModels.Race jr : racesToStore(data)) {
			Race race = races.save(new Race(season, Integer.parseInt(jr.round()), jr.raceName(),
					parseDate(jr.date()), jr.circuit().circuitId(), jr.circuit().circuitName()));
			raceByRound.put(jr.round(), race);
			rows++;
		}

		for (JolpicaModels.Race jr : data.resultsByRace()) {
			Race race = raceByRound.get(jr.round());
			int order = 0;
			for (JolpicaModels.Result r : nullSafe(jr.results())) {
				results.save(new RaceResult(race, driverByRef.get(r.driver().driverId()),
						constructorByRef.get(r.constructor().constructorId()), ++order,
						Integer.parseInt(r.position()), r.positionText(), parseInt(r.grid()),
						parsePoints(r.points()), r.status(), parseInt(r.laps()), fastestLap(r)));
				rows++;
			}
		}

		for (JolpicaModels.DriverStanding ds : data.driverStandings()) {
			List<Constructor> teams = nullSafe(ds.constructors()).stream()
				.map(c -> constructorByRef.get(c.constructorId()))
				.toList();
			driverStandings.save(new DriverStanding(season, driverByRef.get(ds.driver().driverId()),
					parseInt(ds.position()), ds.positionText(), parsePoints(ds.points()),
					orZero(parseInt(ds.wins())), teams));
			rows++;
		}

		for (JolpicaModels.ConstructorStanding cs : data.constructorStandings()) {
			constructorStandings.save(new ConstructorStanding(season,
					constructorByRef.get(cs.constructor().constructorId()), parseInt(cs.position()),
					cs.positionText(), parsePoints(cs.points()), orZero(parseInt(cs.wins()))));
			rows++;
		}
		return rows;
	}

	/** The schedule is the source of races; a race that only appears in results is added too. */
	private static List<JolpicaModels.Race> racesToStore(SeasonData data) {
		Map<String, JolpicaModels.Race> byRound = new LinkedHashMap<>();
		data.schedule().forEach(r -> byRound.putIfAbsent(r.round(), r));
		data.resultsByRace().forEach(r -> byRound.putIfAbsent(r.round(), r));
		return byRound.values()
			.stream()
			.sorted(Comparator.comparingInt(r -> Integer.parseInt(r.round())))
			.toList();
	}

	private Map<String, Driver> upsertDrivers(SeasonData data) {
		Map<String, JolpicaModels.Driver> incoming = Stream
			.concat(allResults(data).map(JolpicaModels.Result::driver),
					data.driverStandings().stream().map(JolpicaModels.DriverStanding::driver))
			.collect(Collectors.toMap(JolpicaModels.Driver::driverId, Function.identity(),
					(first, second) -> first, LinkedHashMap::new));

		Map<String, Driver> existing = drivers.findByDriverRefIn(incoming.keySet())
			.stream()
			.collect(Collectors.toMap(Driver::getDriverRef, Function.identity()));

		Map<String, Driver> saved = new HashMap<>();
		incoming.forEach((ref, jd) -> {
			Driver driver = existing.getOrDefault(ref, new Driver(ref));
			driver.update(jd.code(), jd.givenName(), jd.familyName(), jd.nationality(),
					parseInt(jd.permanentNumber()));
			saved.put(ref, drivers.save(driver));
		});
		return saved;
	}

	private Map<String, Constructor> upsertConstructors(SeasonData data) {
		Map<String, JolpicaModels.Constructor> incoming = Stream
			.of(allResults(data).map(JolpicaModels.Result::constructor),
					data.driverStandings().stream().flatMap(ds -> nullSafe(ds.constructors()).stream()),
					data.constructorStandings()
						.stream()
						.map(JolpicaModels.ConstructorStanding::constructor))
			.flatMap(Function.identity())
			.collect(Collectors.toMap(JolpicaModels.Constructor::constructorId, Function.identity(),
					(first, second) -> first, LinkedHashMap::new));

		Map<String, Constructor> existing = constructors.findByConstructorRefIn(incoming.keySet())
			.stream()
			.collect(Collectors.toMap(Constructor::getConstructorRef, Function.identity()));

		Map<String, Constructor> saved = new HashMap<>();
		incoming.forEach((ref, jc) -> {
			Constructor constructor = existing.getOrDefault(ref, new Constructor(ref));
			constructor.update(jc.name(), jc.nationality());
			saved.put(ref, constructors.save(constructor));
		});
		return saved;
	}

	private static Stream<JolpicaModels.Result> allResults(SeasonData data) {
		return data.resultsByRace().stream().flatMap(r -> nullSafe(r.results()).stream());
	}

	private Instant now() {
		return Instant.now(clock);
	}

	private static <T> List<T> nullSafe(List<T> list) {
		return list == null ? List.of() : list;
	}

	private static int orZero(Integer value) {
		return value == null ? 0 : value;
	}

	static Integer parseInt(String value) {
		if (value == null || value.isBlank()) {
			return null;
		}
		try {
			return Integer.valueOf(value);
		}
		catch (NumberFormatException ex) {
			return null;
		}
	}

	static BigDecimal parsePoints(String value) {
		return value == null || value.isBlank() ? BigDecimal.ZERO : new BigDecimal(value);
	}

	private static LocalDate parseDate(String value) {
		return value == null || value.isBlank() ? null : LocalDate.parse(value);
	}

	private static String fastestLap(JolpicaModels.Result result) {
		return result.fastestLap() == null || result.fastestLap().time() == null ? null
				: result.fastestLap().time().time();
	}

}

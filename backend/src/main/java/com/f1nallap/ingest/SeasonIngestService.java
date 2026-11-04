package com.f1nallap.ingest;

import com.f1nallap.common.ServiceUnavailableException;
import com.f1nallap.ingest.IngestRun.Status;
import com.f1nallap.ingest.IngestRun.Trigger;
import com.f1nallap.season.Season;
import com.f1nallap.season.SeasonRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.concurrent.locks.ReentrantLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Loads seasons from Jolpica into the database.
 * Seasons are loaded on demand the first time someone asks for them, so the app can serve any
 * season since 1950 without downloading all of them up front. Only one ingest runs at a time,
 * which keeps the app under the Jolpica rate limits.
 */
@Service
public class SeasonIngestService {

	private static final Logger log = LoggerFactory.getLogger(SeasonIngestService.class);

	private final SeasonFetcher fetcher;

	private final SeasonWriter writer;

	private final SeasonRepository seasons;

	private final IngestRunRepository runs;

	private final RateLimitInterceptor requestCounter;

	private final IngestProperties properties;

	private final Clock clock;

	private final ReentrantLock lock = new ReentrantLock();

	public SeasonIngestService(SeasonFetcher fetcher, SeasonWriter writer, SeasonRepository seasons,
			IngestRunRepository runs, RateLimitInterceptor requestCounter, IngestProperties properties,
			Clock clock) {
		this.fetcher = fetcher;
		this.writer = writer;
		this.seasons = seasons;
		this.runs = runs;
		this.requestCounter = requestCounter;
		this.properties = properties;
		this.clock = clock;
	}

	/** Downloads and stores a season, recording the attempt in ingest_run. Never throws. */
	public IngestRun ingest(int season, Trigger trigger) {
		lock.lock();
		try {
			return doIngest(season, trigger);
		}
		finally {
			lock.unlock();
		}
	}

	/**
	 * Makes sure the season is in the database before it is read. A missing season is loaded now;
	 * a season still in progress is refreshed when its data is older than the configured TTL.
	 * If a refresh fails, the stored (stale) data is still served.
	 */
	public void ensureLoaded(int season) {
		if (isFresh(seasons.findById(season))) {
			return;
		}
		lock.lock();
		try {
			Optional<Season> stored = seasons.findById(season);
			if (isFresh(stored)) {
				return;
			}
			IngestRun run = doIngest(season, Trigger.ON_DEMAND);
			if (run.getStatus() == Status.FAILED && stored.isEmpty()) {
				throw new ServiceUnavailableException(
						"Season %d could not be loaded from the upstream API.".formatted(season), null);
			}
		}
		finally {
			lock.unlock();
		}
	}

	public boolean isLoaded(int season) {
		return seasons.existsById(season);
	}

	private IngestRun doIngest(int season, Trigger trigger) {
		IngestRun run = runs.save(new IngestRun(season, trigger, Instant.now(clock)));
		int requestsBefore = requestCounter.requestCount();
		try {
			SeasonData data = fetcher.fetch(season);
			int rows = writer.write(data);
			run.succeed(Instant.now(clock), requestCounter.requestCount() - requestsBefore, rows);
			log.info("Ingested season {} ({} rows, {} requests)", season, rows, run.getRequests());
		}
		catch (RuntimeException ex) {
			run.fail(Instant.now(clock), requestCounter.requestCount() - requestsBefore,
					ex.getClass().getSimpleName() + ": " + ex.getMessage());
			log.warn("Ingest of season {} failed: {}", season, ex.toString());
		}
		return runs.save(run);
	}

	/**
	 * A season is fresh when it was loaded after it ended (its data can no longer change),
	 * or when it was loaded recently.
	 */
	private boolean isFresh(Optional<Season> stored) {
		if (stored.isEmpty()) {
			return false;
		}
		Season season = stored.get();
		Instant seasonEnd = LocalDate.of(season.getYear() + 1, 1, 1).atStartOfDay().toInstant(ZoneOffset.UTC);
		Instant loadedAt = season.getLoadedAt();
		return !loadedAt.isBefore(seasonEnd)
				|| loadedAt.isAfter(Instant.now(clock).minus(properties.currentSeasonTtl()));
	}

}

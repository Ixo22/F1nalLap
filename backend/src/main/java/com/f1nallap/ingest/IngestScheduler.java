package com.f1nallap.ingest;

import com.f1nallap.common.SeasonYears;
import com.f1nallap.ingest.IngestRun.Trigger;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Background loads: preloads seasons at startup and refreshes the current one every Monday. */
@Component
@EnableScheduling
public class IngestScheduler {

	private final SeasonIngestService ingestService;

	private final IngestProperties properties;

	private final SeasonYears seasonYears;

	public IngestScheduler(SeasonIngestService ingestService, IngestProperties properties,
			SeasonYears seasonYears) {
		this.ingestService = ingestService;
		this.properties = properties;
		this.seasonYears = seasonYears;
	}

	/** Runs in a virtual thread so startup is not blocked by the downloads. */
	@EventListener(ApplicationReadyEvent.class)
	public void preloadSeasons() {
		Thread.ofVirtual().name("season-preload").start(() -> properties.preloadSeasons()
			.stream()
			.filter(season -> !ingestService.isLoaded(season))
			.forEach(season -> ingestService.ingest(season, Trigger.STARTUP)));
	}

	/** Monday morning, after the race weekend. */
	@Scheduled(cron = "${ingest.refresh-cron:0 0 6 * * MON}", zone = "UTC")
	public void refreshCurrentSeason() {
		ingestService.ingest(seasonYears.current(), Trigger.SCHEDULED);
	}

}

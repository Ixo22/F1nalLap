package com.f1nallap.ingest;

import java.time.Instant;

public record IngestRunDto(long id, int season, String trigger, String status, Instant startedAt,
		Instant finishedAt, Integer requests, Integer rowsWritten, String error) {

	static IngestRunDto from(IngestRun run) {
		return new IngestRunDto(run.getId(), run.getSeasonYear(), run.getTrigger().name(),
				run.getStatus().name(), run.getStartedAt(), run.getFinishedAt(), run.getRequests(),
				run.getRowsWritten(), run.getError());
	}

}

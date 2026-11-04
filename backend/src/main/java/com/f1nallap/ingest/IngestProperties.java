package com.f1nallap.ingest;

import java.time.Duration;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Settings under the ingest prefix in application.yml.
 *
 * @param baseUrl Jolpica base URL
 * @param pageSize page size for paginated endpoints (Jolpica maximum is 100)
 * @param minInterval minimum pause between two requests (Jolpica allows 4 per second)
 * @param connectTimeout HTTP connect timeout
 * @param readTimeout HTTP read timeout
 * @param preloadSeasons seasons loaded in the background when the app starts
 * @param currentSeasonTtl how long data of a season still in progress is considered fresh
 * @param adminApiKey key required in the X-Api-Key header by admin endpoints (blank disables them)
 */
@ConfigurationProperties(prefix = "ingest")
public record IngestProperties(String baseUrl, int pageSize, Duration minInterval,
		Duration connectTimeout, Duration readTimeout, List<Integer> preloadSeasons,
		Duration currentSeasonTtl, String adminApiKey) {

	public IngestProperties {
		preloadSeasons = preloadSeasons == null ? List.of() : List.copyOf(preloadSeasons);
	}

}

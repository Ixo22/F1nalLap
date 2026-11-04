package com.f1nallap.ingest;

import org.springframework.resilience.annotation.Retryable;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;

/**
 * Wraps JolpicaClient with retries. 429 (too many requests), 5xx and network errors are retried
 * with exponential backoff; any other 4xx fails at once because repeating it would not help.
 */
@Component
public class JolpicaGateway {

	public enum Endpoint {
		SCHEDULE, RESULTS, DRIVER_STANDINGS, CONSTRUCTOR_STANDINGS
	}

	private final JolpicaClient client;

	public JolpicaGateway(JolpicaClient client) {
		this.client = client;
	}

	@Retryable(includes = { HttpClientErrorException.TooManyRequests.class,
			HttpServerErrorException.class, ResourceAccessException.class },
			maxRetriesString = "${ingest.retry.max-retries:3}",
			delayString = "${ingest.retry.delay:1s}", multiplier = 2)
	public JolpicaModels.Response fetch(Endpoint endpoint, int season, int limit, int offset) {
		return switch (endpoint) {
			case SCHEDULE -> client.schedule(season, limit, offset);
			case RESULTS -> client.results(season, limit, offset);
			case DRIVER_STANDINGS -> client.driverStandings(season, limit, offset);
			case CONSTRUCTOR_STANDINGS -> client.constructorStandings(season, limit, offset);
		};
	}

}

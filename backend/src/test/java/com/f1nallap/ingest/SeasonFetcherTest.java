package com.f1nallap.ingest;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.getRequestedFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlPathEqualTo;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.github.tomakehurst.wiremock.junit5.WireMockExtension;
import com.github.tomakehurst.wiremock.stubbing.Scenario;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.web.client.HttpClientErrorException;

/** HTTP side of the ingest, against WireMock. No test calls the real Jolpica API. */
@SpringJUnitConfig({ JolpicaClientConfig.class, JolpicaGateway.class, SeasonFetcher.class })
@TestPropertySource(properties = { "ingest.page-size=100", "ingest.min-interval=0ms",
		"ingest.connect-timeout=2s", "ingest.read-timeout=5s", "ingest.current-season-ttl=6h",
		"ingest.retry.max-retries=3", "ingest.retry.delay=10ms" })
class SeasonFetcherTest {

	@RegisterExtension
	static WireMockExtension wm = WireMockExtension.newInstance()
		.options(wireMockConfig().dynamicPort())
		.build();

	@DynamicPropertySource
	static void baseUrl(DynamicPropertyRegistry registry) {
		registry.add("ingest.base-url", wm::baseUrl);
	}

	@Autowired
	private SeasonFetcher fetcher;

	@Test
	void fetchesWholeSeasonFollowingPagination() {
		JolpicaStubs.stubSeason(wm);

		SeasonData data = fetcher.fetch(JolpicaStubs.SEASON);

		assertThat(data.schedule()).hasSize(7);
		assertThat(data.resultsByRace()).hasSize(7);
		assertThat(data.resultsByRace().stream().mapToInt(r -> r.results().size()).sum()).isEqualTo(160);
		assertThat(data.resultsByRace().get(4).results()).hasSize(14);
		assertThat(data.driverStandings()).hasSize(81);
		assertThat(data.constructorStandings()).isEmpty();
		assertThat(wm.getAllServeEvents()).hasSize(JolpicaStubs.EXPECTED_REQUESTS);
	}

	@Test
	void retriesWhenRateLimited() {
		JolpicaStubs.stubSeason(wm);
		wm.stubFor(get(urlPathEqualTo("/1950.json")).inScenario("rate-limit")
			.whenScenarioStateIs(Scenario.STARTED)
			.willReturn(aResponse().withStatus(429))
			.willSetStateTo("recovered"));
		wm.stubFor(get(urlPathEqualTo("/1950.json")).inScenario("rate-limit")
			.whenScenarioStateIs("recovered")
			.willReturn(aResponse().withHeader("Content-Type", "application/json")
				.withBody(JolpicaStubs.read("schedule.json"))));

		SeasonData data = fetcher.fetch(JolpicaStubs.SEASON);

		assertThat(data.schedule()).hasSize(7);
		wm.verify(2, getRequestedFor(urlPathEqualTo("/1950.json")));
	}

	@Test
	void doesNotRetryClientErrors() {
		wm.stubFor(get(urlPathEqualTo("/1950.json")).willReturn(aResponse().withStatus(404)));

		assertThatThrownBy(() -> fetcher.fetch(JolpicaStubs.SEASON))
			.isInstanceOf(HttpClientErrorException.NotFound.class);
		wm.verify(1, getRequestedFor(urlPathEqualTo("/1950.json")));
	}

	@Test
	void givesUpAfterMaxRetriesOnServerErrors() {
		wm.stubFor(get(urlPathEqualTo("/1950.json")).willReturn(aResponse().withStatus(500)));

		assertThatThrownBy(() -> fetcher.fetch(JolpicaStubs.SEASON)).isInstanceOf(RuntimeException.class);
		wm.verify(4, getRequestedFor(urlPathEqualTo("/1950.json")));
	}

}

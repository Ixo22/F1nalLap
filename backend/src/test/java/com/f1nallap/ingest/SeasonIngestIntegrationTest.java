package com.f1nallap.ingest;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.urlPathEqualTo;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.f1nallap.TestcontainersConfiguration;
import com.f1nallap.ingest.IngestRun.Status;
import com.f1nallap.ingest.IngestRun.Trigger;
import com.f1nallap.season.RaceResultRepository;
import com.github.tomakehurst.wiremock.junit5.WireMockExtension;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

/** Full flow: Jolpica (WireMock) to Postgres (Testcontainers) to the REST API. */
@Tag("docker")
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestcontainersConfiguration.class)
class SeasonIngestIntegrationTest {

	@RegisterExtension
	static WireMockExtension wm = WireMockExtension.newInstance()
		.options(wireMockConfig().dynamicPort())
		.build();

	@DynamicPropertySource
	static void jolpica(DynamicPropertyRegistry registry) {
		registry.add("ingest.base-url", wm::baseUrl);
	}

	@Autowired
	private SeasonIngestService ingestService;

	@Autowired
	private RaceResultRepository results;

	@Autowired
	private JdbcTemplate jdbc;

	@Autowired
	private MockMvc mvc;

	@Test
	void ingestingTwiceLeavesTheSameRows() {
		JolpicaStubs.stubSeason(wm);

		IngestRun first = ingestService.ingest(JolpicaStubs.SEASON, Trigger.ADMIN);
		long resultsAfterFirst = count("race_result");
		IngestRun second = ingestService.ingest(JolpicaStubs.SEASON, Trigger.ADMIN);

		assertThat(first.getStatus()).isEqualTo(Status.SUCCESS);
		assertThat(first.getRowsWritten()).isEqualTo(JolpicaStubs.EXPECTED_ROWS);
		assertThat(first.getRequests()).isEqualTo(JolpicaStubs.EXPECTED_REQUESTS);
		assertThat(second.getRowsWritten()).isEqualTo(first.getRowsWritten());
		assertThat(count("race_result")).isEqualTo(resultsAfterFirst).isEqualTo(160);
		assertThat(count("race")).isEqualTo(7);
		assertThat(results.findByRace(1950, 1)).first()
			.satisfies(r -> assertThat(r.getDriver().getFamilyName()).isEqualTo("Farina"));
	}

	@Test
	void apiServesTheIngestedSeason() throws Exception {
		JolpicaStubs.stubSeason(wm);
		ingestService.ingest(JolpicaStubs.SEASON, Trigger.ADMIN);

		mvc.perform(get("/api/v1/seasons/1950/results"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.length()").value(7))
			.andExpect(jsonPath("$[4].results.length()").value(14));
		mvc.perform(get("/api/v1/seasons/1950/standings/drivers"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[0].driver.familyName").value("Farina"))
			.andExpect(jsonPath("$[0].constructors[0].name").value("Alfa Romeo"));
		mvc.perform(get("/api/v1/seasons/1950/winners"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.length()").value(7));
	}

	@Test
	void upstreamFailureIsRecordedAsFailedRun() {
		wm.stubFor(com.github.tomakehurst.wiremock.client.WireMock.get(urlPathEqualTo("/1951.json")).willReturn(aResponse().withStatus(500)));

		IngestRun run = ingestService.ingest(1951, Trigger.ADMIN);

		assertThat(run.getStatus()).isEqualTo(Status.FAILED);
		assertThat(run.getError()).contains("500");
		assertThat(jdbc.queryForObject("select status from ingest_run where id = ?", String.class,
				run.getId())).isEqualTo("FAILED");
	}

	private long count(String table) {
		return jdbc.queryForObject("select count(*) from " + table, Long.class);
	}

}

package com.f1nallap.ingest;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.urlPathEqualTo;

import com.github.tomakehurst.wiremock.junit5.WireMockExtension;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import org.springframework.core.io.ClassPathResource;

/** Serves the real 1950 Jolpica responses saved in src/test/resources/jolpica. */
final class JolpicaStubs {

	static final int SEASON = 1950;

	/** 7 races, 160 results (2 pages, round 5 split between them), 81 driver standings. */
	static final int EXPECTED_ROWS = 7 + 160 + 81;

	static final int EXPECTED_REQUESTS = 5;

	private JolpicaStubs() {
	}

	static void stubSeason(WireMockExtension wm) {
		stub(wm, "/1950.json", 0, "schedule.json");
		stub(wm, "/1950/results.json", 0, "results-0.json");
		stub(wm, "/1950/results.json", 100, "results-100.json");
		stub(wm, "/1950/driverstandings.json", 0, "driverstandings.json");
		stub(wm, "/1950/constructorstandings.json", 0, "constructorstandings.json");
	}

	static void stub(WireMockExtension wm, String path, int offset, String file) {
		wm.stubFor(get(urlPathEqualTo(path))
			.withQueryParam("offset", com.github.tomakehurst.wiremock.client.WireMock.equalTo(String.valueOf(offset)))
			.willReturn(aResponse().withHeader("Content-Type", "application/json").withBody(read(file))));
	}

	static String read(String file) {
		try {
			return new ClassPathResource("jolpica/" + file).getContentAsString(StandardCharsets.UTF_8);
		}
		catch (IOException ex) {
			throw new UncheckedIOException(ex);
		}
	}

}

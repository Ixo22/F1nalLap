package com.f1nallap.season;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.f1nallap.common.CacheHeaders;
import com.f1nallap.common.ClockConfig;
import com.f1nallap.common.NotFoundException;
import com.f1nallap.common.SeasonYears;
import com.f1nallap.ingest.IngestProperties;
import com.f1nallap.season.SeasonDtos.ConstructorDto;
import com.f1nallap.season.SeasonDtos.DriverDto;
import com.f1nallap.season.SeasonDtos.RaceResultsDto;
import com.f1nallap.season.SeasonDtos.ResultDto;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(SeasonController.class)
@Import({ CacheHeaders.class, SeasonYears.class, ClockConfig.class,
		SeasonControllerTest.Props.class })
class SeasonControllerTest {

	@TestConfiguration
	@EnableConfigurationProperties(IngestProperties.class)
	static class Props {

	}

	@Autowired
	private MockMvc mvc;

	@MockitoBean
	private SeasonQueryService service;

	private static final ResultDto WINNER = new ResultDto(1, "1",
			new DriverDto("farina", null, "Nino", "Farina", "Italian", null),
			new ConstructorDto("alfa", "Alfa Romeo", "Swiss"), 1, 9, "Finished", 70, null);

	@Test
	void returnsSeasonResultsWithLongCacheForClosedSeasons() throws Exception {
		given(service.seasonResults(1950)).willReturn(List.of(new RaceResultsDto(1,
				"British Grand Prix", LocalDate.of(1950, 5, 13), "silverstone", List.of(WINNER))));

		mvc.perform(get("/api/v1/seasons/1950/results"))
			.andExpect(status().isOk())
			.andExpect(header().string("Cache-Control", "max-age=604800, public"))
			.andExpect(jsonPath("$[0].name").value("British Grand Prix"))
			.andExpect(jsonPath("$[0].date").value("1950-05-13"))
			.andExpect(jsonPath("$[0].results[0].driver.familyName").value("Farina"))
			.andExpect(jsonPath("$[0].results[0].points").value(9.0));
	}

	@Test
	void invalidSeasonReturnsProblemDetail() throws Exception {
		given(service.races(1900)).willThrow(new IllegalArgumentException("Season must be between 1950 and 2026."));

		mvc.perform(get("/api/v1/seasons/1900/races"))
			.andExpect(status().isBadRequest())
			.andExpect(header().string("Content-Type", "application/problem+json"))
			.andExpect(jsonPath("$.title").value("Invalid request"))
			.andExpect(jsonPath("$.trace").doesNotExist());
	}

	@Test
	void unknownRoundReturns404() throws Exception {
		given(service.raceResults(1950, 99)).willThrow(new NotFoundException("Season 1950 has no round 99."));

		mvc.perform(get("/api/v1/seasons/1950/races/99/results"))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.detail").value("Season 1950 has no round 99."));
	}

	@Test
	void nonNumericSeasonIsABadRequest() throws Exception {
		mvc.perform(get("/api/v1/seasons/abc/races")).andExpect(status().isBadRequest());
	}

}

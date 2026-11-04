package com.f1nallap;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** Boots the full application against a real Postgres started by Testcontainers. */
@Tag("docker")
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestcontainersConfiguration.class)
class F1nalLapApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void healthEndpointReportsUp() throws Exception {
		mockMvc.perform(get("/actuator/health"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.status").value("UP"));
	}

	@Test
	void onlyHealthAndInfoAreExposed() throws Exception {
		mockMvc.perform(get("/actuator/env")).andExpect(status().isNotFound());
	}

	@Test
	void flywaySeedsTheCircuitCatalogue() throws Exception {
		mockMvc.perform(get("/api/v1/circuits"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.length()").value(24))
			.andExpect(jsonPath("$[0].circuitRef").value("albert_park"))
			.andExpect(jsonPath("$[0].lapRecordMs").value(79813));
	}

	@Test
	void simulatorReturnsTopThreeStrategies() throws Exception {
		mockMvc.perform(get("/api/v1/circuits/monza/strategies/best"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.length()").value(3));
	}

	@Test
	void simulationRejectsWrongLapCount() throws Exception {
		mockMvc.perform(post("/api/v1/circuits/monza/strategies/simulate")
			.contentType(MediaType.APPLICATION_JSON)
			.content("{\"stints\":[{\"compound\":\"SOFT\",\"laps\":10}]}"))
			.andExpect(status().isBadRequest());
	}

	@Test
	void adminEndpointsRequireApiKey() throws Exception {
		mockMvc.perform(post("/admin/ingest/2024")).andExpect(status().isUnauthorized());
	}

}

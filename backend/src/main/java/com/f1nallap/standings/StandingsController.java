package com.f1nallap.standings;

import com.f1nallap.common.CacheHeaders;
import com.f1nallap.standings.StandingsDtos.ConstructorStandingDto;
import com.f1nallap.standings.StandingsDtos.DriverStandingDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/seasons/{season}/standings")
@Tag(name = "Standings", description = "Driver and constructor championships")
public class StandingsController {

	private final StandingsService service;

	private final CacheHeaders cacheHeaders;

	public StandingsController(StandingsService service, CacheHeaders cacheHeaders) {
		this.service = service;
		this.cacheHeaders = cacheHeaders;
	}

	@GetMapping("/drivers")
	@Operation(summary = "Driver championship standings")
	public ResponseEntity<List<DriverStandingDto>> drivers(@PathVariable int season) {
		return ResponseEntity.ok()
			.cacheControl(cacheHeaders.forSeason(season))
			.body(service.drivers(season));
	}

	@GetMapping("/constructors")
	@Operation(summary = "Constructor championship standings")
	public ResponseEntity<List<ConstructorStandingDto>> constructors(@PathVariable int season) {
		return ResponseEntity.ok()
			.cacheControl(cacheHeaders.forSeason(season))
			.body(service.constructors(season));
	}

}

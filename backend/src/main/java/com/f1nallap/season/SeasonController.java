package com.f1nallap.season;

import com.f1nallap.common.CacheHeaders;
import com.f1nallap.season.SeasonDtos.RaceDto;
import com.f1nallap.season.SeasonDtos.RaceResultsDto;
import com.f1nallap.season.SeasonDtos.RaceWinnerDto;
import com.f1nallap.season.SeasonDtos.ResultDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/seasons/{season}")
@Tag(name = "Seasons", description = "Races and results")
public class SeasonController {

	private final SeasonQueryService service;

	private final CacheHeaders cacheHeaders;

	public SeasonController(SeasonQueryService service, CacheHeaders cacheHeaders) {
		this.service = service;
		this.cacheHeaders = cacheHeaders;
	}

	@GetMapping("/races")
	@Operation(summary = "Season calendar")
	public ResponseEntity<List<RaceDto>> races(@PathVariable int season) {
		return ok(season, service.races(season));
	}

	@GetMapping("/races/{round}/results")
	@Operation(summary = "Classification of one race")
	public ResponseEntity<List<ResultDto>> raceResults(@PathVariable int season,
			@PathVariable int round) {
		return ok(season, service.raceResults(season, round));
	}

	@GetMapping("/results")
	@Operation(summary = "Every race of the season with its classification, in one response")
	public ResponseEntity<List<RaceResultsDto>> seasonResults(@PathVariable int season) {
		return ok(season, service.seasonResults(season));
	}

	@GetMapping("/winners")
	@Operation(summary = "Winner of each race")
	public ResponseEntity<List<RaceWinnerDto>> winners(@PathVariable int season) {
		return ok(season, service.winners(season));
	}

	private <T> ResponseEntity<T> ok(int season, T body) {
		return ResponseEntity.ok().cacheControl(cacheHeaders.forSeason(season)).body(body);
	}

}

package com.f1nallap.season;

import com.f1nallap.common.NotFoundException;
import com.f1nallap.common.SeasonYears;
import com.f1nallap.ingest.SeasonIngestService;
import com.f1nallap.season.SeasonDtos.RaceDto;
import com.f1nallap.season.SeasonDtos.RaceResultsDto;
import com.f1nallap.season.SeasonDtos.RaceWinnerDto;
import com.f1nallap.season.SeasonDtos.ResultDto;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class SeasonQueryService {

	private final SeasonIngestService ingestService;

	private final RaceRepository races;

	private final RaceResultRepository results;

	private final SeasonYears seasonYears;

	public SeasonQueryService(SeasonIngestService ingestService, RaceRepository races,
			RaceResultRepository results, SeasonYears seasonYears) {
		this.ingestService = ingestService;
		this.races = races;
		this.results = results;
		this.seasonYears = seasonYears;
	}

	public List<RaceDto> races(int season) {
		load(season);
		return races.findBySeasonYearOrderByRoundAsc(season).stream().map(RaceDto::from).toList();
	}

	public List<ResultDto> raceResults(int season, int round) {
		seasonYears.validateRound(round);
		load(season);
		if (!races.existsBySeasonYearAndRound(season, round)) {
			throw new NotFoundException("Season %d has no round %d.".formatted(season, round));
		}
		return results.findByRace(season, round).stream().map(ResultDto::from).toList();
	}

	/** Whole season in one response: replaces one request per race in the front-end. */
	public List<RaceResultsDto> seasonResults(int season) {
		load(season);
		Map<Integer, List<ResultDto>> byRound = results.findBySeason(season)
			.stream()
			.collect(Collectors.groupingBy(r -> r.getRace().getRound(),
					Collectors.mapping(ResultDto::from, Collectors.toList())));
		return races.findBySeasonYearOrderByRoundAsc(season)
			.stream()
			.map(r -> new RaceResultsDto(r.getRound(), r.getName(), r.getDate(), r.getCircuitRef(),
					byRound.getOrDefault(r.getRound(), List.of())))
			.toList();
	}

	public List<RaceWinnerDto> winners(int season) {
		load(season);
		return results.findWinnersBySeason(season)
			.stream()
			.map(r -> new RaceWinnerDto(r.getRace().getRound(), r.getRace().getName(),
					r.getRace().getDate(), r.getRace().getCircuitRef(), ResultDto.from(r)))
			.toList();
	}

	private void load(int season) {
		seasonYears.validate(season);
		ingestService.ensureLoaded(season);
	}

}

package com.f1nallap.standings;

import com.f1nallap.common.SeasonYears;
import com.f1nallap.ingest.SeasonIngestService;
import com.f1nallap.standings.StandingsDtos.ConstructorStandingDto;
import com.f1nallap.standings.StandingsDtos.DriverStandingDto;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class StandingsService {

	private final SeasonIngestService ingestService;

	private final DriverStandingRepository driverStandings;

	private final ConstructorStandingRepository constructorStandings;

	private final SeasonYears seasonYears;

	public StandingsService(SeasonIngestService ingestService,
			DriverStandingRepository driverStandings,
			ConstructorStandingRepository constructorStandings, SeasonYears seasonYears) {
		this.ingestService = ingestService;
		this.driverStandings = driverStandings;
		this.constructorStandings = constructorStandings;
		this.seasonYears = seasonYears;
	}

	public List<DriverStandingDto> drivers(int season) {
		load(season);
		return readDrivers(season);
	}

	public List<ConstructorStandingDto> constructors(int season) {
		load(season);
		return constructorStandings.findBySeason(season)
			.stream()
			.map(ConstructorStandingDto::from)
			.toList();
	}

	private List<DriverStandingDto> readDrivers(int season) {
		return driverStandings.findBySeasonYearOrderByIdAsc(season)
			.stream()
			.map(DriverStandingDto::from)
			.toList();
	}

	private void load(int season) {
		seasonYears.validate(season);
		ingestService.ensureLoaded(season);
	}

}

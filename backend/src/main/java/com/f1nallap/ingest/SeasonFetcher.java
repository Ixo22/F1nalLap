package com.f1nallap.ingest;

import com.f1nallap.ingest.JolpicaGateway.Endpoint;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import org.springframework.stereotype.Component;

/**
 * Downloads a full season with as few requests as possible: the whole season of results is paged
 * (100 per page) instead of asking race by race. A season costs about 8 requests.
 */
@Component
public class SeasonFetcher {

	private final JolpicaGateway gateway;

	private final int pageSize;

	public SeasonFetcher(JolpicaGateway gateway, IngestProperties properties) {
		this.gateway = gateway;
		this.pageSize = properties.pageSize();
	}

	public SeasonData fetch(int season) {
		List<JolpicaModels.Race> schedule = fetchAll(Endpoint.SCHEDULE, season, SeasonFetcher::races);
		List<JolpicaModels.Race> resultPages = fetchAll(Endpoint.RESULTS, season, SeasonFetcher::races);
		List<JolpicaModels.DriverStanding> drivers = fetchAll(Endpoint.DRIVER_STANDINGS, season,
				data -> standings(data).flatMap(list -> Optional.ofNullable(list.driverStandings()))
					.orElse(List.of()));
		List<JolpicaModels.ConstructorStanding> constructors = fetchAll(Endpoint.CONSTRUCTOR_STANDINGS,
				season, data -> standings(data)
					.flatMap(list -> Optional.ofNullable(list.constructorStandings()))
					.orElse(List.of()));
		return new SeasonData(season, schedule, mergeByRound(resultPages), drivers, constructors);
	}

	/** Requests page after page until MRData.total items have been read. */
	private <T> List<T> fetchAll(Endpoint endpoint, int season,
			Function<JolpicaModels.MrData, List<T>> extractor) {
		List<T> items = new ArrayList<>();
		int offset = 0;
		int total;
		do {
			JolpicaModels.MrData data = gateway.fetch(endpoint, season, pageSize, offset).mrData();
			items.addAll(extractor.apply(data));
			total = data.totalAsInt();
			offset += pageSize;
		}
		while (offset < total);
		return items;
	}

	private static List<JolpicaModels.Race> races(JolpicaModels.MrData data) {
		return data.raceTable() == null || data.raceTable().races() == null ? List.of()
				: data.raceTable().races();
	}

	/** Standings come as one list per season (the list for the final round). */
	private static Optional<JolpicaModels.StandingsList> standings(JolpicaModels.MrData data) {
		if (data.standingsTable() == null || data.standingsTable().standingsLists() == null) {
			return Optional.empty();
		}
		return data.standingsTable().standingsLists().stream().findFirst();
	}

	/**
	 * Results are paged by result, not by race, so a race can be split across two pages.
	 * This joins the pieces back together, keeping the original order.
	 */
	static List<JolpicaModels.Race> mergeByRound(List<JolpicaModels.Race> pages) {
		Map<String, JolpicaModels.Race> byRound = new LinkedHashMap<>();
		for (JolpicaModels.Race race : pages) {
			List<JolpicaModels.Result> results = race.results() == null ? List.of() : race.results();
			byRound.merge(race.round(), withResults(race, new ArrayList<>(results)), (existing, next) -> {
				existing.results().addAll(next.results());
				return existing;
			});
		}
		return List.copyOf(byRound.values());
	}

	private static JolpicaModels.Race withResults(JolpicaModels.Race race,
			List<JolpicaModels.Result> results) {
		return new JolpicaModels.Race(race.season(), race.round(), race.raceName(), race.date(),
				race.circuit(), results);
	}

}

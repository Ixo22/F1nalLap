package com.f1nallap.ingest;

import java.util.List;

/** Everything downloaded from Jolpica for one season, ready to be written to the database. */
public record SeasonData(int season, List<JolpicaModels.Race> schedule,
		List<JolpicaModels.Race> resultsByRace, List<JolpicaModels.DriverStanding> driverStandings,
		List<JolpicaModels.ConstructorStanding> constructorStandings) {
}

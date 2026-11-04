package com.f1nallap.ingest;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Java mirror of the Jolpica (Ergast-compatible) JSON. Only the fields the app uses are mapped;
 * Jolpica sends every value as a string.
 */
public final class JolpicaModels {

	private JolpicaModels() {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	public record Response(@JsonProperty("MRData") MrData mrData) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	public record MrData(String limit, String offset, String total,
			@JsonProperty("RaceTable") RaceTable raceTable,
			@JsonProperty("StandingsTable") StandingsTable standingsTable) {

		public int totalAsInt() {
			return total == null ? 0 : Integer.parseInt(total);
		}

	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	public record RaceTable(@JsonProperty("Races") List<Race> races) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	public record Race(String season, String round, String raceName, String date,
			@JsonProperty("Circuit") Circuit circuit, @JsonProperty("Results") List<Result> results) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	public record Circuit(String circuitId, String circuitName) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	public record Result(String position, String positionText, String points, String grid,
			String laps, String status, @JsonProperty("Driver") Driver driver,
			@JsonProperty("Constructor") Constructor constructor,
			@JsonProperty("FastestLap") FastestLap fastestLap) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	public record FastestLap(@JsonProperty("Time") LapTime time) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	public record LapTime(String time) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	public record Driver(String driverId, String permanentNumber, String code, String givenName,
			String familyName, String nationality) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	public record Constructor(String constructorId, String name, String nationality) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	public record StandingsTable(@JsonProperty("StandingsLists") List<StandingsList> standingsLists) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	public record StandingsList(
			@JsonProperty("DriverStandings") List<DriverStanding> driverStandings,
			@JsonProperty("ConstructorStandings") List<ConstructorStanding> constructorStandings) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	public record DriverStanding(String position, String positionText, String points, String wins,
			@JsonProperty("Driver") Driver driver,
			@JsonProperty("Constructors") List<Constructor> constructors) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	public record ConstructorStanding(String position, String positionText, String points,
			String wins, @JsonProperty("Constructor") Constructor constructor) {
	}

}

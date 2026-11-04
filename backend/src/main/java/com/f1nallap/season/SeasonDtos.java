package com.f1nallap.season;

import java.time.LocalDate;
import java.util.List;

/** Response bodies of the season endpoints. Entities never leave the service layer. */
public final class SeasonDtos {

	private SeasonDtos() {
	}

	public record DriverDto(String driverRef, String code, String givenName, String familyName,
			String nationality, Integer permanentNumber) {

		public static DriverDto from(Driver d) {
			return new DriverDto(d.getDriverRef(), d.getCode(), d.getGivenName(), d.getFamilyName(),
					d.getNationality(), d.getPermanentNumber());
		}

	}

	public record ConstructorDto(String constructorRef, String name, String nationality) {

		public static ConstructorDto from(Constructor c) {
			return new ConstructorDto(c.getConstructorRef(), c.getName(), c.getNationality());
		}

	}

	public record RaceDto(int season, int round, String name, LocalDate date, String circuitRef,
			String circuitName) {

		public static RaceDto from(Race r) {
			return new RaceDto(r.getSeasonYear(), r.getRound(), r.getName(), r.getDate(),
					r.getCircuitRef(), r.getCircuitName());
		}

	}

	public record ResultDto(int position, String positionText, DriverDto driver,
			ConstructorDto constructor, Integer grid, double points, String status, Integer laps,
			String fastestLapTime) {

		public static ResultDto from(RaceResult r) {
			return new ResultDto(r.getPosition(), r.getPositionText(), DriverDto.from(r.getDriver()),
					ConstructorDto.from(r.getConstructor()), r.getGrid(), r.getPoints().doubleValue(),
					r.getStatus(), r.getLaps(), r.getFastestLapTime());
		}

	}

	/** A race with its classification. Races not run yet have an empty list. */
	public record RaceResultsDto(int round, String name, LocalDate date, String circuitRef,
			List<ResultDto> results) {
	}

	public record RaceWinnerDto(int round, String name, LocalDate date, String circuitRef,
			ResultDto winner) {
	}

}

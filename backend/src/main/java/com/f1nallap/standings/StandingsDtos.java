package com.f1nallap.standings;

import com.f1nallap.season.SeasonDtos.ConstructorDto;
import com.f1nallap.season.SeasonDtos.DriverDto;
import java.util.List;

public final class StandingsDtos {

	private StandingsDtos() {
	}

	/** position is null when the driver was excluded; positionText then explains why (e.g. "D"). */
	public record DriverStandingDto(Integer position, String positionText, double points, int wins,
			DriverDto driver, List<ConstructorDto> constructors) {

		static DriverStandingDto from(DriverStanding s) {
			return new DriverStandingDto(s.getPosition(), s.getPositionText(),
					s.getPoints().doubleValue(), s.getWins(), DriverDto.from(s.getDriver()),
					s.getConstructors().stream().map(ConstructorDto::from).toList());
		}

	}

	public record ConstructorStandingDto(Integer position, String positionText, double points,
			int wins, ConstructorDto constructor) {

		static ConstructorStandingDto from(ConstructorStanding s) {
			return new ConstructorStandingDto(s.getPosition(), s.getPositionText(),
					s.getPoints().doubleValue(), s.getWins(), ConstructorDto.from(s.getConstructor()));
		}

	}

}

package com.f1nallap.common;

import java.time.Clock;
import java.time.Year;
import org.springframework.stereotype.Component;

/** Validates season years: the first F1 season was 1950 and data cannot exist for future years. */
@Component
public class SeasonYears {

	public static final int FIRST_SEASON = 1950;

	private final Clock clock;

	public SeasonYears(Clock clock) {
		this.clock = clock;
	}

	public int current() {
		return Year.now(clock).getValue();
	}

	public void validate(int season) {
		if (season < FIRST_SEASON || season > current()) {
			throw new IllegalArgumentException(
					"Season must be between %d and %d.".formatted(FIRST_SEASON, current()));
		}
	}

	public void validateRound(int round) {
		if (round < 1) {
			throw new IllegalArgumentException("Round must be greater than 0.");
		}
	}

}

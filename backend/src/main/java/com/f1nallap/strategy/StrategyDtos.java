package com.f1nallap.strategy;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.List;

public final class StrategyDtos {

	private StrategyDtos() {
	}

	public record Stint(@NotNull Compound compound, @Positive int laps) {
	}

	/** rank is null for a user-defined simulation. */
	public record StrategyResult(Integer rank, int stops, List<Stint> stints, double totalTimeSeconds,
			String formattedTime) {
	}

	public record SimulationRequest(@NotEmpty List<@Valid Stint> stints) {
	}

	public enum Phase {
		INITIAL, MIDDLE, END
	}

	public record DegradationPoint(int lap, Phase phase, double degradationSeconds) {
	}

	public record Degradation(Compound compound, int tyreLife, List<DegradationPoint> laps) {
	}

}

package com.f1nallap.strategy;

import com.f1nallap.strategy.StrategyDtos.Phase;
import com.f1nallap.strategy.StrategyProperties.Range;
import com.f1nallap.strategy.StrategyProperties.TyreSpec;
import java.util.random.RandomGenerator;
import org.springframework.stereotype.Component;

/**
 * Tyre degradation per lap. The randomness comes from the RandomGenerator passed in, so a seeded
 * generator makes every simulation reproducible (and testable).
 */
@Component
public class LapTimeModel {

	private final StrategyProperties properties;

	public LapTimeModel(StrategyProperties properties) {
		this.properties = properties;
	}

	/**
	 * Phase of a lap inside a stint, counted from 0: initial up to initialPhaseLastLap (so the
	 * initial phase lasts 6 laps), middle up to half the tyre life, then end.
	 */
	public Phase phase(Compound compound, int lapInStint) {
		int halfLife = properties.tyre(compound).life() / 2;
		if (lapInStint <= properties.initialPhaseLastLap()) {
			return Phase.INITIAL;
		}
		return lapInStint <= halfLife ? Phase.MIDDLE : Phase.END;
	}

	/** Normal degradation of one lap (no wear-out penalty). */
	public double degradation(Compound compound, int lapInStint, RandomGenerator random) {
		TyreSpec tyre = properties.tyre(compound);
		Range range = switch (phase(compound, lapInStint)) {
			case INITIAL -> tyre.initial();
			case MIDDLE -> tyre.middle();
			case END -> tyre.end();
		};
		return random.nextDouble() * (range.max() - range.min()) + range.min();
	}

	/** Extra time per lap once a tyre is used beyond its life: grows quickly with every lap. */
	public double wornOutPenalty(int lapsBeyondLife) {
		return 0.5 + Math.pow(lapsBeyondLife, 1.5) * 1.5;
	}

	/** Base lap time of a compound: the lap record plus the compound offset. */
	public double baseLapTime(Compound compound, int lapRecordMs) {
		return lapRecordMs / 1000.0 + properties.tyre(compound).baseOffsetSeconds();
	}

	public int tyreLife(Compound compound) {
		return properties.tyre(compound).life();
	}

}

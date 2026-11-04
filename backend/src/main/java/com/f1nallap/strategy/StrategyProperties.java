package com.f1nallap.strategy;

import java.util.Map;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Simulator tuning, read from the strategy prefix in application.yml. These were magic numbers
 * in the original TypeScript; they keep the same values.
 *
 * @param pitStopSeconds time lost in each pit stop
 * @param sameCompoundPenaltySeconds ranking penalty when the first two stints of a three-stint
 * strategy use the same compound
 * @param oneStopBonusSeconds ranking bonus for one-stop strategies
 * @param similarityThresholdLaps two strategies with the same compounds whose stints differ by at
 * most this many laps are considered the same when picking the top 3
 * @param initialPhaseLastLap last lap (counted from 0) of the initial degradation phase
 * @param seed random seed: the same circuit always gives the same result
 * @param tyres per-compound properties
 */
@ConfigurationProperties(prefix = "strategy")
public record StrategyProperties(double pitStopSeconds, double sameCompoundPenaltySeconds,
		double oneStopBonusSeconds, int similarityThresholdLaps, int initialPhaseLastLap, long seed,
		Map<Compound, TyreSpec> tyres) {

	/**
	 * @param life laps the tyre lasts before it is worn out
	 * @param minLaps shortest stint the generator tries
	 * @param maxLaps longest stint the generator tries
	 * @param baseOffsetSeconds lap time added to the lap record (soft is the reference)
	 * @param initial degradation per lap in the initial phase
	 * @param middle degradation per lap in the middle phase
	 * @param end degradation per lap in the final phase
	 */
	public record TyreSpec(int life, int minLaps, int maxLaps, double baseOffsetSeconds, Range initial,
			Range middle, Range end) {
	}

	/** Degradation range in seconds; a random value inside it is drawn for every lap. */
	public record Range(double min, double max) {
	}

	public TyreSpec tyre(Compound compound) {
		return tyres.get(compound);
	}

}

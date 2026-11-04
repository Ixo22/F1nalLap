package com.f1nallap.strategy;

import com.f1nallap.strategy.StrategyDtos.Degradation;
import com.f1nallap.strategy.StrategyDtos.DegradationPoint;
import com.f1nallap.strategy.StrategyDtos.Stint;
import com.f1nallap.strategy.StrategyDtos.StrategyResult;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.random.RandomGenerator;
import org.springframework.stereotype.Component;

/** Simulates race strategies. Pure logic: no Spring MVC or database here. */
@Component
public class StrategySimulator {

	private static final int TOP = 3;

	private final StrategyGenerator generator;

	private final LapTimeModel model;

	private final StrategyProperties properties;

	public StrategySimulator(StrategyGenerator generator, LapTimeModel model,
			StrategyProperties properties) {
		this.generator = generator;
		this.model = model;
		this.properties = properties;
	}

	private record Candidate(double rankingTime, double raceTime, List<Stint> stints) {
	}

	/** Simulates every legal strategy and returns the 3 fastest that are meaningfully different. */
	public List<StrategyResult> best(int totalLaps, int lapRecordMs, RandomGenerator random) {
		List<Candidate> candidates = new ArrayList<>();
		for (List<Stint> strategy : generator.generate(totalLaps)) {
			simulateLegal(strategy, lapRecordMs, random).ifPresent(candidates::add);
		}
		candidates.sort(Comparator.comparingDouble(Candidate::rankingTime));

		List<Candidate> top = new ArrayList<>();
		for (Candidate candidate : candidates) {
			if (top.stream().allMatch(t -> differ(candidate.stints(), t.stints()))) {
				top.add(candidate);
			}
			if (top.size() == TOP) {
				break;
			}
		}

		List<StrategyResult> results = new ArrayList<>();
		for (int i = 0; i < top.size(); i++) {
			Candidate c = top.get(i);
			results.add(result(i + 1, c.stints(), c.raceTime()));
		}
		return results;
	}

	/**
	 * Simulates a strategy chosen by the user. No legality filter: a stint longer than the tyre
	 * life is allowed, but every lap beyond it pays the worn-out penalty instead of normal wear.
	 */
	public StrategyResult simulate(List<Stint> stints, int lapRecordMs, RandomGenerator random) {
		double total = 0;
		for (int i = 0; i < stints.size(); i++) {
			Stint stint = stints.get(i);
			int life = model.tyreLife(stint.compound());
			double base = model.baseLapTime(stint.compound(), lapRecordMs);
			for (int lap = 0; lap < stint.laps(); lap++) {
				double degradation = lap + 1 > life ? model.wornOutPenalty(lap + 1 - life)
						: model.degradation(stint.compound(), lap, random);
				total += base + degradation;
			}
			if (i < stints.size() - 1) {
				total += properties.pitStopSeconds();
			}
		}
		return result(null, stints, total);
	}

	/** Lap-by-lap degradation of one stint, used by the front-end chart. */
	public Degradation degradation(Compound compound, int laps, RandomGenerator random) {
		int life = model.tyreLife(compound);
		List<DegradationPoint> points = new ArrayList<>();
		for (int lap = 0; lap < laps; lap++) {
			double value = lap >= life ? model.wornOutPenalty(lap - life)
					: model.degradation(compound, lap, random);
			points.add(new DegradationPoint(lap + 1, model.phase(compound, lap), value));
		}
		return new Degradation(compound, life, points);
	}

	/**
	 * Hidden rule kept from the original: a short medium stint (under 18 laps) is run on softs and
	 * a short hard stint (25 laps or less) on mediums.
	 */
	static Compound adjustCompound(Compound compound, int laps) {
		if (compound == Compound.MEDIUM && laps < 18) {
			return Compound.SOFT;
		}
		if (compound == Compound.HARD && laps <= 25) {
			return Compound.MEDIUM;
		}
		return compound;
	}

	/** Returns empty for illegal strategies instead of throwing (the original used exceptions). */
	private Optional<Candidate> simulateLegal(List<Stint> strategy, int lapRecordMs,
			RandomGenerator random) {
		List<Stint> adjusted = new ArrayList<>();
		Set<Compound> used = EnumSet.noneOf(Compound.class);
		double total = 0;
		for (Stint stint : strategy) {
			Compound compound = adjustCompound(stint.compound(), stint.laps());
			if (stint.laps() > model.tyreLife(compound)) {
				return Optional.empty();
			}
			double base = model.baseLapTime(compound, lapRecordMs);
			for (int lap = 0; lap < stint.laps(); lap++) {
				total += base + model.degradation(compound, lap, random);
			}
			total += properties.pitStopSeconds();
			adjusted.add(new Stint(compound, stint.laps()));
			used.add(compound);
		}
		if (used.size() < 2) {
			return Optional.empty();
		}
		double raceTime = total - properties.pitStopSeconds();
		return Optional.of(new Candidate(raceTime + rankingAdjustment(adjusted), raceTime, adjusted));
	}

	private double rankingAdjustment(List<Stint> stints) {
		if (stints.size() == 3 && stints.get(0).compound() == stints.get(1).compound()) {
			return properties.sameCompoundPenaltySeconds();
		}
		if (stints.size() == 2) {
			return -properties.oneStopBonusSeconds();
		}
		return 0;
	}

	private boolean differ(List<Stint> a, List<Stint> b) {
		if (a.size() != b.size()) {
			return true;
		}
		List<Stint> sortedA = sortByCompound(a);
		List<Stint> sortedB = sortByCompound(b);
		int threshold = properties.similarityThresholdLaps();
		for (int i = 0; i < sortedA.size(); i++) {
			if (sortedA.get(i).compound() != sortedB.get(i).compound()
					|| Math.abs(sortedA.get(i).laps() - sortedB.get(i).laps()) > threshold) {
				return true;
			}
		}
		return false;
	}

	private static List<Stint> sortByCompound(List<Stint> stints) {
		return stints.stream().sorted(Comparator.comparing(Stint::compound)).toList();
	}

	private static StrategyResult result(Integer rank, List<Stint> stints, double totalSeconds) {
		return new StrategyResult(rank, stints.size() - 1, List.copyOf(stints),
				Math.round(totalSeconds * 1000) / 1000.0,
				format((long) Math.floor(totalSeconds * 1000)));
	}

	/** h:mm:ss.SSS when over an hour, otherwise m:ss.SSS. */
	static String format(long millis) {
		long hours = millis / 3_600_000;
		long minutes = millis % 3_600_000 / 60_000;
		long seconds = millis % 60_000 / 1000;
		long ms = millis % 1000;
		return hours > 0 ? "%d:%02d:%02d.%03d".formatted(hours, minutes, seconds, ms)
				: "%d:%02d.%03d".formatted(minutes, seconds, ms);
	}

}

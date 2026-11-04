package com.f1nallap.strategy;

import com.f1nallap.strategy.StrategyDtos.Stint;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * Generates candidate strategies for a race distance. Same rules as the original TypeScript:
 * all two-stint pairs of different compounds, three-stint A-B-B patterns, and soft-medium-hard.
 * A-B-A patterns (e.g. soft-medium-soft) are not generated.
 */
@Component
public class StrategyGenerator {

	private static final Compound[] COMPOUNDS = Compound.values();

	private final StrategyProperties properties;

	public StrategyGenerator(StrategyProperties properties) {
		this.properties = properties;
	}

	public List<List<Stint>> generate(int totalLaps) {
		List<List<Stint>> strategies = new ArrayList<>();
		addTwoStint(strategies, totalLaps);
		addThreeStintSameTail(strategies, totalLaps);
		addSoftMediumHard(strategies, totalLaps);
		if (strategies.isEmpty()) {
			int third = totalLaps / 3;
			strategies.add(List.of(new Stint(Compound.SOFT, third), new Stint(Compound.MEDIUM, third),
					new Stint(Compound.HARD, totalLaps - 2 * third)));
		}
		return strategies;
	}

	private void addTwoStint(List<List<Stint>> out, int totalLaps) {
		for (Compound first : COMPOUNDS) {
			for (Compound second : COMPOUNDS) {
				if (first == second) {
					continue;
				}
				for (int laps1 = min(first); laps1 <= Math.min(max(first), totalLaps); laps1++) {
					int laps2 = totalLaps - laps1;
					if (laps2 >= min(second) && laps2 <= max(second)) {
						out.add(List.of(new Stint(first, laps1), new Stint(second, laps2)));
					}
				}
			}
		}
	}

	private void addThreeStintSameTail(List<List<Stint>> out, int totalLaps) {
		for (Compound first : COMPOUNDS) {
			for (Compound second : COMPOUNDS) {
				if (first == second) {
					continue;
				}
				for (int laps1 = min(first); laps1 <= Math.min(max(first), totalLaps); laps1++) {
					for (int laps2 = min(second); laps2 <= Math.min(max(second), totalLaps - laps1); laps2++) {
						int laps3 = totalLaps - laps1 - laps2;
						if (laps3 >= min(second) && laps3 <= max(second)) {
							out.add(List.of(new Stint(first, laps1), new Stint(second, laps2),
									new Stint(second, laps3)));
						}
					}
				}
			}
		}
	}

	private void addSoftMediumHard(List<List<Stint>> out, int totalLaps) {
		int softLife = life(Compound.SOFT);
		int mediumLife = life(Compound.MEDIUM);
		for (int soft = min(Compound.SOFT); soft < Math.min(softLife, totalLaps); soft++) {
			for (int medium = min(Compound.MEDIUM); medium < Math.min(mediumLife, totalLaps - soft); medium++) {
				int hard = totalLaps - soft - medium;
				if (hard >= min(Compound.HARD) && hard <= life(Compound.HARD)) {
					out.add(List.of(new Stint(Compound.SOFT, soft), new Stint(Compound.MEDIUM, medium),
							new Stint(Compound.HARD, hard)));
				}
			}
		}
	}

	private int min(Compound c) {
		return properties.tyre(c).minLaps();
	}

	private int max(Compound c) {
		return properties.tyre(c).maxLaps();
	}

	private int life(Compound c) {
		return properties.tyre(c).life();
	}

}

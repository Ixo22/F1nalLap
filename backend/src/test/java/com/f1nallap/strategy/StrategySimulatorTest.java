package com.f1nallap.strategy;

import static org.assertj.core.api.Assertions.assertThat;

import com.f1nallap.strategy.StrategyDtos.Phase;
import com.f1nallap.strategy.StrategyDtos.Stint;
import com.f1nallap.strategy.StrategyDtos.StrategyResult;
import java.util.List;
import java.util.SplittableRandom;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;

class StrategySimulatorTest {

	private final StrategyProperties properties = StrategyTestSupport.properties();

	private final StrategySimulator simulator = StrategyTestSupport.simulator();

	private final LapTimeModel model = new LapTimeModel(properties);

	/** Properties that must hold for every circuit of the calendar (same data as migration V2). */
	@ParameterizedTest(name = "{0}")
	@CsvFileSource(resources = "/circuits.csv", numLinesToSkip = 1)
	void bestStrategiesAreValidForEveryCircuit(String ref, int laps, int lapRecordMs) {
		List<StrategyResult> best = simulator.best(laps, lapRecordMs, new SplittableRandom(1));

		assertThat(best).hasSize(3);
		assertThat(best).extracting(StrategyResult::rank).containsExactly(1, 2, 3);
		for (StrategyResult result : best) {
			assertThat(result.stints().stream().mapToInt(Stint::laps).sum()).isEqualTo(laps);
			assertThat(result.stints().stream().map(Stint::compound).distinct().count())
				.isGreaterThanOrEqualTo(2);
			assertThat(result.stints())
				.allSatisfy(s -> assertThat(s.laps()).isLessThanOrEqualTo(model.tyreLife(s.compound())));
			assertThat(result.stops()).isEqualTo(result.stints().size() - 1);
			assertThat(result.totalTimeSeconds()).isGreaterThan(laps * lapRecordMs / 1000.0);
		}
	}

	@Test
	void sameSeedGivesSameResult() {
		List<StrategyResult> first = simulator.best(58, 79_813, new SplittableRandom(42));
		List<StrategyResult> second = simulator.best(58, 79_813, new SplittableRandom(42));
		assertThat(first).isEqualTo(second);
	}

	@Test
	void freeSimulationPenalisesStintsBeyondTyreLife() {
		List<Stint> withinLife = List.of(new Stint(Compound.SOFT, 20), new Stint(Compound.HARD, 38));
		List<Stint> beyondLife = List.of(new Stint(Compound.SOFT, 30), new Stint(Compound.HARD, 28));

		double normal = simulator.simulate(withinLife, 79_813, new SplittableRandom(7)).totalTimeSeconds();
		double worn = simulator.simulate(beyondLife, 79_813, new SplittableRandom(7)).totalTimeSeconds();

		assertThat(worn).isGreaterThan(normal + 50);
	}

	@Test
	void freeSimulationAddsOnePitStopBetweenStints() {
		StrategyResult result = simulator.simulate(
				List.of(new Stint(Compound.MEDIUM, 29), new Stint(Compound.HARD, 29)), 79_813,
				new SplittableRandom(3));
		assertThat(result.stops()).isEqualTo(1);
		assertThat(result.rank()).isNull();
	}

	@Test
	void initialPhaseLastsSixLaps() {
		assertThat(model.phase(Compound.SOFT, 5)).isEqualTo(Phase.INITIAL);
		assertThat(model.phase(Compound.SOFT, 6)).isEqualTo(Phase.MIDDLE);
		assertThat(model.phase(Compound.SOFT, 11)).isEqualTo(Phase.MIDDLE);
		assertThat(model.phase(Compound.SOFT, 12)).isEqualTo(Phase.END);
	}

	@Test
	void shortStintsUseSofterCompound() {
		assertThat(StrategySimulator.adjustCompound(Compound.MEDIUM, 17)).isEqualTo(Compound.SOFT);
		assertThat(StrategySimulator.adjustCompound(Compound.MEDIUM, 18)).isEqualTo(Compound.MEDIUM);
		assertThat(StrategySimulator.adjustCompound(Compound.HARD, 25)).isEqualTo(Compound.MEDIUM);
		assertThat(StrategySimulator.adjustCompound(Compound.HARD, 26)).isEqualTo(Compound.HARD);
	}

	@Test
	void degradationAppliesPenaltyAfterTyreLife() {
		var degradation = simulator.degradation(Compound.SOFT, 25, new SplittableRandom(5));
		assertThat(degradation.laps()).hasSize(25);
		assertThat(degradation.laps().get(21).degradationSeconds()).isLessThan(0.31);
		assertThat(degradation.laps().get(22).degradationSeconds()).isEqualTo(0.5);
		assertThat(degradation.laps().get(24).degradationSeconds()).isGreaterThan(4);
	}

	@Test
	void formatsTimesLikeTheOriginal() {
		assertThat(StrategySimulator.format(5_423_123)).isEqualTo("1:30:23.123");
		assertThat(StrategySimulator.format(83_004)).isEqualTo("1:23.004");
	}

}

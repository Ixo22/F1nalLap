package com.f1nallap.strategy;

import com.f1nallap.circuit.Circuit;
import com.f1nallap.circuit.CircuitService;
import com.f1nallap.strategy.StrategyDtos.Degradation;
import com.f1nallap.strategy.StrategyDtos.Stint;
import com.f1nallap.strategy.StrategyDtos.StrategyResult;
import java.util.List;
import java.util.SplittableRandom;
import java.util.random.RandomGenerator;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.stereotype.Service;

/** Connects the simulator with the circuit catalogue. Each call gets its own seeded generator. */
@Service
@EnableConfigurationProperties(StrategyProperties.class)
public class StrategyService {

	private final CircuitService circuits;

	private final StrategySimulator simulator;

	private final StrategyProperties properties;

	public StrategyService(CircuitService circuits, StrategySimulator simulator,
			StrategyProperties properties) {
		this.circuits = circuits;
		this.simulator = simulator;
		this.properties = properties;
	}

	public List<StrategyResult> best(String circuitRef) {
		Circuit circuit = circuits.getEntity(circuitRef);
		return simulator.best(circuit.getLaps(), circuit.getLapRecordMs(), random(circuitRef));
	}

	public StrategyResult simulate(String circuitRef, List<Stint> stints) {
		Circuit circuit = circuits.getEntity(circuitRef);
		int laps = stints.stream().mapToInt(Stint::laps).sum();
		if (laps != circuit.getLaps()) {
			throw new IllegalArgumentException("The stints add up to %d laps but %s has %d laps."
				.formatted(laps, circuit.getGrandPrixName(), circuit.getLaps()));
		}
		return simulator.simulate(stints, circuit.getLapRecordMs(), random(circuitRef));
	}

	public Degradation degradation(String circuitRef, Compound compound, int laps) {
		circuits.getEntity(circuitRef);
		return simulator.degradation(compound, laps, random(circuitRef + compound));
	}

	private RandomGenerator random(String key) {
		return new SplittableRandom(properties.seed() ^ key.hashCode());
	}

}

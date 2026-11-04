package com.f1nallap.strategy;

import com.f1nallap.strategy.StrategyDtos.Degradation;
import com.f1nallap.strategy.StrategyDtos.SimulationRequest;
import com.f1nallap.strategy.StrategyDtos.StrategyResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/circuits/{ref}")
@Tag(name = "Strategies", description = "Tyre strategy simulator")
public class StrategyController {

	private final StrategyService service;

	public StrategyController(StrategyService service) {
		this.service = service;
	}

	@GetMapping("/strategies/best")
	@Operation(summary = "Top 3 strategies for the circuit")
	public List<StrategyResult> best(@PathVariable String ref) {
		return service.best(ref);
	}

	@PostMapping("/strategies/simulate")
	@Operation(summary = "Simulate a user-defined strategy")
	public StrategyResult simulate(@PathVariable String ref,
			@Valid @RequestBody SimulationRequest request) {
		return service.simulate(ref, request.stints());
	}

	@GetMapping("/degradation")
	@Operation(summary = "Lap-by-lap degradation of one stint")
	public Degradation degradation(@PathVariable String ref, @RequestParam Compound compound,
			@RequestParam @Positive @Max(100) int laps) {
		return service.degradation(ref, compound, laps);
	}

}

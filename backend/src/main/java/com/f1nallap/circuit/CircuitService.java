package com.f1nallap.circuit;

import com.f1nallap.common.NotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class CircuitService {

	private final CircuitRepository circuits;

	public CircuitService(CircuitRepository circuits) {
		this.circuits = circuits;
	}

	public List<CircuitDto> findAll() {
		return circuits.findAllByOrderByIdAsc().stream().map(CircuitDto::from).toList();
	}

	public CircuitDto findByRef(String circuitRef) {
		return CircuitDto.from(getEntity(circuitRef));
	}

	public Circuit getEntity(String circuitRef) {
		return circuits.findByCircuitRef(circuitRef)
			.orElseThrow(() -> new NotFoundException("Circuit not found: " + circuitRef));
	}

}

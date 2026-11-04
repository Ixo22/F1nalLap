package com.f1nallap.circuit;

import com.f1nallap.common.CacheHeaders;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/circuits")
@Tag(name = "Circuits", description = "Circuit catalogue")
public class CircuitController {

	private final CircuitService service;

	private final CacheHeaders cacheHeaders;

	public CircuitController(CircuitService service, CacheHeaders cacheHeaders) {
		this.service = service;
		this.cacheHeaders = cacheHeaders;
	}

	@GetMapping
	@Operation(summary = "All circuits of the current calendar")
	public ResponseEntity<List<CircuitDto>> findAll() {
		return ResponseEntity.ok().cacheControl(cacheHeaders.forStaticData()).body(service.findAll());
	}

	@GetMapping("/{ref}")
	@Operation(summary = "One circuit by its Jolpica id (e.g. albert_park)")
	public ResponseEntity<CircuitDto> findByRef(@PathVariable String ref) {
		return ResponseEntity.ok()
			.cacheControl(cacheHeaders.forStaticData())
			.body(service.findByRef(ref));
	}

}

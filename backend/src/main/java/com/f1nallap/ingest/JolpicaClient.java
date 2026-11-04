package com.f1nallap.ingest;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.HttpExchange;

/**
 * Declarative HTTP client for Jolpica. Spring generates the implementation on top of RestClient
 * (see JolpicaClientConfig).
 */
@HttpExchange(accept = "application/json")
public interface JolpicaClient {

	@GetExchange("/{season}.json")
	JolpicaModels.Response schedule(@PathVariable int season, @RequestParam int limit,
			@RequestParam int offset);

	@GetExchange("/{season}/results.json")
	JolpicaModels.Response results(@PathVariable int season, @RequestParam int limit,
			@RequestParam int offset);

	@GetExchange("/{season}/driverstandings.json")
	JolpicaModels.Response driverStandings(@PathVariable int season, @RequestParam int limit,
			@RequestParam int offset);

	@GetExchange("/{season}/constructorstandings.json")
	JolpicaModels.Response constructorStandings(@PathVariable int season,
			@RequestParam int limit, @RequestParam int offset);

}

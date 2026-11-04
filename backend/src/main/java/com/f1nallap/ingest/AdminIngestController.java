package com.f1nallap.ingest;

import com.f1nallap.common.SeasonYears;
import com.f1nallap.ingest.IngestRun.Trigger;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Manual ingestion. Protected by ApiKeyFilter (X-Api-Key header). */
@RestController
@RequestMapping("/admin/ingest")
@Tag(name = "Admin", description = "Manual data loading (requires X-Api-Key)")
public class AdminIngestController {

	private final SeasonIngestService ingestService;

	private final IngestRunRepository runs;

	private final SeasonYears seasonYears;

	public AdminIngestController(SeasonIngestService ingestService, IngestRunRepository runs,
			SeasonYears seasonYears) {
		this.ingestService = ingestService;
		this.runs = runs;
		this.seasonYears = seasonYears;
	}

	@PostMapping("/{season}")
	@Operation(summary = "Load or reload a season from Jolpica")
	public IngestRunDto ingest(@PathVariable int season) {
		seasonYears.validate(season);
		return IngestRunDto.from(ingestService.ingest(season, Trigger.ADMIN));
	}

	@GetMapping("/{season}/runs")
	@Operation(summary = "Ingestion history of a season")
	public List<IngestRunDto> runs(@PathVariable int season) {
		return runs.findBySeasonYearOrderByIdAsc(season).stream().map(IngestRunDto::from).toList();
	}

}

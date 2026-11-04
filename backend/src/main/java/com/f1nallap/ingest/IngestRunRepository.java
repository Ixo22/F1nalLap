package com.f1nallap.ingest;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IngestRunRepository extends JpaRepository<IngestRun, Long> {

	List<IngestRun> findBySeasonYearOrderByIdAsc(int seasonYear);

}

package com.f1nallap.standings;

import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface DriverStandingRepository extends JpaRepository<DriverStanding, Long> {

	/** The entity graph loads driver and constructors together, avoiding N+1 queries. */
	@EntityGraph(attributePaths = { "driver", "constructors" })
	List<DriverStanding> findBySeasonYearOrderByIdAsc(int seasonYear);

	@Modifying
	@Query("delete from DriverStanding ds where ds.seasonYear = :seasonYear")
	void deleteBySeasonYear(int seasonYear);

}

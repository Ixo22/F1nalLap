package com.f1nallap.season;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface RaceRepository extends JpaRepository<Race, Long> {

	List<Race> findBySeasonYearOrderByRoundAsc(int seasonYear);

	boolean existsBySeasonYearAndRound(int seasonYear, int round);

	@Modifying
	@Query("delete from Race r where r.seasonYear = :seasonYear")
	void deleteBySeasonYear(int seasonYear);

}

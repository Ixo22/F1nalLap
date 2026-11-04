package com.f1nallap.season;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

/**
 * Read queries load race, driver and constructor in the same SQL statement (JOIN FETCH).
 * Without it, Hibernate would run one extra query per result (the N+1 problem).
 */
public interface RaceResultRepository extends JpaRepository<RaceResult, Long> {

	@Query("""
			select rr from RaceResult rr
			join fetch rr.race r
			join fetch rr.driver
			join fetch rr.constructor
			where r.seasonYear = :seasonYear and r.round = :round
			order by rr.position
			""")
	List<RaceResult> findByRace(int seasonYear, int round);

	@Query("""
			select rr from RaceResult rr
			join fetch rr.race r
			join fetch rr.driver
			join fetch rr.constructor
			where r.seasonYear = :seasonYear
			order by r.round, rr.position
			""")
	List<RaceResult> findBySeason(int seasonYear);

	@Query("""
			select rr from RaceResult rr
			join fetch rr.race r
			join fetch rr.driver
			join fetch rr.constructor
			where r.seasonYear = :seasonYear and rr.position = 1
			order by r.round
			""")
	List<RaceResult> findWinnersBySeason(int seasonYear);

	@Modifying
	@Query("delete from RaceResult rr where rr.race.id in "
			+ "(select r.id from Race r where r.seasonYear = :seasonYear)")
	void deleteBySeasonYear(int seasonYear);

}

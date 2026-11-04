package com.f1nallap.standings;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface ConstructorStandingRepository extends JpaRepository<ConstructorStanding, Long> {

	@Query("""
			select cs from ConstructorStanding cs
			join fetch cs.constructor
			where cs.seasonYear = :seasonYear
			order by cs.id
			""")
	List<ConstructorStanding> findBySeason(int seasonYear);

	@Modifying
	@Query("delete from ConstructorStanding cs where cs.seasonYear = :seasonYear")
	void deleteBySeasonYear(int seasonYear);

}

package com.f1nallap.season;

import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConstructorRepository extends JpaRepository<Constructor, Long> {

	List<Constructor> findByConstructorRefIn(Collection<String> constructorRefs);

}

package com.f1nallap.season;

import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DriverRepository extends JpaRepository<Driver, Long> {

	List<Driver> findByDriverRefIn(Collection<String> driverRefs);

}

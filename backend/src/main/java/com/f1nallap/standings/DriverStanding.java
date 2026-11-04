package com.f1nallap.standings;

import com.f1nallap.season.Constructor;
import com.f1nallap.season.Driver;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Driver championship standing, stored as published by Jolpica instead of being computed from race
 * results: since 2021 sprint races award points that results.json does not include.
 */
@Entity
@Table(name = "driver_standing")
public class DriverStanding {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "season_year", nullable = false)
	private Integer seasonYear;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "driver_id")
	private Driver driver;

	/** Null when the driver was excluded from the championship (positionText is then e.g. "D"). */
	private Integer position;

	@Column(name = "position_text", nullable = false)
	private String positionText;

	@Column(nullable = false)
	private BigDecimal points;

	@Column(nullable = false)
	private Integer wins;

	@ManyToMany
	@JoinTable(name = "driver_standing_constructor",
			joinColumns = @JoinColumn(name = "driver_standing_id"),
			inverseJoinColumns = @JoinColumn(name = "constructor_id"))
	@OrderColumn(name = "sort_order")
	private List<Constructor> constructors = new ArrayList<>();

	protected DriverStanding() {
	}

	public DriverStanding(int seasonYear, Driver driver, Integer position, String positionText,
			BigDecimal points, int wins, List<Constructor> constructors) {
		this.seasonYear = seasonYear;
		this.driver = driver;
		this.position = position;
		this.positionText = positionText;
		this.points = points;
		this.wins = wins;
		this.constructors = new ArrayList<>(constructors);
	}

	public Long getId() {
		return id;
	}

	public Integer getSeasonYear() {
		return seasonYear;
	}

	public Driver getDriver() {
		return driver;
	}

	public Integer getPosition() {
		return position;
	}

	public String getPositionText() {
		return positionText;
	}

	public BigDecimal getPoints() {
		return points;
	}

	public Integer getWins() {
		return wins;
	}

	public List<Constructor> getConstructors() {
		return constructors;
	}

}

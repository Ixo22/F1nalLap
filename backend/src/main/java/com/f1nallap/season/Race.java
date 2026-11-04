package com.f1nallap.season;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;

@Entity
@Table(name = "race")
public class Race {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "season_year", nullable = false)
	private Integer seasonYear;

	@Column(nullable = false)
	private Integer round;

	@Column(nullable = false)
	private String name;

	@Column(name = "race_date")
	private LocalDate date;

	@Column(name = "circuit_ref", nullable = false)
	private String circuitRef;

	@Column(name = "circuit_name")
	private String circuitName;

	protected Race() {
	}

	public Race(int seasonYear, int round, String name, LocalDate date, String circuitRef,
			String circuitName) {
		this.seasonYear = seasonYear;
		this.round = round;
		this.name = name;
		this.date = date;
		this.circuitRef = circuitRef;
		this.circuitName = circuitName;
	}

	public Long getId() {
		return id;
	}

	public Integer getSeasonYear() {
		return seasonYear;
	}

	public Integer getRound() {
		return round;
	}

	public String getName() {
		return name;
	}

	public LocalDate getDate() {
		return date;
	}

	public String getCircuitRef() {
		return circuitRef;
	}

	public String getCircuitName() {
		return circuitName;
	}

}

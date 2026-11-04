package com.f1nallap.season;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "race_result")
public class RaceResult {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "race_id")
	private Race race;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "driver_id")
	private Driver driver;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "constructor_id")
	private Constructor constructor;

	/** Order of the row in the classification; unique per race, unlike position. */
	@Column(name = "result_order", nullable = false)
	private Integer resultOrder;

	@Column(nullable = false)
	private Integer position;

	@Column(name = "position_text", nullable = false)
	private String positionText;

	private Integer grid;

	@Column(nullable = false)
	private BigDecimal points;

	private String status;

	private Integer laps;

	@Column(name = "fastest_lap_time")
	private String fastestLapTime;

	protected RaceResult() {
	}

	public RaceResult(Race race, Driver driver, Constructor constructor, int resultOrder, int position,
			String positionText, Integer grid, BigDecimal points, String status, Integer laps,
			String fastestLapTime) {
		this.race = race;
		this.driver = driver;
		this.constructor = constructor;
		this.resultOrder = resultOrder;
		this.position = position;
		this.positionText = positionText;
		this.grid = grid;
		this.points = points;
		this.status = status;
		this.laps = laps;
		this.fastestLapTime = fastestLapTime;
	}

	public Long getId() {
		return id;
	}

	public Race getRace() {
		return race;
	}

	public Driver getDriver() {
		return driver;
	}

	public Constructor getConstructor() {
		return constructor;
	}

	public Integer getResultOrder() {
		return resultOrder;
	}

	public Integer getPosition() {
		return position;
	}

	public String getPositionText() {
		return positionText;
	}

	public Integer getGrid() {
		return grid;
	}

	public BigDecimal getPoints() {
		return points;
	}

	public String getStatus() {
		return status;
	}

	public Integer getLaps() {
		return laps;
	}

	public String getFastestLapTime() {
		return fastestLapTime;
	}

}

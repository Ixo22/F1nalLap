package com.f1nallap.standings;

import com.f1nallap.season.Constructor;
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

/** Constructor championship standing. The championship exists since 1958. */
@Entity
@Table(name = "constructor_standing")
public class ConstructorStanding {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "season_year", nullable = false)
	private Integer seasonYear;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "constructor_id")
	private Constructor constructor;

	private Integer position;

	@Column(name = "position_text", nullable = false)
	private String positionText;

	@Column(nullable = false)
	private BigDecimal points;

	@Column(nullable = false)
	private Integer wins;

	protected ConstructorStanding() {
	}

	public ConstructorStanding(int seasonYear, Constructor constructor, Integer position,
			String positionText, BigDecimal points, int wins) {
		this.seasonYear = seasonYear;
		this.constructor = constructor;
		this.position = position;
		this.positionText = positionText;
		this.points = points;
		this.wins = wins;
	}

	public Long getId() {
		return id;
	}

	public Integer getSeasonYear() {
		return seasonYear;
	}

	public Constructor getConstructor() {
		return constructor;
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

}

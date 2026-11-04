package com.f1nallap.circuit;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

/** Circuit catalogue used by the strategy simulator (seeded by migration V2). */
@Entity
@Table(name = "circuit")
public class Circuit {

	@Id
	private Integer id;

	@Column(name = "circuit_ref", nullable = false, unique = true)
	private String circuitRef;

	@Column(nullable = false)
	private String name;

	@Column(name = "grand_prix_name", nullable = false)
	private String grandPrixName;

	@Column(nullable = false)
	private String country;

	@Column(nullable = false)
	private Integer laps;

	@Column(name = "length_km", nullable = false)
	private BigDecimal lengthKm;

	@Column(name = "lap_record_ms", nullable = false)
	private Integer lapRecordMs;

	@Column(name = "image_url")
	private String imageUrl;

	protected Circuit() {
	}

	public Circuit(int id, String circuitRef, String name, String grandPrixName, String country,
			int laps, BigDecimal lengthKm, int lapRecordMs, String imageUrl) {
		this.id = id;
		this.circuitRef = circuitRef;
		this.name = name;
		this.grandPrixName = grandPrixName;
		this.country = country;
		this.laps = laps;
		this.lengthKm = lengthKm;
		this.lapRecordMs = lapRecordMs;
		this.imageUrl = imageUrl;
	}

	public Integer getId() {
		return id;
	}

	public String getCircuitRef() {
		return circuitRef;
	}

	public String getName() {
		return name;
	}

	public String getGrandPrixName() {
		return grandPrixName;
	}

	public String getCountry() {
		return country;
	}

	public Integer getLaps() {
		return laps;
	}

	public BigDecimal getLengthKm() {
		return lengthKm;
	}

	public Integer getLapRecordMs() {
		return lapRecordMs;
	}

	public String getImageUrl() {
		return imageUrl;
	}

}

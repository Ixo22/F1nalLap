package com.f1nallap.season;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

/** A season that has been ingested. If the row exists, the season data is available locally. */
@Entity
@Table(name = "season")
public class Season {

	@Id
	private Integer year;

	@Column(name = "loaded_at", nullable = false)
	private Instant loadedAt;

	protected Season() {
	}

	public Season(int year, Instant loadedAt) {
		this.year = year;
		this.loadedAt = loadedAt;
	}

	public Integer getYear() {
		return year;
	}

	public Instant getLoadedAt() {
		return loadedAt;
	}

	public void setLoadedAt(Instant loadedAt) {
		this.loadedAt = loadedAt;
	}

}

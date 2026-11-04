package com.f1nallap.ingest;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

/** One ingestion attempt. Failures are visible here without reading the logs. */
@Entity
@Table(name = "ingest_run")
public class IngestRun {

	public enum Status {
		RUNNING, SUCCESS, FAILED
	}

	public enum Trigger {
		STARTUP, ON_DEMAND, SCHEDULED, ADMIN
	}

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "season_year", nullable = false)
	private Integer seasonYear;

	@Enumerated(EnumType.STRING)
	@Column(name = "trigger_type", nullable = false)
	private Trigger trigger;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Status status;

	@Column(name = "started_at", nullable = false)
	private Instant startedAt;

	@Column(name = "finished_at")
	private Instant finishedAt;

	private Integer requests;

	@Column(name = "rows_written")
	private Integer rowsWritten;

	private String error;

	protected IngestRun() {
	}

	public IngestRun(int seasonYear, Trigger trigger, Instant startedAt) {
		this.seasonYear = seasonYear;
		this.trigger = trigger;
		this.status = Status.RUNNING;
		this.startedAt = startedAt;
	}

	public void succeed(Instant finishedAt, int requests, int rowsWritten) {
		this.status = Status.SUCCESS;
		this.finishedAt = finishedAt;
		this.requests = requests;
		this.rowsWritten = rowsWritten;
	}

	public void fail(Instant finishedAt, int requests, String error) {
		this.status = Status.FAILED;
		this.finishedAt = finishedAt;
		this.requests = requests;
		this.error = error;
	}

	public Long getId() {
		return id;
	}

	public Integer getSeasonYear() {
		return seasonYear;
	}

	public Trigger getTrigger() {
		return trigger;
	}

	public Status getStatus() {
		return status;
	}

	public Instant getStartedAt() {
		return startedAt;
	}

	public Instant getFinishedAt() {
		return finishedAt;
	}

	public Integer getRequests() {
		return requests;
	}

	public Integer getRowsWritten() {
		return rowsWritten;
	}

	public String getError() {
		return error;
	}

}

package com.f1nallap.season;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "driver")
public class Driver {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "driver_ref", nullable = false, unique = true)
	private String driverRef;

	private String code;

	@Column(name = "given_name", nullable = false)
	private String givenName;

	@Column(name = "family_name", nullable = false)
	private String familyName;

	private String nationality;

	@Column(name = "permanent_number")
	private Integer permanentNumber;

	protected Driver() {
	}

	public Driver(String driverRef) {
		this.driverRef = driverRef;
	}

	/** Copies the mutable fields; drivers are upserted by {@code driverRef}. */
	public void update(String code, String givenName, String familyName, String nationality,
			Integer permanentNumber) {
		this.code = code;
		this.givenName = givenName;
		this.familyName = familyName;
		this.nationality = nationality;
		this.permanentNumber = permanentNumber;
	}

	public Long getId() {
		return id;
	}

	public String getDriverRef() {
		return driverRef;
	}

	public String getCode() {
		return code;
	}

	public String getGivenName() {
		return givenName;
	}

	public String getFamilyName() {
		return familyName;
	}

	public String getNationality() {
		return nationality;
	}

	public Integer getPermanentNumber() {
		return permanentNumber;
	}

}

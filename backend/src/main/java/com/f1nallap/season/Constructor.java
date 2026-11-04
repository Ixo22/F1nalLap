package com.f1nallap.season;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A team. F1 calls teams constructors. */
@Entity
@Table(name = "constructor")
public class Constructor {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "constructor_ref", nullable = false, unique = true)
	private String constructorRef;

	@Column(nullable = false)
	private String name;

	private String nationality;

	protected Constructor() {
	}

	public Constructor(String constructorRef) {
		this.constructorRef = constructorRef;
	}

	public void update(String name, String nationality) {
		this.name = name;
		this.nationality = nationality;
	}

	public Long getId() {
		return id;
	}

	public String getConstructorRef() {
		return constructorRef;
	}

	public String getName() {
		return name;
	}

	public String getNationality() {
		return nationality;
	}

}

package com.f1nallap.circuit;

public record CircuitDto(int id, String circuitRef, String name, String grandPrixName,
		String country, int laps, double lengthKm, int lapRecordMs, String imageUrl) {

	static CircuitDto from(Circuit c) {
		return new CircuitDto(c.getId(), c.getCircuitRef(), c.getName(), c.getGrandPrixName(),
				c.getCountry(), c.getLaps(), c.getLengthKm().doubleValue(), c.getLapRecordMs(),
				c.getImageUrl());
	}

}

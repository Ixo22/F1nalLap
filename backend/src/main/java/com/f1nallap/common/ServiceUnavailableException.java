package com.f1nallap.common;

/** Thrown when data cannot be served right now (e.g. the upstream API failed). Mapped to HTTP 503. */
public class ServiceUnavailableException extends RuntimeException {

	public ServiceUnavailableException(String message, Throwable cause) {
		super(message, cause);
	}

}

package com.f1nallap.ingest;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;

/**
 * Keeps a minimum pause between requests so the app stays under the Jolpica burst limit,
 * and counts every request sent (used for the ingest_run audit).
 */
public class RateLimitInterceptor implements ClientHttpRequestInterceptor {

	private final long minIntervalNanos;

	private final AtomicInteger requestCount = new AtomicInteger();

	private long lastRequestNanos;

	public RateLimitInterceptor(Duration minInterval) {
		this.minIntervalNanos = minInterval.toNanos();
	}

	@Override
	public ClientHttpResponse intercept(HttpRequest request, byte[] body,
			ClientHttpRequestExecution execution) throws IOException {
		waitForSlot();
		requestCount.incrementAndGet();
		return execution.execute(request, body);
	}

	private synchronized void waitForSlot() {
		long now = System.nanoTime();
		long wait = minIntervalNanos - (now - lastRequestNanos);
		if (lastRequestNanos != 0 && wait > 0) {
			try {
				Thread.sleep(Duration.ofNanos(wait));
			}
			catch (InterruptedException ex) {
				Thread.currentThread().interrupt();
			}
		}
		lastRequestNanos = System.nanoTime();
	}

	public int requestCount() {
		return requestCount.get();
	}

}

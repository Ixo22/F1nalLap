package com.f1nallap.common;

import java.time.Duration;
import org.springframework.http.CacheControl;
import org.springframework.stereotype.Component;

/** Finished seasons never change, so they can be cached for a long time; the current season cannot. */
@Component
public class CacheHeaders {

	private final SeasonYears seasonYears;

	public CacheHeaders(SeasonYears seasonYears) {
		this.seasonYears = seasonYears;
	}

	public CacheControl forSeason(int season) {
		return season < seasonYears.current()
				? CacheControl.maxAge(Duration.ofDays(7)).cachePublic()
				: CacheControl.maxAge(Duration.ofMinutes(10)).cachePublic();
	}

	public CacheControl forStaticData() {
		return CacheControl.maxAge(Duration.ofDays(1)).cachePublic();
	}

}

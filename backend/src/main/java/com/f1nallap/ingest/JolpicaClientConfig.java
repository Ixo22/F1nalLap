package com.f1nallap.ingest;

import java.net.http.HttpClient;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.resilience.annotation.EnableResilientMethods;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.support.RestClientAdapter;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;

/** Builds the Jolpica client with base URL, timeouts and rate limiting. */
@Configuration
@EnableResilientMethods
@EnableConfigurationProperties(IngestProperties.class)
public class JolpicaClientConfig {

	@Bean
	RateLimitInterceptor jolpicaRateLimiter(IngestProperties properties) {
		return new RateLimitInterceptor(properties.minInterval());
	}

	@Bean
	JolpicaClient jolpicaClient(IngestProperties properties,
			RateLimitInterceptor rateLimiter) {
		HttpClient httpClient = HttpClient.newBuilder()
			.connectTimeout(properties.connectTimeout())
			.followRedirects(HttpClient.Redirect.NORMAL)
			.build();
		JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
		requestFactory.setReadTimeout(properties.readTimeout());

		RestClient restClient = RestClient.builder()
			.baseUrl(properties.baseUrl())
			.requestFactory(requestFactory)
			.requestInterceptor(rateLimiter)
			.defaultHeader("User-Agent", "F1nalLap-API")
			.build();
		return HttpServiceProxyFactory.builderFor(RestClientAdapter.create(restClient))
			.build()
			.createClient(JolpicaClient.class);
	}

}

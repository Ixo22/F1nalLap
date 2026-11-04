package com.f1nallap.ingest;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Rejects /admin requests without a valid X-Api-Key header. When no key is configured the admin
 * endpoints are disabled entirely.
 */
@Component
public class ApiKeyFilter extends OncePerRequestFilter {

	static final String HEADER = "X-Api-Key";

	private final byte[] expectedKey;

	public ApiKeyFilter(IngestProperties properties) {
		String key = properties.adminApiKey();
		this.expectedKey = key == null || key.isBlank() ? null : key.getBytes(StandardCharsets.UTF_8);
	}

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		return !request.getRequestURI().startsWith("/admin");
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
			FilterChain chain) throws ServletException, IOException {
		String provided = request.getHeader(HEADER);
		boolean valid = expectedKey != null && provided != null
				&& MessageDigest.isEqual(expectedKey, provided.getBytes(StandardCharsets.UTF_8));
		if (!valid) {
			response.setStatus(HttpStatus.UNAUTHORIZED.value());
			response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
			response.getWriter()
				.write("{\"title\":\"Unauthorized\",\"status\":401,\"detail\":\"Missing or invalid API key.\"}");
			return;
		}
		chain.doFilter(request, response);
	}

}

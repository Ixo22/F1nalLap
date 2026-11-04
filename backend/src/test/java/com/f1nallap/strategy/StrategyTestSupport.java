package com.f1nallap.strategy;

import java.io.IOException;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.boot.env.YamlPropertySourceLoader;
import org.springframework.core.env.StandardEnvironment;
import org.springframework.core.io.ClassPathResource;

/** Builds the simulator from the real application.yml values, without starting Spring. */
final class StrategyTestSupport {

	private StrategyTestSupport() {
	}

	static StrategyProperties properties() {
		try {
			StandardEnvironment env = new StandardEnvironment();
			new YamlPropertySourceLoader().load("app", new ClassPathResource("application.yml"))
				.forEach(env.getPropertySources()::addLast);
			return Binder.get(env).bind("strategy", StrategyProperties.class).get();
		}
		catch (IOException ex) {
			throw new IllegalStateException(ex);
		}
	}

	static StrategySimulator simulator() {
		StrategyProperties properties = properties();
		return new StrategySimulator(new StrategyGenerator(properties), new LapTimeModel(properties),
				properties);
	}

}

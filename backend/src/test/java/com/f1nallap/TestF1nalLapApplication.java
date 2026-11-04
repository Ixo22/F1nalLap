package com.f1nallap;

import org.springframework.boot.SpringApplication;

public class TestF1nalLapApplication {

	public static void main(String[] args) {
		SpringApplication.from(F1nalLapApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}

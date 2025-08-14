package com.example.workmanagementbackend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class HomeController {

	@GetMapping("/")
	public Map<String, Object> index() {
		return Map.of(
			"status", "ok",
			"service", "work-management-backend",
			"timestamp", Instant.now().toString()
		);
	}

	@GetMapping("/health")
	public Map<String, String> health() {
		return Map.of("status", "UP");
	}
}



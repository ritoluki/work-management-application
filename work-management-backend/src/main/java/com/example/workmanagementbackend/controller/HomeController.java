package com.example.workmanagementbackend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HomeController {

    private final Environment env;
    private final DataSource dataSource;

    @Value("${app.cors.allowed-origins:NOT_SET}")
    private String corsAllowedOrigins;

    @Value("${spring.datasource.url:NOT_SET}")
    private String datasourceUrl;

    @Value("${spring.datasource.username:NOT_SET}")
    private String datasourceUsername;

    public HomeController(Environment env, DataSource dataSource) {
        this.env = env;
        this.dataSource = dataSource;
    }

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

    /**
     * Kiểm tra các env vars và config đang chạy.
     * Password bị ẩn. Truy cập: GET /api/config-check
     */
    @GetMapping("/api/config-check")
    public Map<String, Object> configCheck() {
        Map<String, Object> result = new LinkedHashMap<>();

        // Profile đang active
        result.put("activeProfiles", Arrays.toString(env.getActiveProfiles()));

        // Database config (ẩn password)
        result.put("db.url", datasourceUrl);
        result.put("db.username", datasourceUsername);

        // Kiểm tra kết nối DB thực tế
        String dbStatus;
        try (Connection conn = dataSource.getConnection()) {
            dbStatus = "OK - connected to " + conn.getMetaData().getDatabaseProductName()
                       + " " + conn.getMetaData().getDatabaseProductVersion();
        } catch (Exception e) {
            dbStatus = "FAILED - " + e.getMessage();
        }
        result.put("db.connectionTest", dbStatus);

        // CORS config
        result.put("cors.allowedOrigins", corsAllowedOrigins);

        // Server port
        result.put("server.port", env.getProperty("server.port", "8080"));

        return result;
    }
}

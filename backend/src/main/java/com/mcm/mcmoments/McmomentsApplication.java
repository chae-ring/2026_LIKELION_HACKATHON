package com.mcm.mcmoments;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
@EnableAsync
public class McmomentsApplication {

    public static void main(String[] args) {
        SpringApplication.run(McmomentsApplication.class, args);
    }
}
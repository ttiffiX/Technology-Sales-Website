package com.example.sale_tech_web;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableCaching
public class SaleTechWebApplication {

	public static void main(String[] args) {
		SpringApplication.run(SaleTechWebApplication.class, args);
	}

}

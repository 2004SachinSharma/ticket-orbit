package com.ticketorbit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
public class TicketOrbitApplication {

public static void main(String[] args) {
	TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
	SpringApplication.run(TicketOrbitApplication.class, args);
   
     }
	
}

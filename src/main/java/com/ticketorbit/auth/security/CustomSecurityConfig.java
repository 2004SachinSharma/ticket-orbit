package com.ticketorbit.auth.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.password.CompromisedPasswordChecker;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.password.HaveIBeenPwnedRestApiPasswordChecker;

@Configuration
@EnableWebSecurity
public class CustomSecurityConfig {

@Bean
SecurityFilterChain SecurityFilterChain(HttpSecurity http) throws Exception {

http.csrf(csrf -> csrf.disable())
		.sessionManagement(sessionManagement -> sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
		.authorizeHttpRequests(authorizeRequests -> authorizeRequests
				                                            .requestMatchers("/api/v1/auth/register").permitAll()
				                                            .anyRequest().authenticated());

return  http.build();
}


@Bean
CompromisedPasswordChecker compromisedPasswordChecker() {
	return new HaveIBeenPwnedRestApiPasswordChecker();
}

@Bean
PasswordEncoder passwordEncoder() {
	return new BCryptPasswordEncoder();
}

}

package com.ticketorbit.auth.security;

import com.ticketorbit.auth.exception.SecurityErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.password.CompromisedPasswordChecker;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.password.HaveIBeenPwnedRestApiPasswordChecker;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class CustomSecurityConfig {

@Bean
SecurityFilterChain SecurityFilterChain(HttpSecurity http,
										JwtUtil jwtUtil,
                                        SecurityErrorHandler errorHandler) throws Exception {

http.csrf(csrf -> csrf.disable())
		.cors(Customizer.withDefaults())
		.sessionManagement(sessionManagement -> sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
		.exceptionHandling(e->
				                   e.authenticationEntryPoint(errorHandler)//401
						                   .accessDeniedHandler(errorHandler))//403
		.authorizeHttpRequests(authorizeRequests -> authorizeRequests
				                                            .requestMatchers("/api/v1/auth/register/public","/api/v1/auth/test/public","/api/v1/auth/login/public").permitAll()
				                                            .requestMatchers("/v3/api-docs/**",
						                                            "/v3/api-docs.yaml",
						                                            "/swagger-ui/**",
						                                            "/swagger-ui.html").permitAll()
				                                            .anyRequest().authenticated())
		.addFilterBefore(new JwtTokenValidatorFilter(jwtUtil, errorHandler), UsernamePasswordAuthenticationFilter.class);

return  http.build();
}

@Bean
public CorsConfigurationSource corsConfigurationSource() {
	CorsConfiguration corsConfiguration = new CorsConfiguration();
	corsConfiguration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));

	corsConfiguration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH"));
	corsConfiguration.setAllowedHeaders(Arrays.asList("*"));


	corsConfiguration.setAllowCredentials(true);

	corsConfiguration.setMaxAge(36000L);

	UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

	source.registerCorsConfiguration("/**", corsConfiguration);

	return source;
}

@Bean
CompromisedPasswordChecker compromisedPasswordChecker() {
	return new HaveIBeenPwnedRestApiPasswordChecker();
}

@Bean
PasswordEncoder passwordEncoder() {
	return new BCryptPasswordEncoder();
}

@Bean
AuthenticationManager authenticationManager(AuthenticationProvider authenticationProvider) throws Exception {
	
	return	new ProviderManager(authenticationProvider);

	
}
}

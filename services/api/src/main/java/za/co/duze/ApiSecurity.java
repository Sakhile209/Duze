package za.co.duze;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.http.HttpStatus;

@Configuration
class ApiSecurity {
    @Bean
    SecurityFilterChain publicReadSecurityFilterChain(HttpSecurity http) throws Exception {
        // Public read slice only. All other routes remain closed until identity/RBAC is implemented.
        return http.authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/api/v1/merchants", "/api/v1/merchants/*/menu",
                                "/actuator/health", "/openapi.yaml").permitAll()
                        .anyRequest().denyAll())
                .exceptionHandling(errors -> errors.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .build();
    }
}

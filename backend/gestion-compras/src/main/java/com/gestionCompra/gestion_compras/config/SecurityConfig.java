package com.gestionCompra.gestion_compras.config;

import com.gestionCompra.gestion_compras.seguridad.JwtRequestFilter;
import jakarta.servlet.Filter;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    // 1. DICCIONARIO DE RUTAS PUBLICAS
    private static final String[] PUBLIC_ROUTES = {
        "/api/usuarios/login",
        "/error"
    };

    // 2. DICCIONARIO: SOLO GERENCIA
    private static final String[] GERENCIA_ONLY = {
        "/api/productos/**",
        "/api/usuarios/**",
        "/api/cierres/**",
        "/api/prioridades/**",
        "/api/aprobaciones/**",
        "/api/solicitudes/**",
        "/api/proveedores/**"
    };

    // 3. DICCIONARIO: GERENCIA Y CALIDAD (Dúo)
    private static final String[] GERENCIA_Y_CALIDAD = {
        "/api/solicitudes/historial",
        "/api/proveedores/listar",
        "/api/aprobaciones/solicitudes/aprobadas",
        "/api/aprobaciones/presupuestos/aprobadas",
        "/api/presupuestos/**",
        "/api/compras/**",
        "/api/evalProveedor/**",
        "/api/evalEntrega/**",
        "/api/reclamos/**",
        "/api/documentacion/**"
    };

    // 4. DICCIONARIO: LOS TRES ROLES (Gerencia, Administración y Calidad)
    private static final String[] TODOS_LOS_ROLES = {
        "/api/solicitudes/crear",
        "/api/solicitudes/misSolicitudes",
        "/api/productos/listar",
        "/api/prioridades/listar",
        "/api/uploads/**"
    };

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost", "http://192.168.1.200"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                .requestMatchers(PUBLIC_ROUTES).permitAll()
                .requestMatchers(HttpMethod.OPTIONS).permitAll()
                .requestMatchers(TODOS_LOS_ROLES).hasAnyAuthority("GERENCIA", "ADMINISTRACION", "CALIDAD")
                // 3. RUTAS DÚO (GERENCIA Y CALIDAD)
                .requestMatchers(GERENCIA_Y_CALIDAD).hasAnyAuthority("GERENCIA", "CALIDAD")
                // 4. RUTAS EXCLUSIVAS DE GERENCIA (Con comodines al final)
                .requestMatchers(GERENCIA_ONLY).hasAuthority("GERENCIA")
                // 5. CUALQUIER OTRA PETICIÓN
                .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.addFilterBefore((Filter) jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}

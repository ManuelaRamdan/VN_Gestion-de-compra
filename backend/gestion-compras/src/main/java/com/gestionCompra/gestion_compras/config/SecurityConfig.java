package com.gestionCompra.gestion_compras.config;

import com.gestionCompra.gestion_compras.seguridad.JwtRequestFilter;
import jakarta.servlet.Filter;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigin;

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
        configuration.setAllowedOrigins(List.of(allowedOrigin, "http://localhost:5173"));
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
                .requestMatchers("/api/uploads/**")
                .hasAuthority("PERM_UPLOADS")
                .requestMatchers("/api/solicitudes/crear")
                .hasAuthority("PERM_SOLICITUDES_CREAR")
                .requestMatchers("/api/solicitudes/misSolicitudes")
                .hasAuthority("PERM_SOLICITUDES_VER")
                .requestMatchers("/api/productos/listar")
                .hasAuthority("PERM_PRODUCTOS_VER")
                .requestMatchers("/api/prioridades/listar")
                .hasAuthority("PERM_PRIORIDADES_VER")
                .requestMatchers("/api/solicitudes/historial")
                .hasAuthority("PERM_SOLICITUDES_HISTORIAL")
                .requestMatchers("/api/proveedores/listar")
                .hasAuthority("PERM_PROVEEDORES_VER")
                .requestMatchers("/api/aprobaciones/solicitudes/aprobadas", "/api/aprobaciones/presupuestos/aprobadas")
                .hasAuthority("PERM_APROBACIONES_VER")
                .requestMatchers("/api/presupuestos/**")
                .hasAuthority("PERM_PRESUPUESTOS")
                .requestMatchers("/api/compras/**")
                .hasAuthority("PERM_COMPRAS")
                .requestMatchers("/api/evalProveedor/**")
                .hasAuthority("PERM_EVAL_PROVEEDOR")
                .requestMatchers("/api/evalEntrega/**")
                .hasAuthority("PERM_EVAL_ENTREGA")
                .requestMatchers("/api/reclamos/**")
                .hasAuthority("PERM_RECLAMOS")
                .requestMatchers("/api/documentacion/**")
                .hasAuthority("PERM_DOCUMENTACION")
                .requestMatchers("/api/productos/**")
                .hasAuthority("PERM_PRODUCTOS_ADMIN")
                .requestMatchers("/api/usuarios/**")
                .hasAuthority("PERM_USUARIOS_ADMIN")
                .requestMatchers("/api/proveedores/**")
                .hasAuthority("PERM_PROVEEDORES_ADMIN")
                .requestMatchers("/api/solicitudes/**")
                .hasAuthority("PERM_SOLICITUDES_ADMIN")
                .requestMatchers("/api/aprobaciones/**")
                .hasAuthority("PERM_APROBACIONES_ADMIN")
                .requestMatchers("/api/cierres/**")
                .hasAuthority("PERM_CIERRES")
                .requestMatchers("/api/prioridades/**")
                .hasAuthority("PERM_PRIORIDADES_ADMIN")
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

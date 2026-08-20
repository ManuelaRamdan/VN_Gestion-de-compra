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
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
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
                // Público / CORS preflight
                .requestMatchers(PUBLIC_ROUTES).permitAll()
                .requestMatchers(HttpMethod.OPTIONS).permitAll()
                // ==========================================
                // Uploads (Archivos, PDFs de Cotizaciones y Facturas)
                // ==========================================
                // 1. Permitir VER (GET) a todos los involucrados en la cadena de compras
                .requestMatchers(HttpMethod.GET, "/api/uploads/**")
                .hasAnyAuthority("PERM_UPLOADS", "PERM_PRESUPUESTOS_VER", "PERM_PRESUPUESTOS_GESTIONAR", "PERM_COMPRAS_VER", "PERM_COMPRAS_GESTIONAR", "PERM_CIERRES_VER", "PERM_CIERRES_GESTIONAR", "PERM_DOCUMENTACION_VER", "PERM_DOCUMENTACION_DESCARGAR")
                // 2. Permitir SUBIR a quienes gestionan compras y presupuestos
                .requestMatchers("/api/uploads/**")
                .hasAnyAuthority("PERM_UPLOADS", "PERM_PRESUPUESTOS_GESTIONAR", "PERM_COMPRAS_GESTIONAR")
                // ==========================================

                // Solicitudes
                .requestMatchers("/api/solicitudes/crear")
                .hasAuthority("PERM_SOLICITUDES_CREAR")
                .requestMatchers("/api/solicitudes/misSolicitudes")
                .hasAuthority("PERM_SOLICITUDES_VER")
                .requestMatchers("/api/solicitudes/historial")
                .hasAuthority("PERM_SOLICITUDES_HISTORIAL")
                .requestMatchers("/api/solicitudes/**")
                .hasAuthority("PERM_SOLICITUDES_ADMIN")
                // Productos
                .requestMatchers(HttpMethod.GET, "/api/productos/listar")
                .hasAnyAuthority("PERM_PRODUCTOS_VER", "PERM_SOLICITUDES_CREAR", "PERM_APROB_SOLI_PENDIENTES_VER", "PERM_APROB_SOLI_ACEPTADAS_VER", "PERM_APROB_SOLI_RECHAZADAS_VER", "PERM_APROB_SOLI_GESTIONAR")
                .requestMatchers(HttpMethod.POST, "/api/productos/")
                .hasAuthority("PERM_PRODUCTOS_CREAR")
                .requestMatchers(HttpMethod.PUT, "/api/productos/*")
                .hasAuthority("PERM_PRODUCTOS_EDITAR")
                .requestMatchers(HttpMethod.PATCH, "/api/productos/*")
                .hasAuthority("PERM_PRODUCTOS_BORRAR")
                .requestMatchers("/api/productos/**")
                .hasAuthority("PERM_PRODUCTOS_ADMIN")
                // Sectores
                .requestMatchers("/api/sectores/combo")
                .authenticated()
                .requestMatchers(HttpMethod.POST, "/api/sectores/")
                .hasAuthority("PERM_SECTOR_CREAR")
                .requestMatchers(HttpMethod.GET, "/api/sectores/listar", "/api/sectores/permisos", "/api/sectores/*")
                .hasAuthority("PERM_SECTOR_VER")
                .requestMatchers(HttpMethod.PUT, "/api/sectores/*")
                .hasAuthority("PERM_SECTOR_EDITAR")
                .requestMatchers(HttpMethod.PATCH, "/api/sectores/*")
                .hasAuthority("PERM_SECTOR_BORRAR")
                .requestMatchers("/api/sectores/**")
                .hasAuthority("PERM_SECTOR_ADMIN")
                // Prioridades
                .requestMatchers(HttpMethod.GET, "/api/prioridades/listar")
                .hasAnyAuthority("PERM_PRIORIDADES_VER", "PERM_SOLICITUDES_CREAR", "PERM_APROB_SOLI_PENDIENTES_VER", "PERM_APROB_SOLI_ACEPTADAS_VER", "PERM_APROB_SOLI_RECHAZADAS_VER", "PERM_APROB_SOLI_GESTIONAR")
                .requestMatchers(HttpMethod.POST, "/api/prioridades/")
                .hasAuthority("PERM_PRIORIDADES_CREAR")
                .requestMatchers(HttpMethod.PUT, "/api/prioridades/*")
                .hasAuthority("PERM_PRIORIDADES_EDITAR")
                .requestMatchers(HttpMethod.PATCH, "/api/prioridades/*")
                .hasAuthority("PERM_PRIORIDADES_BORRAR")
                .requestMatchers("/api/prioridades/**")
                .hasAuthority("PERM_PRIORIDADES_ADMIN")
                // Proveedores
                .requestMatchers(HttpMethod.GET, "/api/proveedores/listar", "/api/proveedores/todos")
                .hasAnyAuthority("PERM_PROVEEDORES_VER", "PERM_EVAL_PROVEEDOR_EDITAR", "PERM_EVAL_PROVEEDOR_VER", "PERM_PRESUPUESTOS_GESTIONAR", "PERM_PRESUPUESTOS_VER")
                .requestMatchers(HttpMethod.POST, "/api/proveedores/")
                .hasAuthority("PERM_PROVEEDORES_CREAR")
                .requestMatchers(HttpMethod.PUT, "/api/proveedores/*")
                .hasAuthority("PERM_PROVEEDORES_EDITAR")
                .requestMatchers(HttpMethod.PATCH, "/api/proveedores/*")
                .hasAuthority("PERM_PROVEEDORES_BORRAR")
                .requestMatchers("/api/proveedores/**")
                .hasAuthority("PERM_PROVEEDORES_ADMIN")
                // ===============================
                // Aprobaciones
                // ===============================

                // 1. Solicitudes (Aprobadas para Presupuestos, y Base para Panel de Aprobación)
                .requestMatchers(HttpMethod.GET, "/api/aprobaciones/solicitudes/aprobadas", "/api/aprobaciones/solicitudes")
                .hasAnyAuthority("PERM_APROB_SOLI_ACEPTADAS_VER", "PERM_APROB_SOLI_PENDIENTES_VER", "PERM_APROB_SOLI_RECHAZADAS_VER", "PERM_APROB_SOLI_GESTIONAR", "PERM_PRESUPUESTOS_GESTIONAR", "PERM_PRESUPUESTOS_VER")
                // 2. Presupuestos (Aprobados para Compras, y Base para Panel de Aprobación)
                .requestMatchers(HttpMethod.GET, "/api/aprobaciones/presupuestos/aprobadas", "/api/aprobaciones/presupuestos")
                .hasAnyAuthority("PERM_APROB_PRESU_EVALUADAS_VER", "PERM_APROB_PRESU_PENDIENTES_VER", "PERM_APROB_PRESU_GESTIONAR", "PERM_COMPRAS_GESTIONAR", "PERM_COMPRAS_VER")
                // 3. Resto de Aprobaciones (POST, etc)
                .requestMatchers("/api/aprobaciones/solicitudes/**").hasAnyAuthority("PERM_APROB_SOLI_GESTIONAR", "PERM_APROBACIONES_ADMIN")
                .requestMatchers("/api/aprobaciones/presupuestos/**").hasAnyAuthority("PERM_APROB_PRESU_GESTIONAR", "PERM_APROBACIONES_ADMIN")
                .requestMatchers("/api/aprobaciones/**").hasAuthority("PERM_APROBACIONES_ADMIN")
                // Presupuestos
                .requestMatchers(HttpMethod.GET, "/api/presupuestos/**")
                .hasAnyAuthority("PERM_PRESUPUESTOS_VER", "PERM_PRESUPUESTOS_GESTIONAR")
                .requestMatchers("/api/presupuestos/**")
                .hasAuthority("PERM_PRESUPUESTOS_GESTIONAR")
                // Compras
                .requestMatchers(HttpMethod.GET, "/api/compras/**")
                .hasAnyAuthority("PERM_COMPRAS_VER", "PERM_COMPRAS_GESTIONAR", "PERM_EVAL_ENTREGA_EDITAR", "PERM_EVAL_ENTREGA_VER")
                .requestMatchers("/api/compras/**")
                .hasAuthority("PERM_COMPRAS_GESTIONAR")
                // Cierres
                .requestMatchers(HttpMethod.GET, "/api/cierres/**")
                .hasAnyAuthority("PERM_CIERRES_VER", "PERM_CIERRES_GESTIONAR", "PERM_DOCUMENTACION_VER")
                .requestMatchers("/api/cierres/**")
                .hasAuthority("PERM_CIERRES_GESTIONAR")
                // Evaluación de proveedores
                .requestMatchers(HttpMethod.GET, "/api/evalProveedor/descargar/**", "/api/evalProveedor/descargar-periodo")
                .hasAuthority("PERM_EVAL_PROVEEDOR_DESCARGAR")
                .requestMatchers(HttpMethod.GET, "/api/evalProveedor/**")
                .hasAnyAuthority("PERM_EVAL_PROVEEDOR_VER", "PERM_EVAL_PROVEEDOR_EDITAR", "PERM_CIERRES_GESTIONAR", "PERM_CIERRES_VER")
                .requestMatchers("/api/evalProveedor/**")
                .hasAuthority("PERM_EVAL_PROVEEDOR_EDITAR")
                // Evaluación de entregas
                .requestMatchers(HttpMethod.GET, "/api/evalEntrega/**")
                .hasAnyAuthority("PERM_EVAL_ENTREGA_VER", "PERM_EVAL_ENTREGA_EDITAR", "PERM_CIERRES_GESTIONAR", "PERM_CIERRES_VER")
                .requestMatchers("/api/evalEntrega/**")
                .hasAuthority("PERM_EVAL_ENTREGA_EDITAR")
                // Reclamos
                .requestMatchers(HttpMethod.GET, "/api/reclamos/**")
                .hasAnyAuthority("PERM_RECLAMOS", "PERM_CIERRES_VER", "PERM_CIERRES_GESTIONAR", "PERM_DOCUMENTACION_VER", "PERM_EVAL_ENTREGA_VER", "PERM_EVAL_ENTREGA_EDITAR")
                .requestMatchers("/api/reclamos/**")
                .hasAnyAuthority("PERM_RECLAMOS", "PERM_EVAL_ENTREGA_EDITAR")
                // Documentación
                .requestMatchers(HttpMethod.GET, "/api/documentacion/descargar/**", "/api/documentacion/descargar-periodo")
                .hasAuthority("PERM_DOCUMENTACION_DESCARGAR")
                .requestMatchers("/api/documentacion/**")
                .hasAuthority("PERM_DOCUMENTACION_VER")
                // Usuarios
                .requestMatchers(HttpMethod.POST, "/api/usuarios/logout")
                .authenticated()
                .requestMatchers(HttpMethod.POST, "/api/usuarios/registrar")
                .hasAuthority("PERM_USUARIOS_CREAR")
                .requestMatchers(HttpMethod.GET, "/api/usuarios/", "/api/usuarios/*")
                .hasAuthority("PERM_USUARIOS_VER")
                .requestMatchers(HttpMethod.PUT, "/api/usuarios/*")
                .hasAuthority("PERM_USUARIOS_EDITAR")
                .requestMatchers(HttpMethod.PATCH, "/api/usuarios/*")
                .hasAuthority("PERM_USUARIOS_BORRAR")
                .requestMatchers("/api/usuarios/**")
                .hasAuthority("PERM_USUARIOS_ADMIN")
                // Resto de rutas
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

/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.seguridad;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gestionCompra.gestion_compras.dto.ErrorResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import org.springframework.http.HttpStatus;


@Component

// intercepta las peticiones http y verifica que el token sea valido y no este expirado
// OncePerRequestFilter -> hace que esto se ejetute una vez por peticion
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private UserDetailsService userDetailsService; // Inyecta la interfaz, no la clase concreta

    @Autowired
    private JwtUtil jwtUtil;

    @Override
protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
        throws ServletException, IOException {

    final String authorizationHeader = request.getHeader("Authorization");

    String username = null;
    String jwt = null;

    try {
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            username = jwtUtil.extractUsername(jwt);
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            if (jwtUtil.validateToken(jwt, userDetails.getUsername())) {
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }
    } catch (io.jsonwebtoken.ExpiredJwtException e) {
        enviarError(response, HttpStatus.UNAUTHORIZED, "Token expirado");
    return;
        // No seteamos el contexto de seguridad, simplemente dejamos que siga
        // Así Spring Security devolverá un 401 si la ruta es protegida.
    } catch (Exception e) {
        enviarError(response, HttpStatus.UNAUTHORIZED, "Token inválido");
        return;
    }
    
    chain.doFilter(request, response);
}

     private void enviarError(HttpServletResponse response,
                             HttpStatus status,
                             String mensaje) throws IOException {

        response.setStatus(status.value());
        response.setContentType("application/json");

        ErrorResponse error = new ErrorResponse(
                mensaje,
                status.value(),
                System.currentTimeMillis()
        );

        ObjectMapper mapper = new ObjectMapper();
        response.getWriter().write(mapper.writeValueAsString(error));
    }
}
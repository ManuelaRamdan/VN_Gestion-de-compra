/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.seguridad;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;

@Component // un objeto que puede inyectar en otros lados
public class JwtUtil {

    @Value("${config.jwt.secret}")
    private String secret;


    /*
    hmacShaKeyFor -> Transforma tu texto secreto en una clave criptográfica segura compatible con el 
    algoritmo HMAC -> mecanismo criptográfico que combina una función hash (como SHA-256) 
    con una clave secreta compartida para generar un código de autenticación de tamaño fijo
                    
    
     */
    private Key key;
    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(UsuarioDetalles usuario) {

        // HashMap -> estructura de datos que almacena información en pares de clave-valor
        Map<String, Object> claims = new HashMap<>();
        claims.put("rol", usuario.getSector());
        
        claims.put("id", usuario.getId());

        return Jwts.builder()
                .setClaims(claims) // Son datos extra que guardas dentro del token (en este caso, el sector/rol).
                .setSubject(usuario.getUsername()) // Define el dueño del token (el nombre de usuario).
                .setIssuedAt(new Date(System.currentTimeMillis())) // Marca el momento exacto en que se creó el token.
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 5)) // 10 horas
                .signWith(key, SignatureAlgorithm.HS256) // Firma el token usando tu clave y el algoritmo de seguridad.
                .compact();
    }

    //Lee el token que envía el cliente y extrae el nombre de usuario para saber quién es.
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    // valida la firma del token con la clave 
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // valida que el usuario que quiere entrar sea el mismo que el token y que este no este expirado
    public boolean validateToken(String token, String username) {
        final String tokenUsername = extractUsername(token);
        return (tokenUsername.equals(username) && !isTokenExpired(token));
    }

    // compara la fecha de expiracion con la fecha del servidor
    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }
}

package com.gestionCompra.gestion_compras.controller;

import com.gestionCompra.gestion_compras.dto.RegistroRequest;
import com.gestionCompra.gestion_compras.domain.entidades.Usuario;
import com.gestionCompra.gestion_compras.dto.ManejoErrores;
import com.gestionCompra.gestion_compras.dto.Paginacion;
import com.gestionCompra.gestion_compras.repository.UsuarioRepo;
import com.gestionCompra.gestion_compras.seguridad.JwtUtil;
import com.gestionCompra.gestion_compras.seguridad.UsuarioDetalles;
import com.gestionCompra.gestion_compras.service.UsuarioService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private UsuarioRepo usuarioRepo;

    @Autowired
    private JwtUtil jwtUtil;

    // true en el servidor real (HTTPS). Se puede parametrizar por .env si querés
    // usar el mismo código en local sin HTTPS.
    @Value("${app.cookie.secure:true}")
    private boolean cookieSecure;

    @PostMapping("/login")
    public ResponseEntity<?> crearAutenticacionToken(@RequestBody Map<String, String> request,
                                                       HttpServletResponse response) throws Exception {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.get("username"), request.get("password"))
            );
        } catch (Exception e) {
            throw new ManejoErrores(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas o usuario inactivo");
        }

        final UsuarioDetalles userDetails = (UsuarioDetalles) usuarioService.loadUserByUsername(request.get("username"));
        final String jwt = jwtUtil.generateToken(userDetails);

        // Seteamos el JWT como cookie httpOnly en vez de devolverlo en el body
        ResponseCookie cookie = ResponseCookie.from("token", jwt)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path("/")
                .maxAge(60 * 60) // 1 hora, igual que la expiración del JWT
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        Map<String, Object> body = new HashMap<>();
        body.put("username", userDetails.getUsername());
        body.put("rol", userDetails.getSector());
        body.put("permisos", userDetails.getAuthorities()
                .stream()
                .map(a -> a.getAuthority())
                .collect(java.util.stream.Collectors.toList()));

        return ResponseEntity.ok(body);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("token", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path("/")
                .maxAge(0) // Expira inmediatamente
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok(Map.of("message", "Sesión cerrada"));
    }

    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@RequestBody RegistroRequest request) {
        Usuario creado = usuarioService.registrarNuevoUsuario(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Usuario registrado exitosamente",
                "username", creado.getUsername()
        ));
    }

    @GetMapping("/")
    public ResponseEntity<?> listarUsuariosPaginados(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        try {
            Pageable pageable = PageRequest.of(
                    page,
                    size,
                    Sort.by(Sort.Direction.DESC, "idUsuario")
            );
            Page<Usuario> usuariosPage = usuarioService.listarUsuariosActivos(pageable);

            return ResponseEntity.ok(new Paginacion<>(usuariosPage));
        } catch (Exception e) {
            throw new ManejoErrores(HttpStatus.INTERNAL_SERVER_ERROR, "Error al listar usuarios: " + e.getMessage());
        }
    }

    @GetMapping("/{id_usuario}")
    public ResponseEntity<?> listarByIdUsuario(@PathVariable Integer id_usuario) {
        try {
            Usuario usuarioBuscado = usuarioService.buscarUsuario(id_usuario);
            return ResponseEntity.ok(usuarioBuscado);
        } catch (Exception e) {
            throw new ManejoErrores(HttpStatus.INTERNAL_SERVER_ERROR, "Usuario no encontrado");
        }
    }

    @PutMapping("/{id_usuario}")
    public ResponseEntity<?> modificar(@PathVariable Integer id_usuario, @RequestBody RegistroRequest request) {
        Usuario actualizado = usuarioService.modificarUsuario(id_usuario, request);
        return ResponseEntity.ok(Map.of(
                "message", "Usuario actualizado exitosamente",
                "username", actualizado.getUsername()
        ));
    }

    @PatchMapping("/{id_usuario}")
    public ResponseEntity<?> darDeBaja(@PathVariable Integer id_usuario) {
        usuarioService.bajaLogica(id_usuario);
        return ResponseEntity.ok(Map.of("message", "Usuario desactivado correctamente"));
    }
}
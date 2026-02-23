/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.controller;

import com.gestionCompra.gestion_compras.dto.RegistroRequest;
import com.gestionCompra.gestion_compras.domain.entidades.Usuario;
import com.gestionCompra.gestion_compras.dto.ManejoErrores;
import com.gestionCompra.gestion_compras.dto.Paginacion;
import com.gestionCompra.gestion_compras.repository.UsuarioRepo;
import com.gestionCompra.gestion_compras.seguridad.JwtUtil;
import com.gestionCompra.gestion_compras.seguridad.UsuarioDetalles;
import com.gestionCompra.gestion_compras.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
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

    @PostMapping("/login")
    public ResponseEntity<?> crearAutenticacionToken(@RequestBody Map<String, String> request) throws Exception {
        try {
            // Spring busca al usuario y compara la contraseña automáticamente
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.get("username"), request.get("password"))
            );
        } catch (Exception e) {
            throw new ManejoErrores(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas o usuario inactivo");
        }

        // Si llegó aquí, los datos están bien. Generamos el token.
        final UsuarioDetalles userDetails = (UsuarioDetalles) usuarioService.loadUserByUsername(request.get("username"));
        final String jwt = jwtUtil.generateToken(userDetails);

        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("username", userDetails.getUsername());
        response.put("rol", userDetails.getSector());

        return ResponseEntity.ok(response);
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
            // Spring Data JPA usa PageRequest para manejar el LIMIT y OFFSET de SQL
             Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "idUsuario")
        );
            // El repo devuelve un objeto Page con contenido y metadatos de paginación
            Page<Usuario> usuariosPage = usuarioService.listarUsuariosActivos(pageable);

            return ResponseEntity.ok(new Paginacion<>(usuariosPage));
        } catch (Exception e) {
            throw new ManejoErrores(HttpStatus.INTERNAL_SERVER_ERROR, "Error al listar usuarios: " + e.getMessage());
           
        }
    }
    
    @GetMapping("/{id_usuario}")
    public ResponseEntity<?> listarByIdUsuario(
            @PathVariable Integer id_usuario) {

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

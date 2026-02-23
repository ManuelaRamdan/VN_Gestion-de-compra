/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.controller;

import com.gestionCompra.gestion_compras.domain.entidades.Cierre;
import com.gestionCompra.gestion_compras.domain.entidades.Reclamo;
import com.gestionCompra.gestion_compras.domain.entidades.Usuario;
import com.gestionCompra.gestion_compras.dto.ManejoErrores;
import com.gestionCompra.gestion_compras.repository.UsuarioRepo;
import com.gestionCompra.gestion_compras.service.CierreService;
import com.gestionCompra.gestion_compras.service.ReclamoService;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author Usuario
 */
@RestController
@RequestMapping("/api/cierres")
public class CierreController {

    @Autowired
    private CierreService service;
    
        @Autowired
    private UsuarioRepo usuarioRepo;

    @GetMapping("/")
    public ResponseEntity<?> listarTodo(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "idCierre")
        );
        return ResponseEntity.ok(service.findAll(pageable));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Cierre> mostrarCierreById(@PathVariable Integer id) {
        Cierre lista = service.findById(id);
        return ResponseEntity.ok(lista);
    }

    // CREAR RECLAMO (Alta vinculada a idEvaluacionEntrega)
    @PostMapping("/")
    public ResponseEntity<?> crear(@RequestBody Map<String, Object> request, Authentication authentication) {
        try {
            // 1. Validación de campos obligatorios desde el request
            if (!request.containsKey("idEvalEntrega") || request.get("idEvalEntrega") == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Falta el campo obligatorio: idEvalEntrega"));
            }

            String username = authentication.getName();
            Usuario usuario = usuarioRepo.findByUsernameAndActivoTrue(username)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));


            // 3. Extraer el ID de la evaluación
            Integer idEval = ((Number) request.get("idEvalEntrega")).intValue();

            // 4. Construir el objeto Cierre con los datos adicionales
            Cierre cierre = new Cierre();
            cierre.setUsuario(usuario);
            cierre.setObservaciones((String) request.get("observaciones"));
            // La fecha se asigna automáticamente en el Service como LocalDate.now()

            // 5. Llamar al servicio
            Cierre nuevoCierre = service.crearCierre(idEval, cierre);

            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoCierre);

        } catch (ManejoErrores e) {
            // Captura tus excepciones personalizadas (404, 409, etc.)
            return ResponseEntity.status(e.getStatus()).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error inesperado: " + e.getMessage()));
        }
    }

    // MODIFICAR RECLAMO
    @PutMapping("/{id}")
    public ResponseEntity<?> modificar(@PathVariable Integer id, @RequestBody Cierre datos) {
        try {
            Cierre actualizada = service.modificarCierre(id, datos);
            return ResponseEntity.ok(Map.of(
                    "message", "Cierre actualizado correctamente",
                    "data", actualizada
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/evaluacion/{idEval}")
    public ResponseEntity<?> obtenerCierrePorEvaluacion(@PathVariable Integer idEval) {
        try {
            Optional<Cierre> cierre = service.buscarPorIdEvaluacion(idEval);
            if (cierre.isPresent()) {
                return ResponseEntity.ok(cierre.get());
            } else {
                return ResponseEntity.notFound().build(); // Devuelve 404 si no existe (React lo maneja bien)
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

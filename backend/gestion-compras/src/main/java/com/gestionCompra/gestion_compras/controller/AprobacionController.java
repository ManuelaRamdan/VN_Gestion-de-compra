/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.controller;

import com.gestionCompra.gestion_compras.domain.entidades.AprobacionPresupuesto;
import com.gestionCompra.gestion_compras.domain.entidades.AprobacionSolicitud;
import com.gestionCompra.gestion_compras.domain.entidades.Solicitud;
import com.gestionCompra.gestion_compras.domain.entidades.Usuario;
import com.gestionCompra.gestion_compras.dto.Paginacion;
import com.gestionCompra.gestion_compras.repository.UsuarioRepo;
import com.gestionCompra.gestion_compras.service.AprobacionPresupuestoService;
import com.gestionCompra.gestion_compras.service.AprobacionSolicitudService;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/aprobaciones")
public class AprobacionController {

    @Autowired
    private AprobacionSolicitudService aprobacionService;

    @Autowired
    private AprobacionPresupuestoService aprobacionPService;

    @Autowired
    private UsuarioRepo usuarioRepo;

    @PostMapping("/solicitudes/{id}")
    public ResponseEntity<?> decidirSolicitud(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {

        String estado = validarYObtenerEstado(body);
        Usuario gerente = obtenerGerenteAutenticado();
        String cometarios = body.get("comentarios");

        try {
            // El servicio procesa la solicitud
            AprobacionSolicitud resultado = aprobacionService.procesarDecision(id, estado, gerente,  cometarios);

            return ResponseEntity.ok(Map.of(
                    "mensaje", "Solicitud actualizada",
                    "idSolicitud", id,
                    "nuevoEstado", resultado.getEstado(), // Devuelve String
                    "gerente", gerente.getUsername()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/solicitudes")
    public ResponseEntity<?> listarSolicitudSegunEstado(
            @RequestParam(defaultValue = "PENDIENTE") String estado,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

         Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "fecha")
        );

        try {
            // Usamos el nuevo método que filtra por cerrado = false
            Paginacion<AprobacionSolicitud> lista = aprobacionService.listarPorEstadoAbiertas(estado.toUpperCase(), pageable);

            if (lista.estaVacio()) {
                return ResponseEntity.ok(Map.of(
                        "status", "success",
                        "message", "No hay aprobaciones de solicitudes " + estado + " activas",
                        "contenido", List.of()
                ));
            }

            return ResponseEntity.ok(lista);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/solicitudes/aprobadas")
    public ResponseEntity<?> listarSolicitudAprobadas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "fecha")
        );
        String estado = "APROBADA";

        try {
            // Usamos el nuevo método que filtra por cerrado = false
            Paginacion<AprobacionSolicitud> lista = aprobacionService.listarPorEstadoAbiertas(estado.toUpperCase(), pageable);

            if (lista.estaVacio()) {
                return ResponseEntity.ok(Map.of(
                        "status", "success",
                        "message", "No hay aprobaciones de solicitudes " + estado + " activas",
                        "contenido", List.of()
                ));
            }

            return ResponseEntity.ok(lista);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/solicitudes/{id}")
    public ResponseEntity<AprobacionSolicitud> buscarByIdSoli(@PathVariable Integer id) {
        AprobacionSolicitud lista = aprobacionService.buscaridAprobSoli(id);
        return ResponseEntity.ok(lista);
    }
    
    @GetMapping("/presupuestos/{id}")
    public ResponseEntity<AprobacionPresupuesto> buscarByIdPresu(@PathVariable Integer id) {
        AprobacionPresupuesto lista = aprobacionPService.buscaridAprobPresu(id);
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/presupuestos")
    public ResponseEntity<?> listarPresupuestoSegunEstado(
            @RequestParam(defaultValue = "PENDIENTE") String estado,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

         Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "fecha")
        );

        try {
            // Usamos el método que navega hasta Solicitud para ver si está cerrada
            Paginacion<AprobacionPresupuesto> lista = aprobacionPService.listarPorEstadoAbiertas(estado.toUpperCase(), pageable);

            if (lista.estaVacio()) {
                return ResponseEntity.ok(Map.of(
                        "status", "success",
                        "message", "No hay aprobaciones de presupuestos " + estado + " activas",
                        "contenido", List.of()
                ));
            }

            return ResponseEntity.ok(lista);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/presupuestos/{id}")
    public ResponseEntity<?> decidirPresupuesto(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {

        String estado = validarYObtenerEstado(body);
        Usuario gerente = obtenerGerenteAutenticado();

        try {
            // El servicio procesa el presupuesto
            AprobacionPresupuesto resultado = aprobacionPService.procesarDecision(id, estado, gerente);

            return ResponseEntity.ok(Map.of(
                    "mensaje", "Presupuesto actualizado",
                    "idPresupuesto", id,
                    "nuevoEstado", resultado.getEstado(), // Devuelve String
                    "gerente", gerente.getUsername()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // Métodos privados para evitar repetición de código
    private String validarYObtenerEstado(Map<String, String> body) {
        String estado = body.get("estado");
        if (estado == null || (!estado.equalsIgnoreCase("APROBADA") && !estado.equalsIgnoreCase("RECHAZADA"))) {
            throw new RuntimeException("El estado debe ser APROBADA o RECHAZADA");
        }
        return estado.toUpperCase();
    }

    private Usuario obtenerGerenteAutenticado() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepo.findByUsernameAndActivoTrue(username)
                .orElseThrow(() -> new RuntimeException("Usuario gerente no encontrado"));
    }
    
    @GetMapping("/sinAprobPresu")
    public ResponseEntity<?> ListarAprobPSinCompra(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(aprobacionPService.listarAprobPSinCompra(pageable));
    }
    
    
    @GetMapping("/presupuestos/aprobadas")
    public ResponseEntity<?> listarPresuAprobadas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

       Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "fecha")
        );
        String estado = "APROBADA";

        try {
            // Usamos el nuevo método que filtra por cerrado = false
            Paginacion<AprobacionPresupuesto> lista = aprobacionPService.listarPorEstadoAbiertas(estado.toUpperCase(), pageable);

            if (lista.estaVacio()) {
                return ResponseEntity.ok(Map.of(
                        "status", "success",
                        "message", "No hay aprobaciones de solicitudes " + estado + " activas",
                        "contenido", List.of()
                ));
            }

            return ResponseEntity.ok(lista);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}

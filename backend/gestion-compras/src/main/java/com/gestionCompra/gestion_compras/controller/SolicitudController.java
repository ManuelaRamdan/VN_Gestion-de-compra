/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.controller;

import com.gestionCompra.gestion_compras.domain.entidades.AprobacionSolicitud;
import com.gestionCompra.gestion_compras.domain.entidades.NivelPrioridad;
import com.gestionCompra.gestion_compras.domain.entidades.Producto;
import com.gestionCompra.gestion_compras.domain.entidades.Solicitud;
import com.gestionCompra.gestion_compras.domain.entidades.Usuario;
import com.gestionCompra.gestion_compras.dto.Paginacion;
import com.gestionCompra.gestion_compras.dto.SolicitudRequest;
import com.gestionCompra.gestion_compras.dto.SolicitudResumenDTO;
import com.gestionCompra.gestion_compras.repository.UsuarioRepo;
import com.gestionCompra.gestion_compras.seguridad.UsuarioDetalles;
import com.gestionCompra.gestion_compras.service.AprobacionSolicitudService;
import com.gestionCompra.gestion_compras.service.NivelPrioridadService;
import com.gestionCompra.gestion_compras.service.ProductoService;
import com.gestionCompra.gestion_compras.service.SolicitudService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudController {

    private final SolicitudService solicitudService;
    private final ProductoService productoService;
    private final NivelPrioridadService nivelPrioridadService;
    private final UsuarioRepo usuarioRepo; // Necesario para buscar el usuario del token

    @Autowired
    private AprobacionSolicitudService aprobacionService;

    public SolicitudController(SolicitudService solicitudService,
            ProductoService productoService,
            NivelPrioridadService nivelPrioridadService,
            UsuarioRepo usuarioRepo) {
        this.solicitudService = solicitudService;
        this.productoService = productoService;
        this.nivelPrioridadService = nivelPrioridadService;
        this.usuarioRepo = usuarioRepo;
    }

    @PostMapping("/crear")
    public ResponseEntity<?> crearSolicitud(@RequestBody SolicitudRequest request, Authentication authentication) {
        try {
            // 1. Obtener usuario del contexto de seguridad (Token JWT)
            String username = authentication.getName();
            Usuario usuario = usuarioRepo.findByUsernameAndActivoTrue(username)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            // 2. Buscar Producto y Prioridad
            Producto producto = productoService.findById(request.idProducto());
            NivelPrioridad nivel = nivelPrioridadService.findById(request.idNivelPrioridad());

            // 3. Construir la Solicitud
            Solicitud solicitud = new Solicitud();
            solicitud.setUsuario(usuario);
            solicitud.setProducto(producto);
            solicitud.setCantidad(request.cantidad());
            solicitud.setNivelPrioridad(nivel);
            solicitud.setFecha(LocalDateTime.now());
            solicitud.setFechaAdmisible(solicitud.getFecha().plusDays(nivel.getDias()));

            // 4. Guardar
            solicitudService.guardar(solicitud);

            return ResponseEntity.ok(Map.of(
                    "message", "Solicitud creada exitosamente",
                    "solicitud", solicitud
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/")
    public ResponseEntity<Paginacion<Solicitud>> listarSolicitudes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "fecha")
        );

        return ResponseEntity.ok(solicitudService.findAllAbiertas(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Solicitud> mostrarSolicitudById(@PathVariable Integer id) {
        Solicitud lista = solicitudService.buscarSolicitudbyId(id);
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<Paginacion<Solicitud>> listarByIdUsuario(
            @PathVariable Integer idUsuario, // Ahora es PathVariable
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);

        // Buscamos directamente por el ID que viene en la URL
        Paginacion<Solicitud> solicitudes = solicitudService.listarPorUsuario(idUsuario, pageable);

        return ResponseEntity.ok(solicitudes);
    }

    @GetMapping("/misSolicitudes")
    public ResponseEntity<SolicitudResumenDTO> listarMisSolicitudes(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        UsuarioDetalles detalles = (UsuarioDetalles) authentication.getPrincipal();
        Integer id = detalles.getId();

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "fecha")
        );

        Paginacion<Solicitud> solicitudes = solicitudService.listarPorUsuario(id, pageable);

        long pendientes = solicitudService.countByUsuarioIdAndAprobacionEstado(id, "PENDIENTE");
        long aprobadas = solicitudService.countByUsuarioIdAndAprobacionEstado(id, "APROBADA");

        // *Nota: Si no tienes acceso directo al repo aquí, agrega estos métodos count a tu SolicitudService*
        // 3. Crear el DTO combinado
        SolicitudResumenDTO respuesta = new SolicitudResumenDTO(solicitudes, pendientes, aprobadas);

        return ResponseEntity.ok(respuesta);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> modificar(@PathVariable Integer id, @RequestBody Map<String, Object> datos) {
        try {
            Solicitud actualizada = solicitudService.modificar(id, datos);
            return ResponseEntity.ok(Map.of(
                    "message", "Solicitud actualizada correctamente",
                    "data", actualizada
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

}

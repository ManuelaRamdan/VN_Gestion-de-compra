package com.gestionCompra.gestion_compras.controller;

import com.gestionCompra.gestion_compras.domain.entidades.AprobacionSolicitud;
import com.gestionCompra.gestion_compras.domain.entidades.Presupuesto;
import com.gestionCompra.gestion_compras.domain.entidades.Usuario;
import com.gestionCompra.gestion_compras.dto.ManejoErrores;
import com.gestionCompra.gestion_compras.dto.Paginacion;
import com.gestionCompra.gestion_compras.repository.UsuarioRepo;
import com.gestionCompra.gestion_compras.service.AprobacionPresupuestoService;
import com.gestionCompra.gestion_compras.service.AprobacionSolicitudService;
import com.gestionCompra.gestion_compras.service.PresupuestoService;
import com.gestionCompra.gestion_compras.service.ProveedorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/presupuestos")
public class PresupuestoController {

    @Autowired
    private PresupuestoService presupuestoService;

    @Autowired
    private AprobacionSolicitudService aprobacionService;

    @Autowired
    private AprobacionPresupuestoService aprobacionPService;

    @Autowired
    private UsuarioRepo usuarioRepo;

    @Autowired
    private ProveedorService proveedorService;

    // --- GUARDAR PRESUPUESTO ---
    @PostMapping(value = "/solicitud/{idAprobSolicitud}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> guardarPresupuesto(
            @PathVariable Integer idAprobSolicitud,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("idProveedor") Integer idProveedor,
            @RequestParam("fechaSolicitud") String fechaSolicitud,
            @RequestParam("fechaRecepcion") String fechaRecepcion,
            @RequestParam(value = "observaciones", required = false) String observaciones,
            @RequestParam(value = "cotizacionSatisfactoria", defaultValue = "false") Boolean cotizacionSatisfactoria
    ) {

        try {
            Presupuesto presupuesto = new Presupuesto();
            Integer idSoli = idAprobSolicitud;

            AprobacionSolicitud solicitudDb = aprobacionService.findById(idSoli);

            if (solicitudDb == null) {
                throw new RuntimeException("La solicitud de aprobación no existe.");
            }

            if (!"APROBADA".equals(solicitudDb.getEstado())) {
                throw new RuntimeException("No se pueden cargar presupuestos: La solicitud aún no ha sido aprobada por el jefe de sector.");
            }

            // Verificar si ya hay un presupuesto APROBADO
            boolean yaExisteGanador = aprobacionPService.existsByPresupuesto_AprobacionSolicitud_IdAndEstado(idSoli, "APROBADA");
            if (yaExisteGanador) {
                throw new RuntimeException("Operación bloqueada: Ya existe un presupuesto APROBADO para esta solicitud.");
            }

            long cantidadExistente = presupuestoService.countByAprobacionSolicitud_Id(idSoli);
            if (cantidadExistente >= 4) {
                throw new RuntimeException("Límite alcanzado: Una solicitud solo puede tener hasta 4 presupuestos.");
            }

            LocalDate fechaAprobacion = solicitudDb.getFecha().toLocalDate();
            LocalDate fechaSol = null;
            LocalDate fechaRec = null;

            if (fechaSolicitud != null && !fechaSolicitud.isEmpty()) {
                fechaSol = LocalDate.parse(fechaSolicitud);
            }
            if (fechaRecepcion != null && !fechaRecepcion.isEmpty()) {
                fechaRec = LocalDate.parse(fechaRecepcion);
            }

            // Validaciones fechas
            if (fechaSol != null && fechaSol.isBefore(fechaAprobacion)) {
                return ResponseEntity.badRequest().body(Map.of("error", "La fecha de solicitud no puede ser anterior a la aprobación (" + fechaAprobacion + ")."));
            }
            if (fechaRec != null && fechaRec.isBefore(fechaAprobacion)) {
                return ResponseEntity.badRequest().body(Map.of("error", "La fecha de recepción no puede ser anterior a la aprobación (" + fechaAprobacion + ")."));
            }
            if (fechaSol != null && fechaRec != null && fechaSol.isAfter(fechaRec)) {
                throw new IllegalArgumentException("Error: La fecha de solicitud no puede ser posterior a la fecha de recepción.");
            }

            // Asignar datos
            presupuesto.setFechaSolicitud(fechaSol);
            presupuesto.setFechaRecepcion(fechaRec);
            presupuesto.setObservaciones(observaciones);
            presupuesto.setCotizacionSatisfactoria(cotizacionSatisfactoria);
            presupuesto.setAprobacionSolicitud(solicitudDb);
            presupuesto.setProveedor(proveedorService.findById(idProveedor));

            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            Usuario usuarioCarga = usuarioRepo.findByUsernameAndActivoTrue(username)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            presupuesto.setUsuario(usuarioCarga);

            if (file != null && !file.isEmpty()) {
                String nombreArchivo = presupuestoService.guardarArchivo(file);
                presupuesto.setArchivoPdfPath(nombreArchivo);
            }

            Presupuesto nuevo = presupuestoService.crearPresupuesto(presupuesto);
            return ResponseEntity.ok(nuevo);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- ACTUALIZAR PRESUPUESTO (Lógica corregida) ---
    @PatchMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> actualizarPresupuesto(
            @PathVariable Integer id,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(required = false) Integer idProveedor,
            @RequestParam(required = false) String fechaSolicitud,
            @RequestParam(required = false) String fechaRecepcion,
            @RequestParam(required = false) String observaciones,
            @RequestParam(required = false) Boolean cotizacionSatisfactoria
    ) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            Usuario usuarioModificador = usuarioRepo.findByUsernameAndActivoTrue(username)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            Map<String, Object> camposActualizar = new HashMap<>();

            // Cargamos el mapa de cambios (La validación de fechas vs aprobación original es mejor hacerla en el Service si es crítica,
            // pero para simplificar, dejamos que el Service valide integridad general y aquí pasamos los datos).
            if (fechaSolicitud != null) camposActualizar.put("fecha_solicitud", fechaSolicitud);
            if (fechaRecepcion != null) camposActualizar.put("fecha_recepcion", fechaRecepcion);
            if (idProveedor != null) camposActualizar.put("id_proveedor", idProveedor);
            if (observaciones != null) camposActualizar.put("observaciones", observaciones);
            if (cotizacionSatisfactoria != null) camposActualizar.put("cotizacion_satisfactoria", cotizacionSatisfactoria);

            if (file != null && !file.isEmpty()) {
                String nombreArchivo = presupuestoService.guardarArchivo(file);
                camposActualizar.put("archivo_pdf_path", nombreArchivo);
            }

            // LLAMADA AL SERVICIO: Aquí ocurrirá la validación de Estado (PENDIENTE/APROBADA/RECHAZADA)
            Presupuesto actualizado = presupuestoService.modificarPresupuesto(id, camposActualizar, usuarioModificador.getSector().getNombre());
            
            return ResponseEntity.ok(actualizado);

        } catch (ManejoErrores e) {
            // Captura la excepción personalizada (Estado no PENDIENTE) y devuelve 400
            return ResponseEntity.status(e.getStatus()).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/solicitud/{idAprobSolicitud}")
    public ResponseEntity<?> listar(@PathVariable Integer idAprobSolicitud, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        try {
            Paginacion<Presupuesto> lista = presupuestoService.listarPorSolicitudAbierta(idAprobSolicitud, pageable);
            if (lista.estaVacio()) {
                return ResponseEntity.ok(Map.of("status", "success", "message", "No hay presupuestos activos", "contenido", List.of()));
            }
            return ResponseEntity.ok(lista);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/")
    public ResponseEntity<?> listarTodo(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(presupuestoService.listarTodo(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Presupuesto> mostrarPresuById(@PathVariable Integer id) {
        Presupuesto lista = presupuestoService.buscarPresupuestoById(id);
        return ResponseEntity.ok(lista);
    }
}
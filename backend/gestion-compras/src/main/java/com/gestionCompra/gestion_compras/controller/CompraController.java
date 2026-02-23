package com.gestionCompra.gestion_compras.controller;

import com.gestionCompra.gestion_compras.domain.entidades.AprobacionPresupuesto;
import com.gestionCompra.gestion_compras.domain.entidades.Compra;
import com.gestionCompra.gestion_compras.domain.entidades.Usuario;
import com.gestionCompra.gestion_compras.dto.ManejoErrores;
import com.gestionCompra.gestion_compras.repository.CompraRepo;
import com.gestionCompra.gestion_compras.repository.EvaluacionEntregaRepo;
import com.gestionCompra.gestion_compras.repository.UsuarioRepo;
import com.gestionCompra.gestion_compras.service.AprobacionPresupuestoService;
import com.gestionCompra.gestion_compras.service.CompraService;
import com.gestionCompra.gestion_compras.service.EvaluacionEntregaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import java.util.HashMap;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/compras")
public class CompraController {

    @Autowired
    private CompraService compraService;

    @Autowired
    private CompraRepo compraRepo;

    @Autowired
    private UsuarioRepo usuarioRepo;
    
    
    @Autowired
    private EvaluacionEntregaRepo evalEntregaRepo;

    @Autowired
    private AprobacionPresupuestoService aprobacionService;

    @PostMapping(value = "/", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> crear(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("idAprobacionPresu") Integer idAprobacionPresu,
            @RequestParam("fechaSolicitud") String fechaSolicitud,
            @RequestParam("fechaRecepcion") String fechaRecepcion,
            @RequestParam(value = "activo", defaultValue = "true") Boolean cotizacionSatisfactoria
    ) {
        try {
            // 1. Verificaciones iniciales
            if (compraRepo.existsByAprobacionPresupuesto_Id(idAprobacionPresu)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Ya existe una compra activa para este presupuesto."));
            }

            AprobacionPresupuesto as = aprobacionService.findById(idAprobacionPresu);

            if (!"APROBADA".equalsIgnoreCase(as.getEstado())) {
                return ResponseEntity.badRequest().body(Map.of("error", "El presupuesto no está APROBADO."));
            }

            // 2. Obtener fecha de Aprobación para validar (convertimos LocalDateTime a LocalDate)
            LocalDate fechaAprobacion = as.getFecha().toLocalDate();

            LocalDate fechaSol = null;
            LocalDate fechaRec = null;

            // 3. Parsear fechas
            if (fechaSolicitud != null && !fechaSolicitud.isEmpty()) {
                fechaSol = LocalDate.parse(fechaSolicitud);
            }
            if (fechaRecepcion != null && !fechaRecepcion.isEmpty()) {
                fechaRec = LocalDate.parse(fechaRecepcion);
            }

            // --- 4. VALIDACIONES DE FECHAS (NUEVO) ---
            // A) Solicitud no puede ser anterior a la Aprobación del Presupuesto
            if (fechaSol != null && fechaSol.isBefore(fechaAprobacion)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "La fecha de solicitud (" + fechaSol + ") no puede ser anterior a la aprobación del presupuesto (" + fechaAprobacion + ")."
                ));
            }

            // B) Recepción no puede ser anterior a la Aprobación del Presupuesto
            if (fechaRec != null && fechaRec.isBefore(fechaAprobacion)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "La fecha de recepción (" + fechaRec + ") no puede ser anterior a la aprobación del presupuesto (" + fechaAprobacion + ")."
                ));
            }

            // C) Solicitud no puede ser mayor que Recepción
            if (fechaSol != null && fechaRec != null) {
                if (fechaSol.isAfter(fechaRec)) {
                    return ResponseEntity.badRequest().body(Map.of(
                            "error", "Error cronológico: La fecha de solicitud no puede ser posterior a la fecha de recepción."
                    ));
                }
            }
            // ------------------------------------------

            Compra compra = new Compra();
            compra.setAprobacionPresupuesto(as);

            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            Usuario usuarioCarga = usuarioRepo.findByUsernameAndActivoTrue(username)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            compra.setUsuario(usuarioCarga);

            compra.setFechaSolicitud(fechaSol);
            compra.setFechaRecepcion(fechaRec);

            if (file != null && !file.isEmpty()) {
                String nombreArchivo = compraService.guardarArchivo(file);
                compra.setFacturaPdfPath(nombreArchivo);
            }

            Compra nuevo = compraService.crearCompra(compra);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/presupuesto/{idAprobPresu}")
    public ResponseEntity<List<Compra>> listar(@PathVariable Integer idAprobPresu) {
        List<Compra> lista = compraService.listarPorPresu(idAprobPresu);
        return ResponseEntity.ok(lista);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> modificar(@PathVariable Integer id,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(required = false) Integer idProveedor,
            @RequestParam(required = false) String fechaSolicitud,
            @RequestParam(required = false) String fechaRecepcion,
            @RequestParam(required = false) Boolean activo
    ) {
        try {

            Compra actual = compraService.findById(id);

            boolean yaEvaluada = evalEntregaRepo.existsByCompra_IdCompra(id);

            if (yaEvaluada) {
                throw new ManejoErrores(HttpStatus.BAD_REQUEST,
                        "BLOQUEO: No se puede modificar esta compra porque ya fue evaluada (Entrega recibida y calificada).");
            }
            if (Boolean.TRUE.equals(activo)) {

                Integer idPresu = actual.getAprobacionPresupuesto().getId();

                // Buscamos si hay OTRA compra activa que no sea la actual
                boolean otraActiva = compraRepo.existsByAprobacionPresupuesto_IdAndIdCompraNot(idPresu, id);

                if (otraActiva) {
                    return ResponseEntity.badRequest().body(Map.of("error", "No se puede activar: ya existe otra compra activa para este presupuesto."));
                }
            }

            Map<String, Object> campos = new HashMap<>();

            if (activo != null) {
                campos.put("activo", activo);
            }
            if (fechaSolicitud != null) {
                campos.put("fechaSolicitud", fechaSolicitud);
            }
            if (fechaRecepcion != null) {
                campos.put("fechaRecepcion", fechaRecepcion);
            }

            // Si subieron nueva factura, la guardamos y actualizamos el path
            if (file != null && !file.isEmpty()) {
                String nombreArchivo = compraService.guardarArchivo(file);

                campos.put("factura_pdf_path", nombreArchivo);
            }

            Compra actualizada = compraService.modificar(id, campos);
            return ResponseEntity.ok(Map.of("mensaje", "Compra actualizada", "data", actualizada));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

  
    @GetMapping("/")
    public ResponseEntity<?> listarTodo(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "idCompra")
        );
        return ResponseEntity.ok(compraService.listarTodo(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Compra> mostrarCompraById(@PathVariable Integer id) {
        Compra lista = compraService.buscarCompraById(id);
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/sinEvalEntrega")
    public ResponseEntity<?> ListarComprasSinEvalEntrega(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(compraService.ListarComprasSinEvalEntrega(pageable));
    }
}

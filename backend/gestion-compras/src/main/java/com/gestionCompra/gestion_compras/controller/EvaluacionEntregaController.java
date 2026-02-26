package com.gestionCompra.gestion_compras.controller;

import com.gestionCompra.gestion_compras.domain.entidades.Compra; // Importar Compra
import com.gestionCompra.gestion_compras.domain.entidades.EvaluacionEntrega;
import com.gestionCompra.gestion_compras.service.CompraService;
import com.gestionCompra.gestion_compras.service.EvaluacionEntregaService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/evalEntrega")
public class EvaluacionEntregaController {

    private final EvaluacionEntregaService service;
    private final CompraService compraService;

    public EvaluacionEntregaController(EvaluacionEntregaService service, CompraService compraService) {
        this.service = service;
        this.compraService = compraService;
    }

    @PostMapping("/")
    public ResponseEntity<?> crear(@RequestBody Map<String, Object> request) {
        try {
            // Validación de campos obligatorios
            String[] obligatorios = {"idCompra", "fechaEntrega", "cumpleCondiciones"};
            for (String campo : obligatorios) {
                if (!request.containsKey(campo) || request.get(campo) == null) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Falta el campo: " + campo));
                }
            }

            // 1. Obtener la Compra y la Fecha de Entrega
            Integer idCompra = ((Number) request.get("idCompra")).intValue();
            Compra compra = compraService.findById(idCompra); // Buscamos la compra
            LocalDate fechaEntrega = LocalDate.parse((String) request.get("fechaEntrega"));

            // 2. VALIDACIÓN DE FECHAS (Nueva lógica)
            // La fecha de entrega de la evaluación NO puede ser antes de la recepción de la compra
            if (fechaEntrega.isBefore(compra.getFechaSolicitud())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "La fecha de entrega (" + fechaEntrega + ") no puede ser anterior a la fecha de solicitud de la compra (" + compra.getFechaRecepcion() + ")."
                ));
            }

            EvaluacionEntrega eval = new EvaluacionEntrega();
            eval.setCompra(compra);
            eval.setFechaEntrega(fechaEntrega);
            eval.setCumpleCondiciones((Boolean) request.get("cumpleCondiciones"));
            eval.setObservaciones((String) request.get("observaciones"));

            return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(eval));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> modificar(
            @PathVariable Integer id, 
            @RequestBody EvaluacionEntrega datos) {
        try {
            // 1. VALIDACIÓN EN MODIFICACIÓN
            // Si el usuario intenta cambiar la fecha, debemos validar contra la compra original
            if (datos.getFechaEntrega() != null) {
                // Buscamos la evaluación actual en BD para saber cuál es su Compra asociada
                EvaluacionEntrega evalActual = service.buscarEvalEntregaById(id);
                
                if (evalActual == null) {
                     return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Evaluación no encontrada"));
                }

                LocalDate fechaRecepcionCompra = evalActual.getCompra().getFechaSolicitud();

                if (datos.getFechaEntrega().isBefore(fechaRecepcionCompra)) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "La nueva fecha de entrega (" + datos.getFechaEntrega() + ") no puede ser anterior a la fecha de solicitud de la compra (" + fechaRecepcionCompra + ")."
                    ));
                }
            }

            EvaluacionEntrega actualizada = service.modificar(id, datos);
            return ResponseEntity.ok(Map.of(
                    "message", "Evaluación actualizada correctamente",
                    "data", actualizada
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ... (El resto de tus métodos GET se mantienen igual) ...
    @GetMapping("/")
    public ResponseEntity<?> listarTodo(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(service.listarAbiertas(pageable));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<EvaluacionEntrega> mostrarEvalEntregaById(@PathVariable Integer id) {
        EvaluacionEntrega lista = service.buscarEvalEntregaById(id);
        return ResponseEntity.ok(lista);
    }
    
    @GetMapping("/sinCierre")
    public ResponseEntity<?> ListarComprasSinEvalEntrega(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
         Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "idEvaluacionEntrega")
        );
        return ResponseEntity.ok(service.listarEvalSinCierre(pageable));
    }
    
    @GetMapping("/compra/{id}")
    public ResponseEntity<EvaluacionEntrega> buscarEvalEntregaByCompra(@PathVariable Integer id) {
        EvaluacionEntrega lista = service.buscarEvalEntregaByCompra(id);
        return ResponseEntity.ok(lista);
    }
}
/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.controller;

import com.gestionCompra.gestion_compras.domain.entidades.Compra;
import com.gestionCompra.gestion_compras.domain.entidades.EvaluacionEntrega;
import com.gestionCompra.gestion_compras.domain.entidades.Reclamo;
import com.gestionCompra.gestion_compras.dto.Paginacion;
import com.gestionCompra.gestion_compras.service.EvaluacionEntregaService;
import com.gestionCompra.gestion_compras.service.ReclamoService;
import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
@RequestMapping("/api/reclamos")
public class ReclamoController {

    @Autowired
    private ReclamoService reclamoService;
    
    
    @Autowired
    private EvaluacionEntregaService evaluacionService;


    @GetMapping("/")
    public ResponseEntity<?> listarTodo(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(reclamoService.listarReclamosAbiertos(pageable));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Reclamo> mostrarReclamoById(@PathVariable Integer id) {
        Reclamo lista = reclamoService.buscarReclamoyId(id);
        return ResponseEntity.ok(lista);
    }

    // BUSCAR RECLAMO POR ID DE EVALUACIÓN
    @GetMapping("/evaluacion/{idEval}")
    public ResponseEntity<?> obtenerPorEvaluacion(@PathVariable Integer idEval) {
        try {
            return ResponseEntity.ok(reclamoService.buscarPorEvaluacion(idEval));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // CREAR RECLAMO (Alta vinculada a idEvaluacionEntrega)
    @PostMapping("/")
    public ResponseEntity<?> crear(@RequestBody Map<String, Object> request) {
        try {
            // Validación de campos obligatorios
            String[] obligatorios = {"idEvaluacionEntrega", "fechaReclamo", "detalleReclamo"};
            for (String campo : obligatorios) {
                if (!request.containsKey(campo) || request.get(campo) == null) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Falta el campo: " + campo));
                }
            }

            Integer idEval = ((Number) request.get("idEvaluacionEntrega")).intValue();
            
            // Parsear la fecha del reclamo
            LocalDate fechaReclamo = LocalDate.parse((String) request.get("fechaReclamo"));

            // 2. VALIDACIÓN DE FECHAS
            // Buscamos la evaluación para obtener su fecha de entrega
            EvaluacionEntrega evaluacion = evaluacionService.findById(idEval); // Asumo que tienes un método findById
            
            if (evaluacion == null) {
                 return ResponseEntity.badRequest().body(Map.of("error", "No existe la evaluación con ID: " + idEval));
            }

            // Comparamos: Si fechaReclamo es ANTES de fechaEntrega -> Error
            if (fechaReclamo.isBefore(evaluacion.getFechaEntrega())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "La fecha del reclamo (" + fechaReclamo + ") no puede ser anterior a la fecha de entrega (" + evaluacion.getFechaEntrega() + ")"
                ));
            }

            // Construimos el objeto reclamo
            Reclamo reclamo = new Reclamo();
            reclamo.setFechaReclamo(fechaReclamo);
            reclamo.setDetalleReclamo((String) request.get("detalleReclamo"));

            // Atributos opcionales
            if (request.containsKey("respuestaProveedor")) {
                reclamo.setRespuestaProveedor(com.gestionCompra.gestion_compras.domain.entidades.RespuestaProveedor.valueOf((String) request.get("respuestaProveedor")));
            }
            reclamo.setEsRecurrente((Boolean) request.getOrDefault("esRecurrente", false));
            reclamo.setProductoRechazado((Boolean) request.getOrDefault("productoRechazado", false));
            reclamo.setEntregaNueva((Boolean) request.getOrDefault("entregaNueva", false));
            reclamo.setSatisfechoConNuevaEntrega((Boolean) request.get("satisfechoConNuevaEntrega"));

            return ResponseEntity.status(HttpStatus.CREATED).body(reclamoService.crearReclamo(idEval, reclamo));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> modificar(@PathVariable Integer id, @RequestBody Reclamo datos) {
        try {
            // 1. VERIFICAR SI SE ESTÁ INTENTANDO CAMBIAR LA FECHA
            if (datos.getFechaReclamo() != null) {
                
                // Necesitamos el reclamo original para saber cuál fue su fecha de entrega (vía Evaluación)
                Reclamo reclamoExistente = reclamoService.buscarReclamoyId(id);
                
                if (reclamoExistente == null) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Reclamo no encontrado"));
                }

                // Obtenemos la fecha de entrega asociada a este reclamo
                java.time.LocalDate fechaEntrega = reclamoExistente.getEvaluacionEntrega().getFechaEntrega();

                // 2. VALIDAR LA NUEVA FECHA
                if (datos.getFechaReclamo().isBefore(fechaEntrega)) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "La nueva fecha del reclamo (" + datos.getFechaReclamo() + ") no puede ser anterior a la fecha de entrega (" + fechaEntrega + ")"
                    ));
                }
            }

            // 3. SI PASA LA VALIDACIÓN (O NO CAMBIÓ LA FECHA), GUARDAMOS
            Reclamo actualizada = reclamoService.modificarReclamo(id, datos);
            
            return ResponseEntity.ok(Map.of(
                    "message", "Reclamo actualizado correctamente",
                    "data", actualizada
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}



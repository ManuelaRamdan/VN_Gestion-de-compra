package com.gestionCompra.gestion_compras.controller;

import com.gestionCompra.gestion_compras.domain.entidades.NivelPrioridad;
import com.gestionCompra.gestion_compras.domain.entidades.Sector;
import com.gestionCompra.gestion_compras.dto.Paginacion;
import com.gestionCompra.gestion_compras.service.NivelPrioridadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/prioridades")
public class NivelPrioridadController {

    @Autowired
    private NivelPrioridadService prioridadService;

    @PostMapping("/")
    public ResponseEntity<NivelPrioridad> crear(@RequestBody NivelPrioridad prioridad) {
        return ResponseEntity.status(HttpStatus.CREATED).body(prioridadService.crear(prioridad));
    }

    @GetMapping("/listar")
    public ResponseEntity<Paginacion<NivelPrioridad>> listarTodo(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "idNivelPrioridad")
        );
        return ResponseEntity.ok(prioridadService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NivelPrioridad> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(prioridadService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> modificar(@PathVariable Integer id, @RequestBody NivelPrioridad prioridad) {
        NivelPrioridad actualizado = prioridadService.modificar(id, prioridad);
        return ResponseEntity.ok(Map.of(
            "message", "Nivel de prioridad actualizado correctamente",
            "data", actualizado
        ));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> darDeBaja(@PathVariable Integer id) {
        prioridadService.bajaLogica(id);
        return ResponseEntity.ok(Map.of("message", "Nivel de prioridad desactivado correctamente"));
    }
}
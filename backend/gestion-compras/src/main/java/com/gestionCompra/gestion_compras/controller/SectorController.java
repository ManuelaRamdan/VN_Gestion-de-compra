package com.gestionCompra.gestion_compras.controller;

import com.gestionCompra.gestion_compras.domain.entidades.GrupoRuta;
import com.gestionCompra.gestion_compras.domain.entidades.Sector;
import com.gestionCompra.gestion_compras.dto.Paginacion;
import com.gestionCompra.gestion_compras.dto.SectorRequest;
import com.gestionCompra.gestion_compras.service.SectorService;
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
@RequestMapping("/api/sectores")
public class SectorController {

    @Autowired
    private SectorService sectorService;

    @GetMapping("/permisos")
    public ResponseEntity<List<GrupoRuta>> listarPermisos() {
        return ResponseEntity.ok(sectorService.listarGruposRuta());
    }

    @GetMapping("/listar")
    public ResponseEntity<Paginacion<Sector>> listarTodo(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "idSector"));
        return ResponseEntity.ok(sectorService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sector> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(sectorService.findById(id));
    }

    @PostMapping("/")
    public ResponseEntity<Sector> crear(@RequestBody SectorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sectorService.crearSector(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> modificar(@PathVariable Integer id, @RequestBody SectorRequest request) {
        Sector actualizado = sectorService.modificarSector(id, request);
        return ResponseEntity.ok(Map.of(
                "message", "Sector actualizado correctamente",
                "data", actualizado
        ));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> darDeBaja(@PathVariable Integer id) {
        sectorService.bajaLogica(id);
        return ResponseEntity.ok(Map.of("message", "Sector desactivado correctamente"));
    }
}

package com.gestionCompra.gestion_compras.controller;

import com.gestionCompra.gestion_compras.domain.entidades.Proveedor;
import com.gestionCompra.gestion_compras.dto.Paginacion;
import com.gestionCompra.gestion_compras.repository.ProveedorRepo;
import com.gestionCompra.gestion_compras.service.ProveedorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/proveedores")
public class ProveedorController {

    @Autowired
    private ProveedorRepo proveedorRepo;

    @Autowired
    private ProveedorService proveedorService;

    // CREAR PROVEEDOR
    @PostMapping("/crear")
    public ResponseEntity<?> crearProveedor(@RequestBody Proveedor proveedor) {
        Proveedor nuevo = proveedorRepo.save(proveedor);
        return ResponseEntity.ok(Map.of(
                "mensaje", "Proveedor registrado exitosamente",
                "id", nuevo.getIdProveedor()
        ));
    }

    @GetMapping("/listar")
    public ResponseEntity<Paginacion<Proveedor>> listarTodo(@RequestParam(defaultValue = "0") 
            int page, @RequestParam(defaultValue = "10") int size) {
         Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "idProveedor")
        );
        return ResponseEntity.ok(proveedorService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Proveedor> mostrarProveedorById(@PathVariable Integer id) {
        Proveedor lista = proveedorService.findById(id);
        return ResponseEntity.ok(lista);
    }

    @PutMapping("/{id_proveedor}")
    public ResponseEntity<?> modificar(@PathVariable Integer id_proveedor, @RequestBody Proveedor proveedor) {
        Proveedor actualizado = proveedorService.modificar(id_proveedor, proveedor);
        return ResponseEntity.ok(Map.of(
                "message", "Proveedor actualizado correctamente",
                "proveedor", actualizado
        ));
    }

    @PatchMapping("/{id_proveedor}")
    public ResponseEntity<?> darDeBaja(@PathVariable Integer id_proveedor) {
        proveedorService.bajaLogica(id_proveedor);
        return ResponseEntity.ok(Map.of("message", "Proveedor desactivado (Baja lógica)"));
    }
}

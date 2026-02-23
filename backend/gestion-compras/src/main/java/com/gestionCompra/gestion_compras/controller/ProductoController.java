package com.gestionCompra.gestion_compras.controller;

import com.gestionCompra.gestion_compras.domain.entidades.Producto;
import com.gestionCompra.gestion_compras.dto.Paginacion;
import com.gestionCompra.gestion_compras.repository.ProductoRepo;
import com.gestionCompra.gestion_compras.service.ProductoService;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
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
@RequestMapping("/api/productos")
public class ProductoController {

    @Autowired
    private ProductoRepo productoRepo;

    @Autowired
    private ProductoService productoService;

    @PostMapping("/")
    public ResponseEntity<?> crearProducto(@RequestBody Producto producto) {
        Producto nuevo = productoRepo.save(producto);
        return ResponseEntity.ok(Map.of(
                "message", "Producto creado exitosamente",
                "producto", nuevo
        ));
    }

    @GetMapping("/listar")
    public ResponseEntity<Paginacion<Producto>> listarTodo(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "idProducto")
        );
        return ResponseEntity.ok(productoService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> mostrarProductoById(@PathVariable Integer id) {
        Producto lista = productoService.findById(id);
        return ResponseEntity.ok(lista);
    }

    @PutMapping("/{id_producto}")
    public ResponseEntity<?> modificar(@PathVariable Integer id_producto, @RequestBody Producto producto) {
        // El método se llama modificar() en el genérico
        Producto actualizado = productoService.modificar(id_producto, producto);
        return ResponseEntity.ok(Map.of(
                "message", "Producto actualizado correctamente",
                "producto", actualizado
        ));
    }

    @PatchMapping("/{id_producto}")
    public ResponseEntity<?> darDeBaja(@PathVariable Integer id_producto) {
        // El método se llama bajaLogica() en el genérico
        productoService.bajaLogica(id_producto);
        return ResponseEntity.ok(Map.of("message", "Producto desactivado (Baja lógica)"));
    }
}

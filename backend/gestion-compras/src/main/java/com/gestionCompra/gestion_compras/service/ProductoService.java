package com.gestionCompra.gestion_compras.service;

import com.gestionCompra.gestion_compras.domain.entidades.Producto;
import com.gestionCompra.gestion_compras.dto.ManejoErrores;
import com.gestionCompra.gestion_compras.dto.Paginacion;
import com.gestionCompra.gestion_compras.repository.ProductoRepo;
import com.gestionCompra.gestion_compras.util.ABMLogicoGenerico;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductoService extends ABMLogicoGenerico<Producto, Integer> {
    
    @Autowired
    private ProductoRepo productoRepo;

    @Override
    protected JpaRepository<Producto, Integer> getRepository() { 
        return productoRepo; 
    }

    @Override
    protected String getEntityName() { 
        return "Producto"; 
    }
    
    @Override
    public Producto findById(Integer id) {
        return productoRepo.findByIdAndActivoTrue(id)
                .orElseThrow(() -> new ManejoErrores(
                    HttpStatus.NOT_FOUND, 
                    "Producto no encontrado o se encuentra inactivo" // Corregido: decía Sector
                ));
    }

    @Override
    public Paginacion<Producto> findAll(Pageable pageable) {
        return new Paginacion<>(productoRepo.findByActivoTrue(pageable));
    }

    @Override
    @Transactional
    public void bajaLogica(Integer id) {
        Producto producto = this.findById(id); 
        producto.setActivo(false);
        productoRepo.save(producto);
    }

    // --- NUEVA LÓGICA DE VALIDACIÓN ---

    @Transactional
    public Producto crearProducto(Producto nuevoProducto) {
        
        String nombreLimpio = nuevoProducto.getNombre().trim();
        nuevoProducto.setNombre(nombreLimpio);
        if (productoRepo.findByNombreIgnoreCaseAndActivoTrue(nombreLimpio).isPresent()) {
            throw new ManejoErrores(
                    HttpStatus.BAD_REQUEST, 
                    "El nombre del producto ya se encuentra registrado"
            );
        }
        
        nuevoProducto.setActivo(true);
        return productoRepo.save(nuevoProducto);
    }

    @Transactional
    public Producto modificarProducto(Integer id, Producto datosNuevos) {
        Producto productoExistente = this.findById(id);

        if (datosNuevos.getNombre() != null && !datosNuevos.getNombre().isBlank()) {
            
            String nombreLimpio = datosNuevos.getNombre().trim();
            productoRepo.findByNombreIgnoreCaseAndActivoTrue(nombreLimpio)
                    .ifPresent(p -> {
                        if (!p.getIdProducto().equals(id)) {
                            throw new ManejoErrores(
                                    HttpStatus.BAD_REQUEST, 
                                    "El nombre del producto ya se encuentra registrado por otro producto"
                            );
                        }
                    });
            productoExistente.setNombre(nombreLimpio);
        }

        return productoRepo.save(productoExistente);
    }
}
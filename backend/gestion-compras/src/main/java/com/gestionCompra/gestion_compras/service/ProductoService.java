/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.service;

import com.gestionCompra.gestion_compras.domain.entidades.Producto;
import com.gestionCompra.gestion_compras.domain.entidades.Sector;
import com.gestionCompra.gestion_compras.dto.ManejoErrores;
import com.gestionCompra.gestion_compras.dto.Paginacion;
import com.gestionCompra.gestion_compras.repository.ProductoRepo;
import com.gestionCompra.gestion_compras.util.ABMGenerico;
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
    protected JpaRepository<Producto, Integer> getRepository() { return productoRepo; }

    @Override
    protected String getEntityName() { return "Producto"; }
    
    @Override
    public Producto findById(Integer id) {
        return productoRepo.findByIdAndActivoTrue(id)
                .orElseThrow(() -> new ManejoErrores(
                    HttpStatus.NOT_FOUND, 
                    "Sector no encontrado o se encuentra inactivo"
                ));
    }

    // 2. Sobrescribir el listado general
    @Override
    public Paginacion<Producto> findAll(Pageable pageable) {
        return new Paginacion<>(productoRepo.findByActivoTrue(pageable));
    }

    // 3. Modificar la lógica de baja
    @Override
    @Transactional
    public void bajaLogica(Integer id) {
        // Al usar el findById de arriba, si ya está inactivo lanzará el 404/Error
        Producto producto = this.findById(id); 
        producto.setActivo(false);
        productoRepo.save(producto);
    }
}
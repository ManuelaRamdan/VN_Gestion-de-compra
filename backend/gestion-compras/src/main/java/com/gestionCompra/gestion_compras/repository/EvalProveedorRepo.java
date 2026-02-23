/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.repository;

import com.gestionCompra.gestion_compras.domain.entidades.EvaluacionProveedor;
import com.gestionCompra.gestion_compras.domain.entidades.Solicitud;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 *
 * @author Usuario
 */

@Repository
public interface EvalProveedorRepo extends JpaRepository<EvaluacionProveedor, Integer> {

    public Page<EvaluacionProveedor> findByProveedor_NombreEmpresaContainingIgnoreCaseOrderByIdEvalProveedorDesc(String nombre, Pageable paginable);

    
}

/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.repository;

import com.gestionCompra.gestion_compras.domain.entidades.Cierre;
import com.gestionCompra.gestion_compras.domain.entidades.Compra;
import com.gestionCompra.gestion_compras.domain.entidades.Reclamo;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CierreRepo extends JpaRepository<Cierre, Integer> {

    public boolean existsByEvaluacionEntrega_IdEvaluacionEntrega(Integer nuevoId);

    Optional<Cierre> findByEvaluacionEntrega_IdEvaluacionEntrega(Integer idEvaluacionEntrega);
// Busca los expedientes cerrados en un rango de fechas
    List<Cierre> findByFechaCierreBetween(java.time.LocalDate desde, java.time.LocalDate hasta);
}

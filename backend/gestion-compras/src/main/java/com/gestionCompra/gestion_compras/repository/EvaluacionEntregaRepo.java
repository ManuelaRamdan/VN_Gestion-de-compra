/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.repository;

import com.gestionCompra.gestion_compras.domain.entidades.Compra;
import com.gestionCompra.gestion_compras.domain.entidades.EvaluacionEntrega;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EvaluacionEntregaRepo extends JpaRepository<EvaluacionEntrega, Integer> {

    Page<EvaluacionEntrega> findByCompra_AprobacionPresupuesto_Presupuesto_AprobacionSolicitud_Solicitud_CerradoFalse(Pageable pageable);

    @Query("SELECT c FROM EvaluacionEntrega c "
            + "WHERE c.idEvaluacionEntrega = :id "
            + "AND c.compra.aprobacionPresupuesto.presupuesto.aprobacionSolicitud.solicitud.cerrado = false ")
    Optional<EvaluacionEntrega> findByIdSolicitudAbierta(Integer id);

    @Query("SELECT c FROM EvaluacionEntrega c "
            + "LEFT JOIN Cierre e ON e.evaluacionEntrega = c "
            + "WHERE e.id IS NULL "
            + "AND c.compra.aprobacionPresupuesto.presupuesto.aprobacionSolicitud.solicitud.cerrado = false")
    Page<EvaluacionEntrega> listarEvalSinCierre(Pageable pageable);

    Optional<EvaluacionEntrega> findByCompra_IdCompra(Integer idCompra);

    @Query("""
   SELECT e 
   FROM EvaluacionEntrega e
   WHERE e.compra.idCompra = :id
   AND e.compra.aprobacionPresupuesto.presupuesto
        .aprobacionSolicitud.solicitud.cerrado = false
""")
    Optional<EvaluacionEntrega> buscarEvalEntregaPorCompra(Integer id);
    
    boolean existsByCompra_IdCompra(Integer idCompra);

}

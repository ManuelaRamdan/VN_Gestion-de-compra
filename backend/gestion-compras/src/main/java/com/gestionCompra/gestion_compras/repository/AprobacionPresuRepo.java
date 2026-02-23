/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.repository;

import com.gestionCompra.gestion_compras.domain.entidades.AprobacionPresupuesto;
import com.gestionCompra.gestion_compras.domain.entidades.EvaluacionEntrega;
import com.gestionCompra.gestion_compras.util.AprobacionBase;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

/**
 *
 * @author Usuario
 */
@Repository
public interface AprobacionPresuRepo extends JpaRepository<AprobacionPresupuesto, Integer> {

    Page<AprobacionPresupuesto> findByEstadoIgnoreCaseAndPresupuesto_AprobacionSolicitud_Solicitud_CerradoFalse(String estado, Pageable pageable);

    Optional<AprobacionPresupuesto> findByPresupuesto_IdPresupuesto(Integer id);

    // NOMBRE CORREGIDO: se agrega "Aprobacion" antes de "Solicitud"
    List<AprobacionPresupuesto> findByPresupuesto_AprobacionSolicitud_Solicitud_IdSolicitudAndPresupuesto_IdPresupuestoNot(
            Integer idSolicitud, Integer idPresupuesto
    );

    Optional<AprobacionPresupuesto> findByIdAndPresupuesto_AprobacionSolicitud_Solicitud_CerradoFalse(Integer id);

    @Query("SELECT ap FROM AprobacionPresupuesto ap "
            + "LEFT JOIN Compra c ON c.aprobacionPresupuesto = ap "
            + "WHERE c IS NULL "
            + "AND ap.presupuesto.aprobacionSolicitud.solicitud.cerrado = false")
    Page<AprobacionPresupuesto> listarAprobPSinCompra(Pageable pageable);
    
    boolean existsByPresupuesto_AprobacionSolicitud_IdAndEstadoAndPresupuesto_AprobacionSolicitud_Solicitud_CerradoFalse(Integer idAprobSolicitud, String estado);
}

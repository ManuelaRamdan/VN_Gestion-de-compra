package com.gestionCompra.gestion_compras.repository;

import com.gestionCompra.gestion_compras.domain.entidades.AprobacionSolicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface AprobacionSolicitudRepo extends JpaRepository<AprobacionSolicitud, Integer> {
    
    Optional<AprobacionSolicitud> findBySolicitud_IdSolicitud(Integer idSolicitud);
    Page<AprobacionSolicitud> findByEstadoIgnoreCaseAndSolicitud_CerradoFalse(String estado, Pageable pageable);
        Optional<AprobacionSolicitud> findByIdAndSolicitud_CerradoFalse(Integer idSolicitud);
        
        
        @Query("SELECT a FROM AprobacionSolicitud a " +
       "WHERE a.estado = :estado AND a.solicitud.cerrado = false " + 
       "AND NOT EXISTS (" +
       "    SELECT 1 FROM AprobacionPresupuesto ap " +
       "    WHERE ap.presupuesto.aprobacionSolicitud = a " +
       "    GROUP BY ap.presupuesto.aprobacionSolicitud " +
       "    HAVING COUNT(ap.id) > 0 AND COUNT(ap.id) = SUM(CASE WHEN UPPER(ap.estado) = 'RECHAZADA' THEN 1 ELSE 0 END)" +
       ")")
Page<AprobacionSolicitud> findAprobadasConPresupuestosValidos(@Param("estado") String estado, Pageable pageable);

}
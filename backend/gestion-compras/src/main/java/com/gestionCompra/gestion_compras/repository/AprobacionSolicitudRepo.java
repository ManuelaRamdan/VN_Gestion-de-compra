package com.gestionCompra.gestion_compras.repository;

import com.gestionCompra.gestion_compras.domain.entidades.AprobacionSolicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface AprobacionSolicitudRepo extends JpaRepository<AprobacionSolicitud, Integer> {
    
    Optional<AprobacionSolicitud> findBySolicitud_IdSolicitud(Integer idSolicitud);
    Page<AprobacionSolicitud> findByEstadoIgnoreCaseAndSolicitud_CerradoFalse(String estado, Pageable pageable);
        Optional<AprobacionSolicitud> findByIdAndSolicitud_CerradoFalse(Integer idSolicitud);

}
package com.gestionCompra.gestion_compras.repository;

import com.gestionCompra.gestion_compras.domain.entidades.Compra;
import com.gestionCompra.gestion_compras.domain.entidades.Presupuesto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

public interface PresupuestoRepo extends JpaRepository<Presupuesto, Integer> {
    // Para listar los presupuestos de una solicitud específica
    Page <Presupuesto> findByAprobacionSolicitud_IdAndAprobacionSolicitud_Solicitud_CerradoFalse(Integer idAprobSolicitud, Pageable pageable);

    long countByAprobacionSolicitud_Id(Integer idAprobSolicitud);

    public List<Presupuesto> findByAprobacionSolicitud_Id(Integer id);
    
    
    Optional<Presupuesto> findByIdPresupuestoAndAprobacionSolicitud_Solicitud_CerradoFalse(Integer id);
    
 
    Page<Presupuesto> findByAprobacionSolicitud_Solicitud_CerradoFalse(Pageable pageable);
}
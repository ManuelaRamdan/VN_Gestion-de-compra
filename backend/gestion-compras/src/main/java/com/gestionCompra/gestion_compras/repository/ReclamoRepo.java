package com.gestionCompra.gestion_compras.repository;

import com.gestionCompra.gestion_compras.domain.entidades.Reclamo;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReclamoRepo extends JpaRepository<Reclamo, Integer> {

    // 1. Buscar reclamo por ID de Evaluación (SOLO ACTIVOS)
    // Se usa para ver si hay un reclamo vigente al cargar la pantalla
    Optional<Reclamo> findByEvaluacionEntrega_IdEvaluacionEntregaAndActivoTrue(Integer idEval);

    // 2. Verificar existencia (SOLO ACTIVOS)
    // Se usa para evitar crear duplicados
    boolean existsByEvaluacionEntrega_IdEvaluacionEntregaAndActivoTrue(Integer idEval);
    
    // 3. Buscar por ID propio y que la solicitud esté abierta (Y QUE EL RECLAMO ESTÉ ACTIVO)
    // Se usa para editar un reclamo específico
    Optional<Reclamo> findByIdReclamoAndEvaluacionEntrega_Compra_AprobacionPresupuesto_Presupuesto_AprobacionSolicitud_Solicitud_CerradoFalseAndActivoTrue(Integer id);

    // 4. Listar todos los reclamos pendientes de solicitudes abiertas (SOLO ACTIVOS)
    // Se usa para la grilla general de reclamos
    Page<Reclamo> findByEvaluacionEntrega_Compra_AprobacionPresupuesto_Presupuesto_AprobacionSolicitud_Solicitud_CerradoFalseAndActivoTrue(Pageable pageable);
    Optional<Reclamo> findByEvaluacionEntrega_IdEvaluacionEntrega(Integer idEval);
}
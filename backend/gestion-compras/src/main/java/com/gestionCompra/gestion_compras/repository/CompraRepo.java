package com.gestionCompra.gestion_compras.repository;

import com.gestionCompra.gestion_compras.domain.entidades.Compra;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CompraRepo extends JpaRepository<Compra, Integer> {

    List<Compra> findByAprobacionPresupuesto_IdAndAprobacionPresupuesto_Presupuesto_AprobacionSolicitud_Solicitud_CerradoFalse(Integer idAprobSolicitud);

    // Se eliminó la que tenía "AndActivoTrue" porque ya tenías esta abajo:
    boolean existsByAprobacionPresupuesto_Id(Integer idAprob);

    // Se le quitó el "AndActivoTrue" al nombre del método
    boolean existsByAprobacionPresupuesto_IdAndIdCompraNot(Integer idPresu, Integer id);

    // Se le quitó el "AND c.activo = true" de la query y se renombró el método
    @Query("SELECT c FROM Compra c "
            + "WHERE c.idCompra = :id "
            + "AND c.aprobacionPresupuesto.presupuesto.aprobacionSolicitud.solicitud.cerrado = false")
    Optional<Compra> findByIdAndSolicitudAbierta(Integer id);

    // Se le quitó el "WHERE c.activo = true" de la query y se renombró el método
    @Query("SELECT c FROM Compra c "
            + "WHERE c.aprobacionPresupuesto.presupuesto.aprobacionSolicitud.solicitud.cerrado = false")
    Page<Compra> findAbiertas(Pageable pageable);

    @Query("SELECT c FROM Compra c "
            + "LEFT JOIN EvaluacionEntrega e ON e.compra = c "
            + "WHERE e.id IS NULL "
            + "AND c.aprobacionPresupuesto.presupuesto.aprobacionSolicitud.solicitud.cerrado = false")
    Page<Compra> listarComprasSinEval(Pageable pageable);

    Optional<Compra> findByAprobacionPresupuesto_Id(Integer id);
}
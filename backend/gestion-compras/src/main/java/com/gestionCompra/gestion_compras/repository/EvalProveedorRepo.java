/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.repository;

import com.gestionCompra.gestion_compras.domain.entidades.EvaluacionProveedor;
import com.gestionCompra.gestion_compras.domain.entidades.Solicitud;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 *
 * @author Usuario
 */

@Repository
public interface EvalProveedorRepo extends JpaRepository<EvaluacionProveedor, Integer> {

    public Page<EvaluacionProveedor> findByProveedor_NombreEmpresaContainingIgnoreCaseOrderByIdEvalProveedorDesc(String nombre, Pageable paginable);
    boolean existsByProveedor_IdProveedor(Integer idProveedor);

    // --- Para el descargable de evaluaciones por período ---
    List<EvaluacionProveedor> findByPeriodoEvaluado(Integer periodoEvaluado);
    List<EvaluacionProveedor> findByFechaBetween(LocalDateTime desde, LocalDateTime hasta);
// Obtiene la evaluación más reciente de un proveedor específico
    EvaluacionProveedor findTopByProveedor_IdProveedorOrderByFechaDesc(Integer idProveedor);

    // Obtiene la evaluación VIGENTE a una fecha dada: la más reciente cuya
    // fecha sea anterior o igual a la fecha de referencia (ej: fecha de cierre
    // de un expediente). Se usa para que el PDF del expediente muestre la
    // evaluación que correspondía al proveedor en ese momento, y no siempre
    // la última evaluación cargada en el sistema.
    EvaluacionProveedor findFirstByProveedor_IdProveedorAndFechaLessThanEqualOrderByFechaDesc(
            Integer idProveedor, LocalDateTime fecha);

    // Fallback de la anterior: si no existe ninguna evaluación vigente a la fecha
    // (ej. la compra es más vieja que la primera evaluación cargada al proveedor),
    // traemos la PRIMERA evaluación posterior a esa fecha, para al menos mostrar
    // algo en el expediente en lugar de dejarlo vacío.
    EvaluacionProveedor findFirstByProveedor_IdProveedorAndFechaGreaterThanOrderByFechaAsc(
            Integer idProveedor, LocalDateTime fecha);

    // --- LISTADOS "ACTUALES" ---
    // Como ahora cada corrección/edición crea una fila NUEVA (se mantiene el
    // historial completo), estos listados no deben mostrar todas las filas de
    // un mismo proveedor: solo la más reciente de cada uno, para que el
    // listado refleje "el estado actual" de cada proveedor.
    @Query("SELECT e FROM EvaluacionProveedor e " +
           "WHERE e.fecha = (SELECT MAX(e2.fecha) FROM EvaluacionProveedor e2 WHERE e2.proveedor = e.proveedor) " +
           "ORDER BY e.idEvalProveedor DESC")
    Page<EvaluacionProveedor> findUltimaEvaluacionPorProveedor(Pageable pageable);

    @Query("SELECT e FROM EvaluacionProveedor e " +
           "WHERE LOWER(e.proveedor.nombreEmpresa) LIKE LOWER(CONCAT('%', :nombre, '%')) " +
           "AND e.fecha = (SELECT MAX(e2.fecha) FROM EvaluacionProveedor e2 WHERE e2.proveedor = e.proveedor) " +
           "ORDER BY e.idEvalProveedor DESC")
    Page<EvaluacionProveedor> findUltimaEvaluacionPorProveedorNombre(@Param("nombre") String nombre, Pageable pageable);
}
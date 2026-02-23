/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.repository;

import com.gestionCompra.gestion_compras.domain.entidades.Solicitud;
import com.gestionCompra.gestion_compras.domain.entidades.Usuario;
import com.gestionCompra.gestion_compras.dto.Paginacion;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SolicitudRepo extends JpaRepository<Solicitud, Integer> {

    Page<Solicitud> findByCerradoFalse(Pageable pageable);

    @Query("SELECT s FROM Solicitud s LEFT JOIN FETCH s.aprobacion "
            + "WHERE s.usuario.idUsuario = :idUsuario AND s.cerrado = false")
    Page<Solicitud> findByUsuario_IdUsuarioAndCerradoFalse(Integer idUsuario, Pageable pageable);
    
    Page<Solicitud> findByCerradoTrue(Pageable pageable);
    
    
    Optional <Solicitud> findByIdSolicitudAndCerradoFalse(Integer id);
    long countByUsuario_IdUsuarioAndAprobacion_EstadoAndCerradoFalse(Integer usuarioId, String estado);
}

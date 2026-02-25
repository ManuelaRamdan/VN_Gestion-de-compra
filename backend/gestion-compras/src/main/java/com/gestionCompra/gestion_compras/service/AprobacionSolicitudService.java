package com.gestionCompra.gestion_compras.service;

import com.gestionCompra.gestion_compras.domain.entidades.AprobacionSolicitud;
import com.gestionCompra.gestion_compras.domain.entidades.Usuario;
import com.gestionCompra.gestion_compras.dto.ManejoErrores;
import com.gestionCompra.gestion_compras.dto.Paginacion;
import com.gestionCompra.gestion_compras.repository.AprobacionSolicitudRepo;
import com.gestionCompra.gestion_compras.util.ABMGenerico;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;

@Service
public class AprobacionSolicitudService extends ABMGenerico<AprobacionSolicitud, Integer> {

    private final AprobacionSolicitudRepo aprobacionRepo;

    public AprobacionSolicitudService(AprobacionSolicitudRepo aprobacionRepo) {
        this.aprobacionRepo = aprobacionRepo;
    }

    @Transactional
    public AprobacionSolicitud procesarDecision(Integer idSolicitud, String nuevoEstado, Usuario gerente, String comntarios) {
        AprobacionSolicitud aprobacion = aprobacionRepo.findBySolicitud_IdSolicitud(idSolicitud)
                .orElseThrow(() -> new RuntimeException("No existe registro de aprobación para la solicitud: " + idSolicitud));

        // Usamos los métodos de AprobacionBase
        aprobacion.setEstado(nuevoEstado.toUpperCase());
        aprobacion.setFecha(LocalDateTime.now());
        aprobacion.setUsuario(gerente);
        aprobacion.setComentarios(comntarios);

        return aprobacionRepo.save(aprobacion);
    }

    public Paginacion<AprobacionSolicitud> listarPorEstadoAbiertas(String estado, Pageable pageable) {
        Page<AprobacionSolicitud> page = aprobacionRepo.findByEstadoIgnoreCaseAndSolicitud_CerradoFalse(estado, pageable);
        return new Paginacion<>(page);
    }

    @Override
    protected JpaRepository<AprobacionSolicitud, Integer> getRepository() {
        return aprobacionRepo;
    }

    @Override
    protected String getEntityName() {
        return "AprobacionSolicitud";
    }

    public AprobacionSolicitud buscaridAprobSoli(Integer id) {
        return aprobacionRepo.findByIdAndSolicitud_CerradoFalse(id).orElseThrow(() -> new ManejoErrores(
                    HttpStatus.NOT_FOUND, 
                    "No se encontró la aprobación de solucion con ID: " + id + " o la solicitud ya está cerrada"
            ));
    }
}

package com.gestionCompra.gestion_compras.service;

import com.gestionCompra.gestion_compras.domain.entidades.AprobacionPresupuesto;
import com.gestionCompra.gestion_compras.domain.entidades.AprobacionSolicitud;
import com.gestionCompra.gestion_compras.domain.entidades.EvaluacionEntrega;
import com.gestionCompra.gestion_compras.domain.entidades.Usuario;
import com.gestionCompra.gestion_compras.dto.ManejoErrores;
import com.gestionCompra.gestion_compras.dto.Paginacion;
import com.gestionCompra.gestion_compras.repository.AprobacionPresuRepo;
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
public class AprobacionPresupuestoService extends ABMGenerico<AprobacionPresupuesto, Integer> {

    private final AprobacionPresuRepo aprobacionRepo;

    public AprobacionPresupuestoService(AprobacionPresuRepo aprobacionRepo) {
        this.aprobacionRepo = aprobacionRepo;
    }

    @Transactional
    public AprobacionPresupuesto procesarDecision(Integer idPresupuesto, String nuevoEstado, Usuario gerente) {
        // 1. Obtener la aprobación actual
        AprobacionPresupuesto aprobacion = aprobacionRepo.findByPresupuesto_IdPresupuesto(idPresupuesto)
                .orElseThrow(() -> new RuntimeException("No existe registro para el presupuesto: " + idPresupuesto));

        // 2. Actualizar el presupuesto actual
        String estadoUpper = nuevoEstado.toUpperCase();
        aprobacion.setEstado(estadoUpper);
        aprobacion.setFecha(LocalDateTime.now());
        aprobacion.setUsuario(gerente);

        // 3. Lógica de rechazo en cadena
        if ("APROBADA".equals(estadoUpper)) {
            rechazarOtrosPresupuestos(idPresupuesto, aprobacion.getPresupuesto().getAprobacionSolicitud().getSolicitud().getIdSolicitud(), gerente);
        }

        return aprobacionRepo.save(aprobacion);
    }

    private void rechazarOtrosPresupuestos(Integer idPresupuestoActual, Integer idSolicitud, Usuario gerente) {
        // Buscamos todas las aprobaciones de la misma solicitud, excluyendo la actual
        List<AprobacionPresupuesto> otrasAprobaciones = aprobacionRepo
                .findByPresupuesto_AprobacionSolicitud_Solicitud_IdSolicitudAndPresupuesto_IdPresupuestoNot(idSolicitud, idPresupuestoActual);

        for (AprobacionPresupuesto otra : otrasAprobaciones) {
            otra.setEstado("RECHAZADA");
            otra.setFecha(LocalDateTime.now());
            otra.setUsuario(gerente);

            aprobacionRepo.save(otra);
        }
    }

    public Paginacion<AprobacionPresupuesto> listarPorEstadoAbiertas(String estado, Pageable pageable) {
        Page<AprobacionPresupuesto> page = aprobacionRepo
                .findByEstadoIgnoreCaseAndPresupuesto_AprobacionSolicitud_Solicitud_CerradoFalse(estado, pageable);
        return new Paginacion<>(page);
    }

    @Override
    protected JpaRepository<AprobacionPresupuesto, Integer> getRepository() {
        return aprobacionRepo;
    }

    @Override
    protected String getEntityName() {
        return "AprobacionPresupuesto";
    }

    public AprobacionPresupuesto buscaridAprobPresu(Integer id) {

        return aprobacionRepo.findByIdAndPresupuesto_AprobacionSolicitud_Solicitud_CerradoFalse(id)
                .orElseThrow(() -> new ManejoErrores(
                    HttpStatus.NOT_FOUND, 
                    "No se encontró la aprobación de presupuesto con ID: " + id + " o la solicitud ya está cerrada"
            ));

    }
    
    public Paginacion<AprobacionPresupuesto> listarAprobPSinCompra(Pageable pageable) {
        Page<AprobacionPresupuesto> page = aprobacionRepo.listarAprobPSinCompra(pageable);
        return new Paginacion<>(page);
    }

    public Optional<AprobacionPresupuesto> findByPresupuesto_IdPresupuesto(Integer id) {
        return aprobacionRepo.findByPresupuesto_IdPresupuesto(id);
        
    }

    public boolean existsByPresupuesto_AprobacionSolicitud_IdAndEstado(Integer idSoli, String aprobada) {
        
        return aprobacionRepo.existsByPresupuesto_AprobacionSolicitud_IdAndEstadoAndPresupuesto_AprobacionSolicitud_Solicitud_CerradoFalse(idSoli, aprobada);
    }

   
}

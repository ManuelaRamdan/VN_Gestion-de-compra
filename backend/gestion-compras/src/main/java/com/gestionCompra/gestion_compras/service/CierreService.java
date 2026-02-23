/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.service;

import com.gestionCompra.gestion_compras.domain.entidades.AprobacionSolicitud;
import com.gestionCompra.gestion_compras.domain.entidades.Cierre;
import com.gestionCompra.gestion_compras.domain.entidades.EvaluacionEntrega;
import com.gestionCompra.gestion_compras.domain.entidades.Solicitud;
import com.gestionCompra.gestion_compras.domain.entidades.Usuario;
import com.gestionCompra.gestion_compras.dto.ManejoErrores;
import com.gestionCompra.gestion_compras.repository.CierreRepo;
import com.gestionCompra.gestion_compras.repository.EvaluacionEntregaRepo;
import com.gestionCompra.gestion_compras.repository.UsuarioRepo;
import com.gestionCompra.gestion_compras.util.ABMGenerico;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author Usuario
 */
@Service
public class CierreService extends ABMGenerico<Cierre, Integer> {

    @Autowired
    private CierreRepo cierreRepo;

    @Autowired
    private EvaluacionEntregaRepo evaluacionRepo;

    @Autowired
    private UsuarioRepo usuarioRepo;

    @Transactional
    public Cierre crearCierre(Integer idEval, Cierre cierre) {
        // 1. Verificar Evaluación y unicidad (1:1)
        EvaluacionEntrega eval = evaluacionRepo.findById(idEval)
                .orElseThrow(() -> new ManejoErrores(HttpStatus.NOT_FOUND, "Evaluación no encontrada."));

        if (cierreRepo.existsByEvaluacionEntrega_IdEvaluacionEntrega(idEval)) {
            throw new ManejoErrores(HttpStatus.CONFLICT, "Esta evaluación ya tiene un cierre registrado.");
        }

        try {
            Solicitud solicitud = eval.getCompra()
                    .getAprobacionPresupuesto()
                    .getPresupuesto()
                    .getAprobacionSolicitud()
                    .getSolicitud();

            solicitud.setCerrado(true);
            // Necesitarás inyectar SolicitudRepo en este servicio
            // solicitudRepo.save(solicitud); 
        } catch (NullPointerException e) {
            throw new ManejoErrores(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo encontrar la solicitud raíz para cerrar.");
        }

        // 3. Configurar objeto - Forzamos fecha actual
        cierre.setEvaluacionEntrega(eval);
        cierre.setFechaCierre(LocalDate.now()); // Regla: Siempre la actual

        return cierreRepo.save(cierre);
    }

    @Transactional
    public Cierre modificarCierre(Integer idCierre, Cierre cierreActualizado) {
        Cierre existente = cierreRepo.findById(idCierre)
                .orElseThrow(() -> new ManejoErrores(HttpStatus.NOT_FOUND, "Cierre no encontrado."));

        if (cierreActualizado.getEvaluacionEntrega() != null && cierreActualizado.getEvaluacionEntrega().getIdEvaluacionEntrega() != null) {
            Integer nuevoId = cierreActualizado.getEvaluacionEntrega().getIdEvaluacionEntrega();
            if (!nuevoId.equals(existente.getEvaluacionEntrega().getIdEvaluacionEntrega())) {
                if (cierreRepo.existsByEvaluacionEntrega_IdEvaluacionEntrega(nuevoId)) {
                    throw new ManejoErrores(HttpStatus.CONFLICT, "La evaluación destino ya tiene un cierre.");
                }
                EvaluacionEntrega nuevaEval = evaluacionRepo.findById(nuevoId)
                        .orElseThrow(() -> new ManejoErrores(HttpStatus.NOT_FOUND, "La nueva evaluación no existe."));
                existente.setEvaluacionEntrega(nuevaEval);
            }
        }

        if (cierreActualizado.getObservaciones() != null) {
            existente.setObservaciones(cierreActualizado.getObservaciones());
        }

        existente.setFechaCierre(LocalDate.now());

        return cierreRepo.save(existente);
    }

    @Override
    protected JpaRepository<Cierre, Integer> getRepository() {
        return cierreRepo;
    }

    @Override
    protected String getEntityName() {
        return "Cierre";
    }

    public Optional<Cierre> buscarPorIdEvaluacion(Integer idEval) {
    
        return cierreRepo.findByEvaluacionEntrega_IdEvaluacionEntrega(idEval);
    }
}

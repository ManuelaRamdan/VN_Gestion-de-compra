/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.service;

import com.gestionCompra.gestion_compras.domain.entidades.Compra;
import com.gestionCompra.gestion_compras.domain.entidades.EvaluacionEntrega;
import com.gestionCompra.gestion_compras.dto.ManejoErrores;
import com.gestionCompra.gestion_compras.dto.Paginacion;
import com.gestionCompra.gestion_compras.repository.CierreRepo;
import com.gestionCompra.gestion_compras.repository.EvaluacionEntregaRepo;
import com.gestionCompra.gestion_compras.util.ABMGenerico;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EvaluacionEntregaService extends ABMGenerico<EvaluacionEntrega, Integer> {

    private final EvaluacionEntregaRepo repo;
    
    @Autowired // Inyección de campo o por constructor (preferible constructor)
    private CierreRepo cierreRepo;

    public EvaluacionEntregaService(EvaluacionEntregaRepo repo) {
        this.repo = repo;
    }
    
       @Autowired // Inyección de campo o por constructor (preferible constructor)
    private ReclamoService reclamoService;

    @Override
    protected JpaRepository<EvaluacionEntrega, Integer> getRepository() {
        return repo;
    }

    @Override
    protected String getEntityName() {
        return "Evaluacion de Entrega";
    }
    
    @Transactional
    public EvaluacionEntrega modificar(Integer id, EvaluacionEntrega datosNuevos) {
        
        // 1. Validar Existencia
        EvaluacionEntrega actual = buscarEvalEntregaById(id);

        boolean tieneCierre = cierreRepo.existsByEvaluacionEntrega_IdEvaluacionEntrega(id);
        
        if (tieneCierre) {
            throw new ManejoErrores(HttpStatus.BAD_REQUEST, 
                "BLOQUEO: No se puede modificar esta evaluación de entrega porque el proceso ya fue CERRADO.");
        }

        // 2. Actualizar campos (Lógica de negocio)
        if (datosNuevos.getFechaEntrega() != null) {
            actual.setFechaEntrega(datosNuevos.getFechaEntrega());
        }
        if (datosNuevos.getCumpleCondiciones() != null) {
            actual.setCumpleCondiciones(datosNuevos.getCumpleCondiciones());
        }
        if (datosNuevos.getObservaciones() != null) {
            actual.setObservaciones(datosNuevos.getObservaciones());
        }
        
        if (datosNuevos.getCumpleCondiciones()) {
            actual.setCumpleCondiciones(true);
            // Llamamos al servicio de reclamo para darlo de baja
            reclamoService.darBajaPorEvaluacion(id);
        } else {
            actual.setCumpleCondiciones(false);
        }

        return repo.save(actual);
    }

    public Paginacion<EvaluacionEntrega> listarAbiertas(Pageable pageable) {
        Page<EvaluacionEntrega> page = repo
                .findByCompra_AprobacionPresupuesto_Presupuesto_AprobacionSolicitud_Solicitud_CerradoFalse(pageable);
        return new Paginacion<>(page);
    }

    public EvaluacionEntrega buscarEvalEntregaById(Integer id) {
        
        return repo.findByIdSolicitudAbierta(id).orElseThrow(() -> new ManejoErrores(
                    HttpStatus.NOT_FOUND, 
                    "No se encontró la EvaluacionEntrega con ID: " + id + " o la solicitud ya está cerrada"
            ));
    }
    
    public Paginacion<EvaluacionEntrega> listarEvalSinCierre(Pageable pageable) {
        Page<EvaluacionEntrega> page = repo.listarEvalSinCierre(pageable);
        return new Paginacion<>(page);
    }

    public EvaluacionEntrega buscarEvalEntregaByCompra(Integer id) {
    return repo
        .buscarEvalEntregaPorCompra(id)
        .orElseThrow(() -> new ManejoErrores(
            HttpStatus.NOT_FOUND, 
            "No se encontró una evaluación activa para la compra con ID: " + id + " o la solicitud ya ha sido cerrada."
        ));
}
     
}

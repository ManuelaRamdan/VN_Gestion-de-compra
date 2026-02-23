/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.service;

import com.gestionCompra.gestion_compras.domain.entidades.EvaluacionEntrega;
import com.gestionCompra.gestion_compras.domain.entidades.Reclamo;
import com.gestionCompra.gestion_compras.domain.entidades.Sector;
import com.gestionCompra.gestion_compras.dto.ManejoErrores;
import com.gestionCompra.gestion_compras.dto.Paginacion;
import com.gestionCompra.gestion_compras.repository.EvaluacionEntregaRepo;
import com.gestionCompra.gestion_compras.repository.ReclamoRepo;
import com.gestionCompra.gestion_compras.util.ABMGenerico;
import com.gestionCompra.gestion_compras.util.ABMLogicoGenerico;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReclamoService extends ABMLogicoGenerico<Reclamo, Integer> {

    @Autowired
    private ReclamoRepo reclamoRepo;

    @Autowired
    private EvaluacionEntregaRepo evaluacionRepo;

    // BUSCAR POR ID DE EVALUACIÓN
    public Reclamo buscarPorEvaluacion(Integer idEval) {
        return reclamoRepo.findByEvaluacionEntrega_IdEvaluacionEntregaAndActivoTrue(idEval)
                .orElseThrow(() -> new RuntimeException("No existe reclamo para la evaluación: " + idEval));
    }

    @Transactional
    public Reclamo crearReclamo(Integer idEval, Reclamo reclamo) {
        // 1. Validar que el objeto reclamo no sea nulo
        if (reclamo == null) {
            throw new ManejoErrores(HttpStatus.BAD_REQUEST, "Los datos del reclamo son nulos.");
        }

        // 2. Buscar la evaluación para asegurar que existe y asignarla al reclamo
        EvaluacionEntrega eval = evaluacionRepo.findById(idEval)
                .orElseThrow(() -> new ManejoErrores(HttpStatus.NOT_FOUND,
                "Evaluación no encontrada con ID: " + idEval));

        // 3. LÓGICA DE RECICLAJE (Evita el error de llave duplicada)
        Optional<Reclamo> existenteOpt = reclamoRepo.findByEvaluacionEntrega_IdEvaluacionEntrega(idEval);

        if (existenteOpt.isPresent()) {
            Reclamo existente = existenteOpt.get();
            // Si ya está activo, error
            if (Boolean.TRUE.equals(existente.getActivo())) {
                throw new ManejoErrores(HttpStatus.CONFLICT, "Ya existe un reclamo activo para esta evaluación.");
            }
            // Si estaba inactivo (baja lógica), lo actualizamos y reactivamos
            actualizarCamposReclamo(existente, reclamo);
            existente.setActivo(true);
            return reclamoRepo.save(existente);
        }

        // 4. Si es nuevo, asignamos la evaluación y activamos
        reclamo.setEvaluacionEntrega(eval);
        reclamo.setActivo(true);
        return reclamoRepo.save(reclamo);
    }

// Método auxiliar para no repetir código
    private void actualizarCamposReclamo(Reclamo destino, Reclamo origen) {
        destino.setFechaReclamo(origen.getFechaReclamo());
        destino.setDetalleReclamo(origen.getDetalleReclamo());
        destino.setRespuestaProveedor(origen.getRespuestaProveedor());
        destino.setEsRecurrente(origen.getEsRecurrente());
        destino.setProductoRechazado(origen.getProductoRechazado());
        destino.setEntregaNueva(origen.getEntregaNueva());
        destino.setSatisfechoConNuevaEntrega(origen.getSatisfechoConNuevaEntrega());
    }

    // MODIFICAR
    @Transactional
    public Reclamo modificarReclamo(Integer idReclamo, Reclamo reclamoActualizado) {

        Reclamo reclamoExistente = reclamoRepo.findById(idReclamo)
                .orElseThrow(() -> new ManejoErrores(HttpStatus.NOT_FOUND,
                "Reclamo no encontrado con ID: " + idReclamo));

        if (reclamoActualizado.getFechaReclamo() != null && reclamoActualizado.getFechaReclamo().isAfter(LocalDate.now())) {
            throw new ManejoErrores(HttpStatus.BAD_REQUEST, "La fecha no puede ser mayor a la actual.");
        }

        if (reclamoActualizado.getEvaluacionEntrega() != null && reclamoActualizado.getEvaluacionEntrega().getIdEvaluacionEntrega() != null) {

            Integer nuevoIdEval = reclamoActualizado.getEvaluacionEntrega().getIdEvaluacionEntrega();
            Integer idActual = reclamoExistente.getEvaluacionEntrega().getIdEvaluacionEntrega();

            // Solo validamos si el ID enviado es distinto al que ya tiene
            if (!nuevoIdEval.equals(idActual)) {

                // VALIDACIÓN: ¿Existe en la DB?
                EvaluacionEntrega nuevaEval = evaluacionRepo.findById(nuevoIdEval)
                        .orElseThrow(() -> new ManejoErrores(HttpStatus.NOT_FOUND,
                        "No se puede actualizar: La Evaluación con ID " + nuevoIdEval + " no existe."));

                // VALIDACIÓN: ¿Está ocupada por otro reclamo?
                if (reclamoRepo.existsByEvaluacionEntrega_IdEvaluacionEntregaAndActivoTrue(nuevoIdEval)) {
                    throw new ManejoErrores(HttpStatus.CONFLICT,
                            "La evaluación destino ya tiene un reclamo asociado.");
                }

                reclamoExistente.setEvaluacionEntrega(nuevaEval);
            }
        }

        // 4. Actualización de campos básicos
        // Solo actualizamos si el valor no es nulo en el request para no borrar datos existentes
        if (reclamoActualizado.getRespuestaProveedor() != null) {
            reclamoExistente.setRespuestaProveedor(reclamoActualizado.getRespuestaProveedor());
        }
        if (reclamoActualizado.getSatisfechoConNuevaEntrega() != null) {
            reclamoExistente.setSatisfechoConNuevaEntrega(reclamoActualizado.getSatisfechoConNuevaEntrega());
        }
        if (reclamoActualizado.getDetalleReclamo() != null) {
            reclamoExistente.setDetalleReclamo(reclamoActualizado.getDetalleReclamo());
        }
        if (reclamoActualizado.getEntregaNueva() != null) {
            reclamoExistente.setEntregaNueva(reclamoActualizado.getEntregaNueva());
        }
        if (reclamoActualizado.getEsRecurrente() != null) {
            reclamoExistente.setEsRecurrente(reclamoActualizado.getEsRecurrente());
        }
        if (reclamoActualizado.getProductoRechazado() != null) {
            reclamoExistente.setProductoRechazado(reclamoActualizado.getProductoRechazado());
        }

        // Si mandó fecha, la actualizamos; si no, mantenemos la anterior
        if (reclamoActualizado.getFechaReclamo() != null) {
            reclamoExistente.setFechaReclamo(reclamoActualizado.getFechaReclamo());
        }

        return reclamoRepo.save(reclamoExistente);
    }

    @Override
    protected JpaRepository<Reclamo, Integer> getRepository() {
        return reclamoRepo;
    }

    @Override
    protected String getEntityName() {
        return "Reclamo";
    }

    public Paginacion<Reclamo> listarReclamosAbiertos(Pageable pageable) {
        Page<Reclamo> page = reclamoRepo
                .findByEvaluacionEntrega_Compra_AprobacionPresupuesto_Presupuesto_AprobacionSolicitud_Solicitud_CerradoFalseAndActivoTrue(pageable);
        return new Paginacion<>(page);
    }

    public Reclamo buscarReclamoyId(Integer id) {
        return reclamoRepo.findByIdReclamoAndEvaluacionEntrega_Compra_AprobacionPresupuesto_Presupuesto_AprobacionSolicitud_Solicitud_CerradoFalseAndActivoTrue(id).orElseThrow(() -> new ManejoErrores(
                HttpStatus.NOT_FOUND,
                "No se encontró el reclamo con ID: " + id + " o la solicitud ya está cerrada"
        ));

    }

    @Transactional
    public void darBajaPorEvaluacion(Integer idEval) {
        reclamoRepo.findByEvaluacionEntrega_IdEvaluacionEntregaAndActivoTrue(idEval)
                .ifPresent(reclamo -> {
                    reclamo.setActivo(false);
                    reclamoRepo.save(reclamo);
                });
    }
}

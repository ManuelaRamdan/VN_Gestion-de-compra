/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.domain.entidades;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import java.io.Serializable;
import java.time.LocalDate;

/**
 *
 * @author Usuario
 */
@Entity
@Table(name = "evaluacion_entrega")
public class EvaluacionEntrega implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evaluacion_entrega")
    private Integer idEvaluacionEntrega;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_compra", nullable = false)
    private Compra compra;

    @Column(name = "fecha_entrega")
    private LocalDate fechaEntrega;

    @Column(name = "cumple_condiciones")
    private Boolean cumpleCondiciones;

    @Column(length = 255)
    private String observaciones;

    @OneToOne(mappedBy = "evaluacionEntrega", cascade = CascadeType.ALL)
    private Reclamo reclamo;
    
    @OneToOne(mappedBy = "evaluacionEntrega")
    @JsonIgnore // Evitar ciclo infinito
    private Cierre cierre;

    // -------------------------------------------------------------------
    // --- NUEVO: CAMPO CALCULADO PARA EL FRONTEND ---
    // -------------------------------------------------------------------
    @Transient
    public boolean isCerrada() {
        return cierre != null;
    }

    public Integer getIdEvaluacionEntrega() {
        return idEvaluacionEntrega;
    }

    public void setIdEvaluacionEntrega(Integer idEvaluacionEntrega) {
        this.idEvaluacionEntrega = idEvaluacionEntrega;
    }

    public Compra getCompra() {
        return compra;
    }

    public void setCompra(Compra compra) {
        this.compra = compra;
    }

    public LocalDate getFechaEntrega() {
        return fechaEntrega;
    }

    public void setFechaEntrega(LocalDate fechaEntrega) {
        this.fechaEntrega = fechaEntrega;
    }

    public Boolean getCumpleCondiciones() {
        return cumpleCondiciones;
    }

    public void setCumpleCondiciones(Boolean cumpleCondiciones) {
        this.cumpleCondiciones = cumpleCondiciones;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public Reclamo getReclamo() {
        return reclamo;
    }

    public void setReclamo(Reclamo reclamo) {
        this.reclamo = reclamo;
    }

    public Cierre getCierre() {
        return cierre;
    }

    public void setCierre(Cierre cierre) {
        this.cierre = cierre;
    }
    
}

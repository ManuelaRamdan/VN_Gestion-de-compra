/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.domain.entidades;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Table(name = "cierre")
public class Cierre implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idCierre;

    @OneToOne
    @JoinColumn(name = "id_eval_entrega", unique = true, nullable = false)
    private EvaluacionEntrega evaluacionEntrega;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "fecha_cierre", nullable = false)
    private LocalDate fechaCierre;

    @Column(length = 255)
    private String observaciones;

    public Integer getIdCierre() {
        return idCierre;
    }

    public void setIdCierre(Integer idCierre) {
        this.idCierre = idCierre;
    }

    public EvaluacionEntrega getEvaluacionEntrega() {
        return evaluacionEntrega;
    }

    public void setEvaluacionEntrega(EvaluacionEntrega evaluacionEntrega) {
        this.evaluacionEntrega = evaluacionEntrega;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public LocalDate getFechaCierre() {
        return fechaCierre;
    }

    public void setFechaCierre(LocalDate fechaCierre) {
        this.fechaCierre = fechaCierre;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

   
}
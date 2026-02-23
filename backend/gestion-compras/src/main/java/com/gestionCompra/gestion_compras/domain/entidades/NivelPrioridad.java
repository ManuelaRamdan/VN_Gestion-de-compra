/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.domain.entidades;

import com.gestionCompra.gestion_compras.util.EntidadBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.io.Serializable;


@Entity
@Table(name = "nivel_prioridad")

public class NivelPrioridad implements Serializable, EntidadBase {

    private static final long serialVersionUID = 1L;
@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_nivel_prioridad")
    private Integer idNivelPrioridad;
    private String categoria;
    private Integer dias;

    @Column(nullable = false)
    private Boolean activo = true;
    
    
    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public Integer getDias() {
        return dias;
    }

    public void setDias(Integer dias) {
        this.dias = dias;
    }

    public Integer getIdNivelPrioridad() {
        return idNivelPrioridad;
    }

    public void setIdNivelPrioridad(Integer idNivelPrioridad) {
        this.idNivelPrioridad = idNivelPrioridad;
    }

    @Override
    public Integer getId() {
        return getIdNivelPrioridad();
    }

    @Override
    public Boolean getActivo() {
        return this.activo;
    }

    @Override
    public void setActivo(Boolean estado) {
        this.activo = estado;
    }
    
    

    
}


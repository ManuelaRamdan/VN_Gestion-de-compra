/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.domain.entidades;

/**
 *
 * @author Usuario
 */
import com.gestionCompra.gestion_compras.util.AprobacionBase;
import com.gestionCompra.gestion_compras.util.EntidadBase;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.time.LocalDateTime;


@Entity
@Table(name = "aprobacion_presupuesto")
@AttributeOverride(name = "id", column = @Column(name = "id_aprobacion_presu"))
public class AprobacionPresupuesto extends AprobacionBase  {


    @ManyToOne
    @JoinColumn(name = "id_presupuesto")
    private Presupuesto presupuesto; 

    public Presupuesto getPresupuesto() {
        return presupuesto;
    }

    public void setPresupuesto(Presupuesto presupuesto) {
        this.presupuesto = presupuesto;
    }

    
}

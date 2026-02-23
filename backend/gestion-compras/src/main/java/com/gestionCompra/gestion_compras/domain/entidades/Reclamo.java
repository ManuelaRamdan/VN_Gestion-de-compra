/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.domain.entidades;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gestionCompra.gestion_compras.util.EntidadBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.time.LocalDate;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "reclamo")
public class Reclamo implements Serializable, EntidadBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idReclamo;

@JsonIgnore
@OneToOne
@JoinColumn(name = "id_evaluacion_entrega", unique = true, nullable = false)
private EvaluacionEntrega evaluacionEntrega;

    @Column(name = "fecha_reclamo", nullable = false)
    private LocalDate fechaReclamo;

    @Enumerated(EnumType.STRING) 
    @JdbcTypeCode(SqlTypes.NAMED_ENUM) 
    @Column(name = "respuesta_proveedor", columnDefinition = "tipo_respuesta_proveedor")
    private RespuestaProveedor respuestaProveedor;

    @Column(name = "es_recurrente")
    private Boolean esRecurrente = false;

    @Column(name = "producto_rechazado")
    private Boolean productoRechazado = false;

    @Column(name = "entrega_nueva")
    private Boolean entregaNueva = false;

    @Column(name = "satisfecho_nueva_entrega")
    private Boolean satisfechoConNuevaEntrega;

    @Column(name = "detalle_reclamo", columnDefinition = "TEXT")
    private String detalleReclamo;

    
     @Column(nullable = false)
    private Boolean activo = true;
     
     
    public Integer getIdReclamo() {
        return idReclamo;
    }

    public void setIdReclamo(Integer idReclamo) {
        this.idReclamo = idReclamo;
    }

    public EvaluacionEntrega getEvaluacionEntrega() {
        return evaluacionEntrega;
    }

    public void setEvaluacionEntrega(EvaluacionEntrega evaluacionEntrega) {
        this.evaluacionEntrega = evaluacionEntrega;
    }

    public LocalDate getFechaReclamo() {
        return fechaReclamo;
    }

    public void setFechaReclamo(LocalDate fechaReclamo) {
        this.fechaReclamo = fechaReclamo;
    }

    public RespuestaProveedor getRespuestaProveedor() {
        return respuestaProveedor;
    }

    public void setRespuestaProveedor(RespuestaProveedor respuestaProveedor) {
        this.respuestaProveedor = respuestaProveedor;
    }

    public Boolean getEsRecurrente() {
        return esRecurrente;
    }

    public void setEsRecurrente(Boolean esRecurrente) {
        this.esRecurrente = esRecurrente;
    }

    public Boolean getProductoRechazado() {
        return productoRechazado;
    }

    public void setProductoRechazado(Boolean productoRechazado) {
        this.productoRechazado = productoRechazado;
    }

    public Boolean getEntregaNueva() {
        return entregaNueva;
    }

    public void setEntregaNueva(Boolean entregaNueva) {
        this.entregaNueva = entregaNueva;
    }

    public Boolean getSatisfechoConNuevaEntrega() {
        return satisfechoConNuevaEntrega;
    }

    public void setSatisfechoConNuevaEntrega(Boolean satisfechoConNuevaEntrega) {
        this.satisfechoConNuevaEntrega = satisfechoConNuevaEntrega;
    }

    public String getDetalleReclamo() {
        return detalleReclamo;
    }

    public void setDetalleReclamo(String detalleReclamo) {
        this.detalleReclamo = detalleReclamo;
    }

    @Override
    public Integer getId() {
        return idReclamo;
    }

        @Override
    public Boolean getActivo() { return activo; }
    @Override
    public void setActivo(Boolean activo) { this.activo = activo; }

    
}
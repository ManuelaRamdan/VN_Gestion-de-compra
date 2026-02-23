/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.domain.entidades;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 *
 * @author Usuario
 */
@Entity
@Table(name = "evaluacion_proveedor")
public class EvaluacionProveedor implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evaluacion_proveedor")
    private Integer idEvalProveedor; // 

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_proveedor", nullable = false)
    private Proveedor proveedor; // 

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario; // 

    @Column(name = "servicioproducto", length = 150)
    private String servicioProducto; // 

    @Column(name = "periodoevaluado")
    private Integer periodoEvaluado;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime fecha;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM) 
    @Column(name = "calidadproducto", columnDefinition = "nivel_calificacion", nullable = false)
    private NivelCalificacion calidadproducto;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "cumplimientoplazos", columnDefinition = "nivel_calificacion", nullable = false)
    private NivelCalificacion cumplimientoplazos;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "atencioncliente", columnDefinition = "nivel_calificacion", nullable = false)
    private NivelCalificacion atencioncliente;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "respuestareclamos", columnDefinition = "nivel_calificacion", nullable = false)
    private NivelCalificacion respuestareclamos;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "precioservicio", columnDefinition = "nivel_calificacion", nullable = false)
    private NivelCalificacion precioservicio;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "gestionadministrativa", columnDefinition = "nivel_calificacion", nullable = false)
    private NivelCalificacion gestionadministrativa;

    @Column(name = "resultado", precision = 5, scale = 2)
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.READ_ONLY)
    private BigDecimal resultado;

    @Column(name = "aprobado")
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.READ_ONLY)
    private Boolean aprobado;

    @Column(precision = 5, scale = 2)
    private BigDecimal nivelaprobacion = new BigDecimal("70.00"); // 

    @Column(name = "proveedorsgc")
    private Boolean proveedorSgc;

    @Column(columnDefinition = "text")
    private String comentarios;

    @Column(name = "firma_responsable", length = 100)
    private String firmaResponsable;

    public Integer getIdEvalProveedor() {
        return idEvalProveedor;
    }

    public void setIdEvalProveedor(Integer idEvalProveedor) {
        this.idEvalProveedor = idEvalProveedor;
    }

    public Proveedor getProveedor() {
        return proveedor;
    }

    public void setProveedor(Proveedor proveedor) {
        this.proveedor = proveedor;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getServicioProducto() {
        return servicioProducto;
    }

    public void setServicioProducto(String servicioProducto) {
        this.servicioProducto = servicioProducto;
    }

    public Integer getPeriodoEvaluado() {
        return periodoEvaluado;
    }

    public void setPeriodoEvaluado(Integer periodoEvaluado) {
        this.periodoEvaluado = periodoEvaluado;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public NivelCalificacion getCalidadproducto() {
        return calidadproducto;
    }

    public void setCalidadproducto(NivelCalificacion calidadproducto) {
        this.calidadproducto = calidadproducto;
    }

    public NivelCalificacion getCumplimientoplazos() {
        return cumplimientoplazos;
    }

    public void setCumplimientoplazos(NivelCalificacion cumplimientoplazos) {
        this.cumplimientoplazos = cumplimientoplazos;
    }

    public NivelCalificacion getAtencioncliente() {
        return atencioncliente;
    }

    public void setAtencioncliente(NivelCalificacion atencioncliente) {
        this.atencioncliente = atencioncliente;
    }

    public NivelCalificacion getRespuestareclamos() {
        return respuestareclamos;
    }

    public void setRespuestareclamos(NivelCalificacion respuestareclamos) {
        this.respuestareclamos = respuestareclamos;
    }

    public NivelCalificacion getPrecioservicio() {
        return precioservicio;
    }

    public void setPrecioservicio(NivelCalificacion precioservicio) {
        this.precioservicio = precioservicio;
    }

    public NivelCalificacion getGestionadministrativa() {
        return gestionadministrativa;
    }

    public void setGestionadministrativa(NivelCalificacion gestionadministrativa) {
        this.gestionadministrativa = gestionadministrativa;
    }

    public BigDecimal getResultado() {
        return resultado;
    }

    public void setResultado(BigDecimal resultado) {
        this.resultado = resultado;
    }

    public BigDecimal getNivelaprobacion() {
        return nivelaprobacion;
    }

    public void setNivelaprobacion(BigDecimal nivelaprobacion) {
        this.nivelaprobacion = nivelaprobacion;
    }

    public Boolean getProveedorSgc() {
        return proveedorSgc;
    }

    public void setProveedorSgc(Boolean proveedorSgc) {
        this.proveedorSgc = proveedorSgc;
    }

    public Boolean getAprobado() {
        return aprobado;
    }

    public void setAprobado(Boolean aprobado) {
        this.aprobado = aprobado;
    }

    public String getComentarios() {
        return comentarios;
    }

    public void setComentarios(String comentarios) {
        this.comentarios = comentarios;
    }

    public String getFirmaResponsable() {
        return firmaResponsable;
    }

    public void setFirmaResponsable(String firmaResponsable) {
        this.firmaResponsable = firmaResponsable;
    }

}

/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.domain.entidades;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gestionCompra.gestion_compras.util.EntidadBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
import java.time.LocalDateTime;

@Entity
@Table(name = "presupuesto")
public class Presupuesto implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_presupuesto")
    private Integer idPresupuesto; // Clave primaria

    @ManyToOne
    @JoinColumn(name = "id_proveedor", nullable = false)
    private Proveedor proveedor; // Relación con el proveedor

    @ManyToOne
    @JoinColumn(name = "id_aprob_solicitud", nullable = false)
    private AprobacionSolicitud aprobacionSolicitud; // Vinculado a la solicitud aprobada

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario; // Usuario que cargó el presupuesto

    @Column(name = "fecha_solicitud")
    private LocalDate fechaSolicitud; // Fecha en que se pidió el presupuesto

    @Column(name = "fecha_recepcion")
    private LocalDate fechaRecepcion; // Fecha en que se recibió

    @Column(name = "cotizacion_satisfactoria")
    private Boolean cotizacionSatisfactoria; // Si el precio/calidad es adecuado

    @Column(columnDefinition = "TEXT")
    private String observaciones; // Comentarios adicionales

    @Column(name = "archivo_pdf_path")
    private String archivoPdfPath; // Ruta o nombre del archivo PDF adjunto

    @OneToOne(mappedBy = "presupuesto")
    @JsonIgnore
    private AprobacionPresupuesto aprobacionPresupuesto;
    
    @Transient 
    public String getEstadoAprobacion() {
        if (aprobacionPresupuesto == null) {
            return "PENDIENTE"; // Si no hay registro, asumimos pendiente
        }
        return aprobacionPresupuesto.getEstado();
    }

    // --- Constructor vacío requerido por JPA ---
    public Presupuesto() {
    }

    // --- Getters y Setters ---
    public Integer getIdPresupuesto() {
        return idPresupuesto;
    }

    public void setIdPresupuesto(Integer idPresupuesto) {
        this.idPresupuesto = idPresupuesto;
    }

    public Proveedor getProveedor() {
        return proveedor;
    }

    public void setProveedor(Proveedor proveedor) {
        this.proveedor = proveedor;
    }

    public AprobacionSolicitud getAprobacionSolicitud() {
        return aprobacionSolicitud;
    }

    public void setAprobacionSolicitud(AprobacionSolicitud aprobacionSolicitud) {
        this.aprobacionSolicitud = aprobacionSolicitud;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Boolean getCotizacionSatisfactoria() {
        return cotizacionSatisfactoria;
    }

    public void setCotizacionSatisfactoria(Boolean cotizacionSatisfactoria) {
        this.cotizacionSatisfactoria = cotizacionSatisfactoria;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public String getArchivoPdfPath() {
        return archivoPdfPath;
    }

    public void setArchivoPdfPath(String archivoPdfPath) {
        this.archivoPdfPath = archivoPdfPath;
    }

    public LocalDate getFechaSolicitud() {
        return fechaSolicitud;
    }

    public void setFechaSolicitud(LocalDate fechaSolicitud) {
        this.fechaSolicitud = fechaSolicitud;
    }

    public LocalDate getFechaRecepcion() {
        return fechaRecepcion;
    }

    public void setFechaRecepcion(LocalDate fechaRecepcion) {
        this.fechaRecepcion = fechaRecepcion;
    }

}

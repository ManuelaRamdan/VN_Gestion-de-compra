package com.gestionCompra.gestion_compras.domain.entidades;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gestionCompra.gestion_compras.util.EntidadBase;
import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "solicitud")
public class Solicitud implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idSolicitud;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime fecha;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime fechaAdmisible;

    private Integer cantidad;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_producto")
    private Producto producto;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_nivel_prioridad")
    private NivelPrioridad nivelPrioridad;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    // En Solicitud.java
    @OneToOne(mappedBy = "solicitud")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("solicitud") // <--- AGREGAR ESTO
    private AprobacionSolicitud aprobacion;
    private boolean cerrado = false;

    public boolean isCerrado() {
        return cerrado;
    }

    public void setCerrado(boolean cerrado) {
        this.cerrado = cerrado;
    }

    public AprobacionSolicitud getAprobacion() {
        return aprobacion;
    }

    public void setAprobacion(AprobacionSolicitud aprobacion) {
        this.aprobacion = aprobacion;
    }

    public Integer getIdSolicitud() {
        return idSolicitud;
    }

    public void setIdSolicitud(Integer idSolicitud) {
        this.idSolicitud = idSolicitud;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public NivelPrioridad getNivelPrioridad() {
        return nivelPrioridad;
    }

    public void setNivelPrioridad(NivelPrioridad nivelPrioridad) {
        this.nivelPrioridad = nivelPrioridad;
    }

    public LocalDateTime getFechaAdmisible() {
        return fechaAdmisible;
    }

    public void setFechaAdmisible(LocalDateTime fechaAdmisible) {
        this.fechaAdmisible = fechaAdmisible;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

}

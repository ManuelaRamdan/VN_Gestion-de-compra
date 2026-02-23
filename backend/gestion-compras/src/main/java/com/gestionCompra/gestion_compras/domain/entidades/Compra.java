package com.gestionCompra.gestion_compras.domain.entidades;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "compra")
public class Compra implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_compra")
    private Integer idCompra;

    @OneToOne // Una aprobación genera una única compra
    @JoinColumn(name = "id_aprobacion_presu", nullable = false)
    private AprobacionPresupuesto aprobacionPresupuesto;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario; // El usuario que registra la compra

    @Column(name = "fecha_solicitud")
    private LocalDate fechaSolicitud;

    @Column(name = "fecha_recepcion")
    private LocalDate fechaRecepcion;

    @Column(name = "factura_pdf_path")
    private String facturaPdfPath;


    
    @OneToMany(mappedBy = "compra")
    @JsonIgnore
    private List<EvaluacionEntrega> evaluaciones;

    // --- NUEVO: CAMPO CALCULADO PARA EL FRONTEND ---
    // Esto devolverá "true" en el JSON si ya tiene una evaluación hecha
    @Transient
    public boolean isEvaluada() {
        return evaluaciones != null && !evaluaciones.isEmpty();
    }

    public Compra() {}

    
    public Integer getIdCompra() { return idCompra; }
    public void setIdCompra(Integer idCompra) { this.idCompra = idCompra; }

    public AprobacionPresupuesto getAprobacionPresupuesto() { return aprobacionPresupuesto; }
    public void setAprobacionPresupuesto(AprobacionPresupuesto aprobacionPresupuesto) { this.aprobacionPresupuesto = aprobacionPresupuesto; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public LocalDate getFechaSolicitud() { return fechaSolicitud; }
    public void setFechaSolicitud(LocalDate fechaSolicitud) { this.fechaSolicitud = fechaSolicitud; }

    public LocalDate getFechaRecepcion() { return fechaRecepcion; }
    public void setFechaRecepcion(LocalDate fechaRecepcion) { this.fechaRecepcion = fechaRecepcion; }

    public String getFacturaPdfPath() { return facturaPdfPath; }
    public void setFacturaPdfPath(String facturaPdfPath) { this.facturaPdfPath = facturaPdfPath; }

   
    public List<EvaluacionEntrega> getEvaluaciones() {
        return evaluaciones;
    }

    public void setEvaluaciones(List<EvaluacionEntrega> evaluaciones) {
        this.evaluaciones = evaluaciones;
    }
}
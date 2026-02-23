package com.gestionCompra.gestion_compras.domain.entidades;

import com.gestionCompra.gestion_compras.util.EntidadBase;
import jakarta.persistence.*;

@Entity
@Table(name = "sector")
public class Sector implements EntidadBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sector")
    private Integer idSector;

    private String nombre;

    @Column(nullable = false)
    private Boolean activo = true;

    @Override
    public Integer getId() {
        return idSector;
    }

    @Override
    public Boolean getActivo() {
        return this.activo;
    }

    @Override
    public void setActivo(Boolean estado) {
        this.activo = estado;
    }

    // Getters y Setters para 'nombre'
    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Integer getIdSector() {
        return idSector;
    }

    public void setIdSector(Integer idSector) {
        this.idSector = idSector;
    }
}

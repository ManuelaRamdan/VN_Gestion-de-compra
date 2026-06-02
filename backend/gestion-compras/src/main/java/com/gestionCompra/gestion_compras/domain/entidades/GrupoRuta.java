// GrupoRuta.java
package com.gestionCompra.gestion_compras.domain.entidades;

import jakarta.persistence.*;

@Entity
@Table(name = "grupo_ruta")
public class GrupoRuta {
    @Id
    private String nombre;
    private String descripcion;

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}
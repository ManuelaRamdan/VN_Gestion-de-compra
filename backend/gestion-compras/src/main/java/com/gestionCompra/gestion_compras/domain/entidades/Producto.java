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
@Table(name = "producto")

public class Producto implements Serializable, EntidadBase{

    private static final long serialVersionUID = 1L;
@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto")
    private Integer idProducto;
    private String nombre;

    
    @Column(nullable = false)
    private Boolean activo = true;


    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Integer getIdProducto() {
        return idProducto;
    }

    public void setIdProducto(Integer idProducto) {
        this.idProducto = idProducto;
    }

    @Override
    public Boolean getActivo() {
        return this.activo;
    }

    @Override
    public void setActivo(Boolean estado) {
        this.activo = estado;
    }

    @Override
    public Integer getId() {
        return getIdProducto();
    }
    
    
}

package com.gestionCompra.gestion_compras.domain.entidades;

import com.gestionCompra.gestion_compras.util.EntidadBase;
import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "proveedor")
public class Proveedor implements Serializable, EntidadBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idProveedor;

    @Column(nullable = false, length = 100)
    private String nombreEmpresa;

    @Column(length = 100)
    private String nombreContacto;

    @Column(length = 100)
    private String mail;

    private String direccion;

    private Long telefono;

    @Column(nullable = false)
    private Boolean activo = true;

    // --- GETTERS Y SETTERS ---
    public Integer getIdProveedor() {
        return idProveedor;
    }

    public void setIdProveedor(Integer idProveedor) {
        this.idProveedor = idProveedor;
    }

    public String getNombreEmpresa() {
        return nombreEmpresa;
    }

    public void setNombreEmpresa(String nombreEmpresa) {
        this.nombreEmpresa = nombreEmpresa;
    }

    public String getNombreContacto() {
        return nombreContacto;
    }

    public void setNombreContacto(String nombreContacto) {
        this.nombreContacto = nombreContacto;
    }

    public String getMail() {
        return mail;
    }

    public void setMail(String mail) {
        this.mail = mail;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public Long getTelefono() {
        return telefono;
    }

    public void setTelefono(Long telefono) {
        this.telefono = telefono;
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
        return getIdProveedor();
    }

}

package com.gestionCompra.gestion_compras.domain.entidades;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gestionCompra.gestion_compras.util.EntidadBase;
import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "usuario")
public class Usuario implements Serializable, EntidadBase {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Indica que el valor lo genera la base de datos automáticamente
    @Column(name = "id_usuario") // vincula este campo con la columno id_usuario
    private Integer idUsuario;

    // nullable = false -> que el campo no sea nulo
    //unique = true -> que no exista dos usuarios con el mismo nombre
    @Column(nullable = false, unique = true)
    private String username;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_sector", nullable = false)
    private Sector sector;

    @Column(nullable = false)
    private Boolean activo = true;

    public Usuario() {
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Sector getSector() {
        return sector;
    }

    public void setSector(Sector sector) {
        this.sector = sector;
    }

    @Override
    public Boolean getActivo() {
        return this.activo;
    }

    @Override
    public void setActivo(Boolean estado) {
        this.activo = estado;
    }

    public Integer getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }

    @Override
    public Integer getId() {
        return getIdUsuario();
    }
}

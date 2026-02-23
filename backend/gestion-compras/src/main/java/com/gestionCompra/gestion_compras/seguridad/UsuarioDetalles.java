/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.seguridad;

import com.gestionCompra.gestion_compras.config.SecurityConfig;

import java.io.Serializable;
import java.util.Collection;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

//Spring Security usa UsuarioDetalles para saber quién sos, qué permisos tenés y si tu cuenta está habilitada.
// es un adaptador que transforma tu clase Usuario de base de datos en un formato que Spring Security entiende.
// getSector -> Devuelve el sector para que otras clases (como SecurityConfig) puedan saber a qué área pertenece el usuario.
// getAuthorities -> Spring Security necesita saber qué permisos tiene el usuario.-> SimpleGrantedAuthority es un contenedor que representa un permiso/rol.
// devolvés el sector como permiso.
//getPassword -> Devuelve la contraseña del usuario para que Spring Security pueda validarla contra la ingresada en el login.
// getUsername -> Devuelve el nombre de usuario para identificar al usuario.
// 4 métodos controlan si la cuenta está activa. Spring Security los llama antes de permitir el login.
//isAccountNonExpired ->  La cuenta nunca expira
//isAccountNonLocked -> La cuenta nunca se bloquea
//isCredentialsNonExpired ->  La contraseña nunca expira
//isEnabled -> // Solo se habilita si 'estado' es true
public class UsuarioDetalles implements UserDetails, Serializable {

    private final String username;
    private final String password;
    private final String sector;
    private final boolean estado;
       private final Integer id;


    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);

    public UsuarioDetalles(String username, String password, String sector, boolean estado, Integer id) {
        this.username = username;
        this.password = password;
        this.sector = sector;
        this.estado = estado;
        this.id = id;
    }

    public String getSector() {
        return sector;
    }

    public Integer getId() {
        return id;
    }
    
    

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Usamos el sector directamente porque en DB es "GERENCIA"
        return List.of(new SimpleGrantedAuthority(this.sector));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return estado;
    }

    @Override
    public String toString() {
        return "UsuarioDetalles{username='" + username + "', sector='" + sector + "'}";
    }
}

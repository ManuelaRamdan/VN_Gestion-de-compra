/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.repository;

import com.gestionCompra.gestion_compras.domain.entidades.Usuario;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


/*

esta Clase hereda Spring Data JPA donde mas de 20 métodos para 
interactuar con PostgreSQL sin escribir una sola línea de código adicional
 */
@Repository
public interface UsuarioRepo extends JpaRepository<Usuario, Integer> {

    /*Optional -> en lugar de devolver null devuelve un contenedor si existe el usuario con el estado true,
                  el objeto se guarda en Optional, pero si no esta permite controlar los errores
     */
    Optional<Usuario> findByUsernameAndActivoTrue(String username);

    Optional<Usuario> findByIdAndActivoTrue(Integer id);

    Page<Usuario> findAllByActivoTrue(Pageable paginacion);
}

/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.repository;

import com.gestionCompra.gestion_compras.domain.entidades.NivelPrioridad;
import com.gestionCompra.gestion_compras.domain.entidades.Sector;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NivelPrioridadRepo extends JpaRepository<NivelPrioridad, Integer> {
    
        Page<NivelPrioridad> findByActivoTrue(Pageable pageable);

    Optional<NivelPrioridad> findByIdAndActivoTrue(Integer id);
}
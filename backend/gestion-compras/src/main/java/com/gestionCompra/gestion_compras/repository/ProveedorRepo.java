package com.gestionCompra.gestion_compras.repository;

import com.gestionCompra.gestion_compras.domain.entidades.Proveedor;
import com.gestionCompra.gestion_compras.domain.entidades.Sector;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProveedorRepo extends JpaRepository<Proveedor, Integer> {
        Page<Proveedor> findByActivoTrue(Pageable pageable);

    Optional<Proveedor> findByIdAndActivoTrue(Integer id);
}
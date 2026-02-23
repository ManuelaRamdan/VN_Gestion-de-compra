package com.gestionCompra.gestion_compras.service;

import com.gestionCompra.gestion_compras.domain.entidades.NivelPrioridad;
import com.gestionCompra.gestion_compras.domain.entidades.Producto;
import com.gestionCompra.gestion_compras.dto.ManejoErrores;
import com.gestionCompra.gestion_compras.dto.Paginacion;
import com.gestionCompra.gestion_compras.repository.NivelPrioridadRepo;
import com.gestionCompra.gestion_compras.util.ABMGenerico;
import com.gestionCompra.gestion_compras.util.ABMLogicoGenerico;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NivelPrioridadService extends ABMLogicoGenerico<NivelPrioridad, Integer> {

    @Autowired
    private NivelPrioridadRepo nivelPrioridadRepo;

    @Override
    protected JpaRepository<NivelPrioridad, Integer> getRepository() {
        return nivelPrioridadRepo;
    }

    @Override
    protected String getEntityName() {
        return "Nivel de Prioridad";
    }
    
    @Override
    public NivelPrioridad findById(Integer id) {
        return nivelPrioridadRepo.findByIdAndActivoTrue(id)
                .orElseThrow(() -> new ManejoErrores(
                    HttpStatus.NOT_FOUND, 
                    "Sector no encontrado o se encuentra inactivo"
                ));
    }

    // 2. Sobrescribir el listado general
    @Override
    public Paginacion<NivelPrioridad> findAll(Pageable pageable) {
        return new Paginacion<>(nivelPrioridadRepo.findByActivoTrue(pageable));
    }

    // 3. Modificar la lógica de baja
    @Override
    @Transactional
    public void bajaLogica(Integer id) {
        // Al usar el findById de arriba, si ya está inactivo lanzará el 404/Error
        NivelPrioridad producto = this.findById(id); 
        producto.setActivo(false);
        nivelPrioridadRepo.save(producto);
    }
}
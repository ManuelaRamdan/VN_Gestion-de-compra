package com.gestionCompra.gestion_compras.service;

import com.gestionCompra.gestion_compras.domain.entidades.Sector;
import com.gestionCompra.gestion_compras.dto.ManejoErrores;
import com.gestionCompra.gestion_compras.dto.Paginacion;
import com.gestionCompra.gestion_compras.repository.SectorRepo;
import com.gestionCompra.gestion_compras.util.ABMGenerico;
import com.gestionCompra.gestion_compras.util.ABMLogicoGenerico;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SectorService extends ABMLogicoGenerico<Sector, Integer> {

    @Autowired
    private SectorRepo sectorRepo;

    @Override
    protected JpaRepository<Sector, Integer> getRepository() {
        return sectorRepo;
    }

    @Override
    protected String getEntityName() {
        return "Sector";
    }
    
    
    @Override
    public Sector findById(Integer id) {
        return sectorRepo.findByIdAndActivoTrue(id)
                .orElseThrow(() -> new ManejoErrores(
                    HttpStatus.NOT_FOUND, 
                    "Sector no encontrado o se encuentra inactivo"
                ));
    }

    // 2. Sobrescribir el listado general
    @Override
    public Paginacion<Sector> findAll(Pageable pageable) {
        return new Paginacion<>(sectorRepo.findByActivoTrue(pageable));
    }

    // 3. Modificar la lógica de baja
    @Override
    @Transactional
    public void bajaLogica(Integer id) {
        // Al usar el findById de arriba, si ya está inactivo lanzará el 404/Error
        Sector sector = this.findById(id); 
        sector.setActivo(false);
        sectorRepo.save(sector);
    }
}
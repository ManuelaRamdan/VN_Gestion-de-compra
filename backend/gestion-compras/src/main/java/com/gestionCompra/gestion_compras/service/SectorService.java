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
    
   @Transactional
    public Sector crearSector(Sector nuevoSector) {
        // 1. Limpiamos los espacios al principio y al final
        String nombreLimpio = nuevoSector.getNombre().trim();
        nuevoSector.setNombre(nombreLimpio);

        // 2. Usamos el nuevo método con IgnoreCase
        if (sectorRepo.findByNombreIgnoreCaseAndActivoTrue(nombreLimpio).isPresent()) {
            throw new ManejoErrores(
                    HttpStatus.BAD_REQUEST, 
                    "El nombre del sector ya se encuentra registrado"
            );
        }
        
        nuevoSector.setActivo(true);
        return sectorRepo.save(nuevoSector);
    }

    @Transactional
    public Sector modificarSector(Integer id, Sector datosNuevos) {
        Sector sectorExistente = this.findById(id);

        if (datosNuevos.getNombre() != null && !datosNuevos.getNombre().isBlank()) {
            // 1. Limpiamos los espacios
            String nombreLimpio = datosNuevos.getNombre().trim();
            
            // 2. Usamos el nuevo método con IgnoreCase
            sectorRepo.findByNombreIgnoreCaseAndActivoTrue(nombreLimpio)
                    .ifPresent(s -> {
                        if (!s.getIdSector().equals(id)) {
                            throw new ManejoErrores(
                                    HttpStatus.BAD_REQUEST, 
                                    "El nombre del sector ya se encuentra registrado por otro sector"
                            );
                        }
                    });
            sectorExistente.setNombre(nombreLimpio);
        }

        return sectorRepo.save(sectorExistente);
    }
}
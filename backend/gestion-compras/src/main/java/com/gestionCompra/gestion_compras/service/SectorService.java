package com.gestionCompra.gestion_compras.service;

import com.gestionCompra.gestion_compras.domain.entidades.GrupoRuta;
import com.gestionCompra.gestion_compras.domain.entidades.Sector;
import com.gestionCompra.gestion_compras.domain.entidades.SectorPermiso;
import com.gestionCompra.gestion_compras.domain.entidades.SectorPermisoId;
import com.gestionCompra.gestion_compras.dto.ManejoErrores;
import com.gestionCompra.gestion_compras.dto.Paginacion;
import com.gestionCompra.gestion_compras.dto.SectorRequest;
import com.gestionCompra.gestion_compras.repository.GrupoRutaRepo;
import com.gestionCompra.gestion_compras.repository.SectorRepo;
import com.gestionCompra.gestion_compras.util.ABMGenerico;
import com.gestionCompra.gestion_compras.util.ABMLogicoGenerico;
import java.util.List;
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

    @Autowired
    private GrupoRutaRepo grupoRutaRepo;

    @Transactional
    public Sector crearSector(SectorRequest request) {
        String nombreLimpio = request.nombre().trim();

        if (sectorRepo.findByNombreIgnoreCaseAndActivoTrue(nombreLimpio).isPresent()) {
            throw new ManejoErrores(HttpStatus.BAD_REQUEST, "El nombre del sector ya se encuentra registrado");
        }

        Sector nuevoSector = new Sector();
        nuevoSector.setNombre(nombreLimpio);
        nuevoSector.setActivo(true);
        Sector guardado = sectorRepo.save(nuevoSector);

        asignarPermisos(guardado, request.permisos());
        return sectorRepo.save(guardado);
    }

    @Transactional
    public Sector modificarSector(Integer id, SectorRequest request) {
        Sector sectorExistente = this.findById(id);

        if (request.nombre() != null && !request.nombre().isBlank()) {
            String nombreLimpio = request.nombre().trim();
            sectorRepo.findByNombreIgnoreCaseAndActivoTrue(nombreLimpio)
                    .ifPresent(s -> {
                        if (!s.getIdSector().equals(id)) {
                            throw new ManejoErrores(HttpStatus.BAD_REQUEST, "El nombre del sector ya se encuentra registrado por otro sector");
                        }
                    });
            sectorExistente.setNombre(nombreLimpio);
        }

        if (request.permisos() != null) {
            sectorExistente.getPermisos().clear();
            asignarPermisos(sectorExistente, request.permisos());
        }

        return sectorRepo.save(sectorExistente);
    }

    private void asignarPermisos(Sector sector, List<String> nombresPermisos) {
        if (nombresPermisos == null) {
            return;
        }
        for (String nombre : nombresPermisos) {
            SectorPermisoId permisoId = new SectorPermisoId(sector.getIdSector(), nombre);
            SectorPermiso permiso = new SectorPermiso();
            permiso.setId(permisoId);
            permiso.setSector(sector);
            sector.getPermisos().add(permiso);
        }
    }

    public List<GrupoRuta> listarGruposRuta() {
        return grupoRutaRepo.findAll();
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

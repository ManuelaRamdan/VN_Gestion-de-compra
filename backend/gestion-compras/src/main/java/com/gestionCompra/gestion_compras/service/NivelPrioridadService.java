package com.gestionCompra.gestion_compras.service;

import com.gestionCompra.gestion_compras.domain.entidades.NivelPrioridad;
import com.gestionCompra.gestion_compras.dto.ManejoErrores;
import com.gestionCompra.gestion_compras.dto.Paginacion;
import com.gestionCompra.gestion_compras.repository.NivelPrioridadRepo;
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
                    "Nivel de prioridad no encontrado o se encuentra inactivo" // Corregido: decía Sector
                ));
    }

    @Override
    public Paginacion<NivelPrioridad> findAll(Pageable pageable) {
        return new Paginacion<>(nivelPrioridadRepo.findByActivoTrue(pageable));
    }

    @Override
    @Transactional
    public void bajaLogica(Integer id) {
        NivelPrioridad nivel = this.findById(id); // Corregido: la variable se llamaba producto
        nivel.setActivo(false);
        nivelPrioridadRepo.save(nivel);
    }

    // --- NUEVA LÓGICA DE VALIDACIÓN ---

    @Transactional
    public NivelPrioridad crearNivelPrioridad(NivelPrioridad nuevoNivel) {
        
        
         String nombreLimpio = nuevoNivel.getCategoria().trim();
        nuevoNivel.setCategoria(nombreLimpio);
        if (nivelPrioridadRepo.findByCategoriaIgnoreCaseAndActivoTrue(nombreLimpio).isPresent()) {
            throw new ManejoErrores(
                    HttpStatus.BAD_REQUEST, 
                    "La categoría del nivel de prioridad ya se encuentra registrada"
            );
        }
        
        nuevoNivel.setActivo(true);
        return nivelPrioridadRepo.save(nuevoNivel);
    }

    @Transactional
    public NivelPrioridad modificarNivelPrioridad(Integer id, NivelPrioridad datosNuevos) {
        NivelPrioridad nivelExistente = this.findById(id);

        // 1. Validar y actualizar la categoría
        if (datosNuevos.getCategoria() != null && !datosNuevos.getCategoria().isBlank()) {
            
            String nombreLimpio = datosNuevos.getCategoria().trim();
            nivelPrioridadRepo.findByCategoriaIgnoreCaseAndActivoTrue(nombreLimpio)
                    .ifPresent(n -> {
                        if (!n.getIdNivelPrioridad().equals(id)) {
                            throw new ManejoErrores(
                                    HttpStatus.BAD_REQUEST, 
                                    "Esta categoría ya se encuentra registrada por otro nivel de prioridad"
                            );
                        }
                    });
            nivelExistente.setCategoria(nombreLimpio);
        }

        // 2. Actualizar los días si vienen en el request
        if (datosNuevos.getDias() != null) {
            nivelExistente.setDias(datosNuevos.getDias());
        }

        return nivelPrioridadRepo.save(nivelExistente);
    }
}
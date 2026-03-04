package com.gestionCompra.gestion_compras.service;

import com.gestionCompra.gestion_compras.domain.entidades.Proveedor;
import com.gestionCompra.gestion_compras.dto.ManejoErrores;
import com.gestionCompra.gestion_compras.dto.Paginacion;
import com.gestionCompra.gestion_compras.repository.ProveedorRepo;
import com.gestionCompra.gestion_compras.util.ABMLogicoGenerico;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProveedorService extends ABMLogicoGenerico<Proveedor, Integer> {

    @Autowired
    private ProveedorRepo proveedorRepo;

    @Override
    protected JpaRepository<Proveedor, Integer> getRepository() {
        return proveedorRepo;
    }

    @Override
    protected String getEntityName() {
        return "Proveedor";
    }
    
    @Override
    public Proveedor findById(Integer id) {
        return proveedorRepo.findByIdAndActivoTrue(id)
                .orElseThrow(() -> new ManejoErrores(
                    HttpStatus.NOT_FOUND, 
                    "Proveedor no encontrado o se encuentra inactivo"
                ));
    }

    @Override
    public Paginacion<Proveedor> findAll(Pageable pageable) {
        return new Paginacion<>(proveedorRepo.findByActivoTrue(pageable));
    }

    @Override
    @Transactional
    public void bajaLogica(Integer id) {
        Proveedor proveedor = this.findById(id); 
        proveedor.setActivo(false);
        proveedorRepo.save(proveedor);
    }
    
   @Transactional
    public Proveedor crearProveedor(Proveedor nuevoProveedor) {
        // 1. Limpiamos y validamos el nombre de la empresa
        String nombreLimpio = nuevoProveedor.getNombreEmpresa().trim();
        nuevoProveedor.setNombreEmpresa(nombreLimpio); 

        if (proveedorRepo.findByNombreEmpresaIgnoreCaseAndActivoTrue(nombreLimpio).isPresent()) {
            throw new ManejoErrores(
                    HttpStatus.BAD_REQUEST, 
                    "El nombre de la empresa proveedora ya se encuentra registrado"
            );
        }
        
        // 2. Validamos el resto de los campos
        validarCamposAdicionales(nuevoProveedor);

        nuevoProveedor.setActivo(true);
        return proveedorRepo.save(nuevoProveedor);
    }

    @Transactional
    public Proveedor modificarProveedor(Integer id, Proveedor datosNuevos) {
        Proveedor proveedorExistente = this.findById(id);

        // 1. Validar y actualizar el nombre de la empresa
        if (datosNuevos.getNombreEmpresa() != null && !datosNuevos.getNombreEmpresa().isBlank()) {
            String nombreLimpio = datosNuevos.getNombreEmpresa().trim();
            
            proveedorRepo.findByNombreEmpresaIgnoreCaseAndActivoTrue(nombreLimpio)
                    .ifPresent(p -> {
                        if (!p.getIdProveedor().equals(id)) {
                            throw new ManejoErrores(
                                    HttpStatus.BAD_REQUEST, 
                                    "El nombre de la empresa proveedora ya se encuentra registrado por otro proveedor"
                            );
                        }
                    });
            proveedorExistente.setNombreEmpresa(nombreLimpio);
        }

        // 2. Actualizar el resto de los campos si vienen en el request
        if (datosNuevos.getNombreContacto() != null) {
            proveedorExistente.setNombreContacto(datosNuevos.getNombreContacto().trim());
        }
        if (datosNuevos.getMail() != null) {
            proveedorExistente.setMail(datosNuevos.getMail().trim());
        }
        if (datosNuevos.getDireccion() != null) {
            proveedorExistente.setDireccion(datosNuevos.getDireccion().trim());
        }
        if (datosNuevos.getTelefono() != null) {
            proveedorExistente.setTelefono(datosNuevos.getTelefono());
        }

        // 3. Validamos que la entidad resultante cumpla las reglas antes de guardar
        validarCamposAdicionales(proveedorExistente);
        
        return proveedorRepo.save(proveedorExistente);
    }

    // --- MÉTODO PRIVADO DE VALIDACIONES ---
    private void validarCamposAdicionales(Proveedor proveedor) {
        // Validación de Mail
        if (proveedor.getMail() != null && !proveedor.getMail().isBlank()) {
            String regexMail = "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$";
            if (!proveedor.getMail().matches(regexMail)) {
                throw new ManejoErrores(HttpStatus.BAD_REQUEST, "El formato del correo electrónico es inválido.");
            }
        }

        // Validación de Dirección ("Calle 123" o "Calle, 123")
        if (proveedor.getDireccion() != null && !proveedor.getDireccion().isBlank()) {
            // Acepta letras, números, puntos (ej. Av.), una coma opcional, un espacio y termina con números
            String regexDireccion = "^[a-zA-ZÀ-ÿ0-9\\s.]+,?\\s\\d+$";
            if (!proveedor.getDireccion().trim().matches(regexDireccion)) {
                throw new ManejoErrores(HttpStatus.BAD_REQUEST, "La dirección debe tener el formato 'Calle Numero' o 'Calle, Numero'.");
            }
        }

        // Validación de Teléfono (Exactamente 10 números)
        // Convertimos el Long a String para poder contar la cantidad de dígitos fácilmente
        if (proveedor.getTelefono() != null) {
            String telefonoStr = String.valueOf(proveedor.getTelefono());
            if (telefonoStr.length() != 10) {
                throw new ManejoErrores(HttpStatus.BAD_REQUEST, "El número de teléfono debe tener exactamente 10 dígitos.");
            }
        }
    }
}
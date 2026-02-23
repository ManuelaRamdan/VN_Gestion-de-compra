package com.gestionCompra.gestion_compras.util;

import com.gestionCompra.gestion_compras.dto.Paginacion;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

public abstract class ABMGenerico<T, ID> {

    protected abstract JpaRepository<T, ID> getRepository();

    protected abstract String getEntityName(); // Para personalizar el error

   
    public T findById(ID id) {
        return getRepository().findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                getEntityName() + " no encontrado/a"));
    }

    @Transactional
    public T crear(T entidad) {
        return getRepository().save(entidad);
    }

    @Transactional
    public T modificar(ID id, T datosNuevos) {
        T entidadExistente = findById(id);
        copyNonNullProperties(datosNuevos, entidadExistente);
        return getRepository().save(entidadExistente);
    }

    // --- Utilidad para copiar solo lo que no es nulo ---
    protected void copyNonNullProperties(Object source, Object target) {
        BeanUtils.copyProperties(source, target, getNullPropertyNames(source));
    }

    private String[] getNullPropertyNames(Object source) {
        final BeanWrapper src = new BeanWrapperImpl(source);
        java.beans.PropertyDescriptor[] pds = src.getPropertyDescriptors();
        Set<String> emptyNames = new HashSet<>();
        for (java.beans.PropertyDescriptor pd : pds) {
            if (src.getPropertyValue(pd.getName()) == null || pd.getName().equals("id")) {
                emptyNames.add(pd.getName());
            }
        }
        return emptyNames.toArray(new String[0]);
    }

    public Paginacion<T> findAll(org.springframework.data.domain.Pageable pageable) {
        // 1. Obtenemos el Page estándar de Spring
        org.springframework.data.domain.Page<T> page = getRepository().findAll(pageable);

        // 2. Lo convertimos a tu record personalizado usando su constructor
        return new Paginacion<>(page);
    }
}

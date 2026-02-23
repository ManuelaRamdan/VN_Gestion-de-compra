/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.util;

import org.springframework.transaction.annotation.Transactional;

public abstract class ABMLogicoGenerico<T extends EntidadBase, ID> extends ABMGenerico<T, ID> {

    @Override
    @Transactional
    public T crear(T entidad) {
        entidad.setActivo(true); // Ahora sí podemos usar setActivo
        return super.crear(entidad);
    }

    @Transactional
    public void bajaLogica(ID id) {
        T entidad = findById(id);
        entidad.setActivo(false);
        getRepository().save(entidad);
    }
}
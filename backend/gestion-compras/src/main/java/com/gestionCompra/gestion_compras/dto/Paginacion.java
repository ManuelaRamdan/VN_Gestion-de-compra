/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.dto;

import java.util.List;
import org.springframework.data.domain.Page;

/**
 *
 * @author Usuario
 */
public record Paginacion<T>(
        List<T> contenido,
        int paginaActual,
        int totalPaginas,
        long totalElementos,
        boolean esUltima) {

    public Paginacion(Page<T> page) {
        this(
            page.getContent(),
            page.getNumber(),
            page.getTotalPages(),
            page.getTotalElements(),
            page.isLast()
        );
    }
    
    public boolean estaVacio() {
        return contenido == null || contenido.isEmpty();
    }
    
    

}

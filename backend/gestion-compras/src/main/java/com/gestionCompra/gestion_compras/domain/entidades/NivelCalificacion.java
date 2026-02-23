/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.domain.entidades;

/**
 *
 * @author Usuario
 */
public enum NivelCalificacion {
    malo(1),
    regular(2),
    bueno(3),
    muybueno(4);

    private final int valor;

    NivelCalificacion(int valor) {
        this.valor = valor;
    }

    public int getValor() {
        return valor;
    }
}

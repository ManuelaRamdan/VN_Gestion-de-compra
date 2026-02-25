package com.gestionCompra.gestion_compras.dto;

public record SolicitudRequest(
        Integer idProducto,
        Integer cantidad,
        Integer idNivelPrioridad,
        String comentarios) {

}

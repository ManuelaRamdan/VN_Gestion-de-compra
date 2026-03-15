package com.gestionCompra.gestion_compras.dto;

import java.time.LocalDateTime;

public record SolicitudRequest(
        Integer idProducto,
        Integer cantidad,
        Integer idNivelPrioridad,
        LocalDateTime fecha,
        String comentarios) {

}

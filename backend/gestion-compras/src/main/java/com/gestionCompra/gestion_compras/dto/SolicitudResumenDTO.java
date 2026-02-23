package com.gestionCompra.gestion_compras.dto;

import com.gestionCompra.gestion_compras.domain.entidades.Solicitud;
import java.util.List;

public record SolicitudResumenDTO(
    List<Solicitud> contenido,
    int paginaActual,
    int totalPaginas,
    long totalElementos,     // Este es tu "total" general
    boolean esUltima,
    long cantidadPendientes, // <--- Campo nuevo
    long cantidadAprobadas   // <--- Campo nuevo
) {
    // Constructor auxiliar para facilitar la creación desde el objeto Paginacion
    public SolicitudResumenDTO(Paginacion<Solicitud> pagina, long pendientes, long aprobadas) {
        this(
            pagina.contenido(),
            pagina.paginaActual(),
            pagina.totalPaginas(),
            pagina.totalElementos(),
            pagina.esUltima(),
            pendientes,
            aprobadas
        );
    }
}
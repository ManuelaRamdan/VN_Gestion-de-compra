// SectorRequest.java
package com.gestionCompra.gestion_compras.dto;

import java.util.List;

public record SectorRequest(
    String nombre,
    List<String> permisos
) {}
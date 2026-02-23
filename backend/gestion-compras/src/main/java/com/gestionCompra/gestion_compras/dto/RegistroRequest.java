package com.gestionCompra.gestion_compras.dto;

public record RegistroRequest(
    String username,
    String password,
    Integer idSector
) {}
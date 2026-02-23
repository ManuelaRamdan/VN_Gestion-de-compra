package com.gestionCompra.gestion_compras.dto;

public class ErrorResponse {

    private String message;
    private int status;
    private long timestamp;

    public ErrorResponse(String message, int status, long timestamp) {
        this.message = message;
        this.status = status;
        this.timestamp = timestamp;
    }

    public String getMessage() {
        return message;
    }

    public int getStatus() {
        return status;
    }

    public long getTimestamp() {
        return timestamp;
    }
}

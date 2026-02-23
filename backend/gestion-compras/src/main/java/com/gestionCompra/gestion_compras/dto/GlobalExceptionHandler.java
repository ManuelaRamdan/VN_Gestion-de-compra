/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.dto;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

/**
 *
 * @author Usuario
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ManejoErrores.class)
    public ResponseEntity<ErrorResponse> handleManejoErrores(ManejoErrores ex) {
        ErrorResponse error = new ErrorResponse(
                ex.getMessage(),
                ex.getStatus().value(),
                System.currentTimeMillis()
        );
        return new ResponseEntity<>(error, ex.getStatus());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<?> handleMaxSizeException(MaxUploadSizeExceededException exc) {
        return ResponseEntity
                .status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(Map.of("error", "El archivo es demasiado grande. El límite permitido es de 500MB."));
    }
}

/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.dto;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

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
}

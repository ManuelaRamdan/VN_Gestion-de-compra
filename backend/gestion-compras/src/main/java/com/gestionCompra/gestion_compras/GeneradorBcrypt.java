/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GeneradorBcrypt {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String passwordPlana = "123"; // La contraseña que quieras
        String passwordEncriptada = encoder.encode(passwordPlana);
        
        System.out.println("Contraseña encriptada para PostgreSQL:");
        System.out.println(passwordEncriptada);
    }
}
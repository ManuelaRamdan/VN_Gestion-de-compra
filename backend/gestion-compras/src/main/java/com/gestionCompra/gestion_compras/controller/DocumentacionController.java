/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.controller;

import com.gestionCompra.gestion_compras.domain.entidades.Solicitud;
import com.gestionCompra.gestion_compras.dto.Paginacion;
import com.gestionCompra.gestion_compras.service.PdfGeneratorService;
import com.gestionCompra.gestion_compras.service.SolicitudService;
import java.time.LocalDate;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author Usuario
 */
@RestController
@RequestMapping("/api/documentacion")
public class DocumentacionController {

    @Autowired
    private SolicitudService solicitudService;

    @Autowired
    private PdfGeneratorService pdfService; // Servicio que crearemos abajo

    // 1. Mostrar todas las operaciones cerradas (Paginado)
    @GetMapping("/cerradas")
    public ResponseEntity<Paginacion<Solicitud>> listarHistorial(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "fecha")
        );
        return ResponseEntity.ok(solicitudService.listarCerradas(pageable));
    }

    // 2. Descargar PDF por ID de Solicitud
    @GetMapping("/descargar/{idCierre}")
    public ResponseEntity<byte[]> descargarPdf(@PathVariable Integer idCierre) throws Exception {

        byte[] pdfBytes = pdfService.generarExpedienteCompleto(idCierre);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "expediente_compra_" + idCierre + ".pdf");

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

    }

    @GetMapping("/descargar-periodo")
    public ResponseEntity<?> descargarPorPeriodo(
            @RequestParam(required = false) Integer anio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        try {
            byte[] zipBytes = pdfService.generarZipExpedientesPorPeriodo(anio, desde, hasta);

            String filename = anio != null
                    ? "expedientes_compras_" + anio + ".zip"
                    : "expedientes_compras_" + desde + "_a_" + hasta + ".zip";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/zip"));
            headers.setContentDispositionFormData("attachment", filename);

            return new ResponseEntity<>(zipBytes, headers, HttpStatus.OK);

        } catch (com.gestionCompra.gestion_compras.dto.ManejoErrores e) {
            return ResponseEntity.status(e.getStatus()).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error inesperado: " + e.getMessage()));
        }
    }
}

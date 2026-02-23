/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.controller;

import com.gestionCompra.gestion_compras.domain.entidades.EvaluacionProveedor;
import com.gestionCompra.gestion_compras.domain.entidades.NivelCalificacion;
import com.gestionCompra.gestion_compras.domain.entidades.Proveedor;
import com.gestionCompra.gestion_compras.domain.entidades.Usuario;
import com.gestionCompra.gestion_compras.dto.Paginacion;
import com.gestionCompra.gestion_compras.repository.EvalProveedorRepo;
import com.gestionCompra.gestion_compras.repository.ProveedorRepo;
import com.gestionCompra.gestion_compras.repository.UsuarioRepo;
import com.gestionCompra.gestion_compras.service.EvaluacionProveedorService;
import com.gestionCompra.gestion_compras.service.PdfGeneratorService;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/evalProveedor")
public class EvaluacionProveedorController {

    @Autowired
    private EvaluacionProveedorService evalProveedorService;

    @Autowired
    private EvalProveedorRepo evalProveedorRepo;
    @Autowired
    private UsuarioRepo usuarioRepo;

    @Autowired
    private ProveedorRepo proveedorRepo;
    
    @Autowired
    private PdfGeneratorService pdfService; 

    @PostMapping("/")
    public ResponseEntity<?> crearEvaluacion(@RequestBody Map<String, Object> request, Authentication authentication) {
        try {
            String[] camposObligatorios = {
                "idProveedor", "servicioProducto", "periodoEvaluado",
                "calidadproducto", "cumplimientoplazos", "atencioncliente",
                "respuestareclamos", "precioservicio", "gestionadministrativa", "proveedorsgc"
            };

            for (String campo : camposObligatorios) {
                if (!request.containsKey(campo) || request.get(campo) == null) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Falta el campo obligatorio: " + campo));
                }
            }

            String username = authentication.getName();
            Usuario usuario = usuarioRepo.findByUsernameAndActivoTrue(username)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            Integer idProv = ((Number) request.get("idProveedor")).intValue();
            Proveedor proveedor = proveedorRepo.findById(idProv)
                    .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));

            EvaluacionProveedor eval = new EvaluacionProveedor();
            eval.setUsuario(usuario);
            eval.setProveedor(proveedor);
            eval.setServicioProducto((String) request.get("servicioProducto"));
            eval.setPeriodoEvaluado(((Number) request.get("periodoEvaluado")).intValue());
            eval.setProveedorSgc((Boolean) request.get("proveedorsgc"));

            eval.setFecha(LocalDateTime.now());

            if (request.containsKey("comentarios")) {
                eval.setComentarios((String) request.get("comentarios"));
            }
            eval.setFirmaResponsable(usuario.getUsername() + " - " + usuario.getSector().getNombre());

            eval.setCalidadproducto(NivelCalificacion.valueOf((String) request.get("calidadproducto")));
            eval.setCumplimientoplazos(NivelCalificacion.valueOf((String) request.get("cumplimientoplazos")));
            eval.setAtencioncliente(NivelCalificacion.valueOf((String) request.get("atencioncliente")));
            eval.setRespuestareclamos(NivelCalificacion.valueOf((String) request.get("respuestareclamos")));
            eval.setPrecioservicio(NivelCalificacion.valueOf((String) request.get("precioservicio")));
            eval.setGestionadministrativa(NivelCalificacion.valueOf((String) request.get("gestionadministrativa")));

            // 5. GUARDAR
            EvaluacionProveedor guardada = evalProveedorService.crear(eval);

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Evaluación creada con éxito",
                    "data", guardada
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Valor de calificación no válido. Use: malo, regular, bueno, muybueno"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/")
    public ResponseEntity<Paginacion<EvaluacionProveedor>> listarTodas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(evalProveedorService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EvaluacionProveedor> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(evalProveedorService.findById(id));
    }

    @GetMapping("/buscar")
    public ResponseEntity<Paginacion<EvaluacionProveedor>> buscarPorProveedor(
            @RequestParam String nombreProveedor,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(evalProveedorService.buscarPorNombreProveedor(pageable, nombreProveedor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> modificar(@PathVariable Integer id, @RequestBody EvaluacionProveedor datos, Authentication authentication) {
        try {

            String username = authentication.getName();
            Usuario usuario = usuarioRepo.findByUsernameAndActivoTrue(username)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            datos.setFecha(LocalDateTime.now());
            datos.setFirmaResponsable(usuario.getUsername() + " - " + usuario.getSector().getNombre());

            EvaluacionProveedor actualizada = evalProveedorService.modificar(id, datos);
            return ResponseEntity.ok(Map.of(
                    "message", "Evaluación actualizada correctamente",
                    "data", actualizada
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/descargar/{idEval}")
public ResponseEntity<byte[]> descargarPdf(@PathVariable Integer idEval) throws Exception {
    byte[] pdfBytes = pdfService.generarEvaluacionProveedorPdf(idEval);

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_PDF);
    headers.setContentDispositionFormData("attachment", "evaluacion_proveedor_" + idEval + ".pdf");

    return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
}

}

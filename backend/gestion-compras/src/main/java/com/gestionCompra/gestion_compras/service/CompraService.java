package com.gestionCompra.gestion_compras.service;

import com.gestionCompra.gestion_compras.domain.entidades.Compra;
import com.gestionCompra.gestion_compras.domain.entidades.AprobacionPresupuesto;
import com.gestionCompra.gestion_compras.dto.ManejoErrores;
import com.gestionCompra.gestion_compras.dto.Paginacion;
import com.gestionCompra.gestion_compras.repository.CompraRepo;
import com.gestionCompra.gestion_compras.repository.AprobacionPresuRepo;
import com.gestionCompra.gestion_compras.repository.UsuarioRepo;
import com.gestionCompra.gestion_compras.util.ABMGenerico;
import com.gestionCompra.gestion_compras.util.ABMLogicoGenerico;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.web.multipart.MultipartFile;
import java.nio.file.*;
import java.io.IOException;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;

@Service
public class CompraService extends ABMGenerico<Compra, Integer> {

    @Autowired
    private CompraRepo compraRepo;

    @Autowired
    private AprobacionPresuRepo aprobacionPresuRepo;

    @Autowired
    private AprobacionPresupuestoService aprobacionPService;

    @Autowired
    private UsuarioRepo usuarioRepo;
    
    @Value("${pdf.storage.path}")
    private String storagePath;

    private Path rootLocation;

    // 2. Inicializamos el Path una vez que se inyecta el valor
    @PostConstruct
    public void init() {
        this.rootLocation = Paths.get(storagePath);
    }

    @Transactional
    public Compra crearCompra(Compra compra) {
        // 1. Validar que la relación no sea nula
        if (compra.getAprobacionPresupuesto() == null || compra.getAprobacionPresupuesto().getId() == null) {
            throw new ManejoErrores(HttpStatus.BAD_REQUEST, "Debe especificar una aprobación de presupuesto válida.");
        }

        Integer idAprob = compra.getAprobacionPresupuesto().getId();

        // 2. Verificar existencia de la aprobación
        AprobacionPresupuesto aprobacion = aprobacionPresuRepo.findById(idAprob)
                .orElseThrow(() -> new ManejoErrores(HttpStatus.NOT_FOUND, "El registro de aprobación ID " + idAprob + " no existe."));

        // 3. REGLA DE NEGOCIO: ¿Ya existe cualquier compra (activa o no) para esta aprobación?
        // Cambiamos existsBy..._IdAndActivoTrue por existsBy..._Id para un 1:1 real
        boolean yaExisteCompra = compraRepo.existsByAprobacionPresupuesto_Id(idAprob);

        if (yaExisteCompra) {
            throw new ManejoErrores(HttpStatus.CONFLICT,
                    "Ya existe un registro de compra para esta aprobación. No se pueden duplicar compras por presupuesto.");
        }

        // 4. Validar estado de la aprobación
        if (!"APROBADA".equalsIgnoreCase(aprobacion.getEstado())) {
            throw new ManejoErrores(HttpStatus.BAD_REQUEST,
                    "No se puede registrar la compra: El presupuesto tiene estado " + aprobacion.getEstado());
        }

        // 5. Valores por defecto
        if (compra.getFechaSolicitud() == null) {
            compra.setFechaSolicitud(LocalDate.now());
        }

        return compraRepo.save(compra);
    }

    @Override
    protected JpaRepository<Compra, Integer> getRepository() {
        return compraRepo;
    }

    @Override
    protected String getEntityName() {
        return "Compra";
    }

    @Transactional
    public Compra modificar(Integer id, Map<String, Object> campos) {
        // 1. Buscamos la compra existente (usando el método de la clase base)
        Compra compra = findById(id);

        // 2. Procesamos la Aprobación de Presupuesto
        if (campos.containsKey("id_aprobacion_presu")) {
            Object valor = campos.get("id_aprobacion_presu");
            if (valor != null) {
                Integer idAprob = ((Number) valor).intValue();
                // Asegúrate de que aprobacionPService esté inyectado con @Autowired
                compra.setAprobacionPresupuesto(aprobacionPresuRepo.findById(idAprob)
                        .orElseThrow(() -> new RuntimeException("Aprobación no encontrada")));
            }
        }

        // 3. Procesamos el Usuario
        if (campos.containsKey("id_usuario")) {
            Object valor = campos.get("id_usuario");
            if (valor != null) {
                Integer idUser = ((Number) valor).intValue();
                // Asegúrate de que usuarioRepo o usuarioService esté disponible
                compra.setUsuario(usuarioRepo.findById(idUser)
                        .orElseThrow(() -> new RuntimeException("Usuario no encontrado")));
            }
        }

        // 4. Procesamos Fechas (LocalDate requiere conversión desde String)
        if (campos.containsKey("fechaRecepcion")) {
            String fechaStr = (String) campos.get("fechaRecepcion");
            compra.setFechaRecepcion(fechaStr != null ? LocalDate.parse(fechaStr) : null);
        }

        if (campos.containsKey("fechaSolicitud")) {
            String fechaStr = (String) campos.get("fechaSolicitud");
            compra.setFechaSolicitud(fechaStr != null ? LocalDate.parse(fechaStr) : null);
        }

        // 5. Procesamos campos de texto (PDF Path)
        if (campos.containsKey("factura_pdf_path")) {
            compra.setFacturaPdfPath((String) campos.get("factura_pdf_path"));
        }


        LocalDate fSol = compra.getFechaSolicitud();
        LocalDate fRec = compra.getFechaRecepcion();

        // Obtenemos la fecha de aprobación (siempre existe porque es obligatoria al crear)
        LocalDate fAprob = compra.getAprobacionPresupuesto().getFecha().toLocalDate();

        // Validación 1: Solicitud vs Aprobación
        if (fSol != null && fSol.isBefore(fAprob)) {
            throw new IllegalArgumentException("La fecha de solicitud (" + fSol + ") no puede ser anterior a la aprobación del presupuesto (" + fAprob + ").");
        }

        // Validación 2: Recepción vs Aprobación
        if (fRec != null && fRec.isBefore(fAprob)) {
            throw new IllegalArgumentException("La fecha de recepción (" + fRec + ") no puede ser anterior a la aprobación del presupuesto (" + fAprob + ").");
        }

        // Validación 3: Solicitud vs Recepción
        if (fSol != null && fRec != null) {
            if (fSol.isAfter(fRec)) {
                throw new IllegalArgumentException("La fecha de solicitud (" + fSol + ") no puede ser posterior a la fecha de recepción (" + fRec + ").");
            }
        }

        // 7. Guardamos los cambios
        return compraRepo.save(compra);
    }

    public List<Compra> listarPorPresu(Integer idAprobPresu) {
        return compraRepo.findByAprobacionPresupuesto_IdAndAprobacionPresupuesto_Presupuesto_AprobacionSolicitud_Solicitud_CerradoFalse(idAprobPresu);
    }

    public Compra buscarCompraById(Integer id) {
        // CORREGIDO: Llamamos a findByIdAndSolicitudAbierta
        return compraRepo.findByIdAndSolicitudAbierta(id).orElseThrow(() -> new ManejoErrores(
                HttpStatus.NOT_FOUND,
                "No se encontró la compra con ID: " + id + " o la solicitud ya está cerrada"
        ));
    }

    public Paginacion<Compra> listarTodo(Pageable pageable) {
        // CORREGIDO: Llamamos a findAbiertas
        Page<Compra> page = compraRepo.findAbiertas(pageable);
        return new Paginacion<>(page);
    }

    public Paginacion<Compra> ListarComprasSinEvalEntrega(Pageable pageable) {
        Page<Compra> page = compraRepo.listarComprasSinEval(pageable);
        return new Paginacion<>(page);
    }

    public String guardarArchivo(MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return null; 
            }

            // Crear directorio si no existe (usando el rootLocation dinámico)
            Files.createDirectories(rootLocation);

            // Generar nombre único
            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();

            // Guardar en disco
            Files.copy(file.getInputStream(), this.rootLocation.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

            return filename; 
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar el archivo: " + e.getMessage());
        }
    }

}

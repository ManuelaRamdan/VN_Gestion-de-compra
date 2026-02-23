package com.gestionCompra.gestion_compras.service;

import com.gestionCompra.gestion_compras.domain.entidades.AprobacionPresupuesto;
import com.gestionCompra.gestion_compras.domain.entidades.AprobacionSolicitud;
import com.gestionCompra.gestion_compras.domain.entidades.Presupuesto;
import com.gestionCompra.gestion_compras.domain.entidades.Solicitud;
import com.gestionCompra.gestion_compras.dto.ManejoErrores;
import com.gestionCompra.gestion_compras.dto.Paginacion;
import com.gestionCompra.gestion_compras.repository.AprobacionPresuRepo;
import com.gestionCompra.gestion_compras.repository.AprobacionSolicitudRepo;
import com.gestionCompra.gestion_compras.repository.PresupuestoRepo;
import com.gestionCompra.gestion_compras.seguridad.UsuarioDetalles;
import com.gestionCompra.gestion_compras.util.ABMGenerico;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.multipart.MultipartFile;
import java.nio.file.*;
import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import jakarta.annotation.PostConstruct;

@Service
public class PresupuestoService extends ABMGenerico<Presupuesto, Integer> {

    @Autowired
    private PresupuestoRepo presupuestoRepo;

    @Autowired
    private AprobacionSolicitudRepo aprobacionSolicitudRepo;

    @Autowired
    private AprobacionPresuRepo aprobacionPresuRepo;

    @Autowired
    private ProveedorService proveedorService;

    @Autowired
    private UsuarioService UsuarioService;
    
    @Value("${pdf.storage.path}")
    private String storagePath;

    private Path rootLocation;

    // 2. Inicializamos el Path una vez que se inyecta el valor
    @PostConstruct
    public void init() {
        this.rootLocation = Paths.get(storagePath);
    }

    @Transactional
    public Presupuesto crearPresupuesto(Presupuesto presupuesto) {
        Integer idSoli = presupuesto.getAprobacionSolicitud().getId();

        // 1. Verificar existencia y ESTADO de la solicitud
        AprobacionSolicitud solicitudDb = aprobacionSolicitudRepo.findById(idSoli)
                .orElseThrow(() -> new RuntimeException("La solicitud de aprobación no existe."));

        // Suponiendo que el estado es un String o un Enum y debe ser "APROBADA"
        if (!"APROBADA".equals(solicitudDb.getEstado())) {
            throw new RuntimeException("No se pueden cargar presupuestos: La solicitud aún no ha sido aprobada por el jefe de sector.");
        }

        // 2. Validar que no exceda los 4 presupuestos
        long cantidadExistente = presupuestoRepo.countByAprobacionSolicitud_Id(idSoli);
        if (cantidadExistente >= 4) {
            throw new RuntimeException("Límite alcanzado: Una solicitud solo puede tener hasta 4 presupuestos.");
        }

        Presupuesto presupuestoGuardado = presupuestoRepo.save(presupuesto);

        // 4. CORRECCIÓN CLAVE: Crear el registro de aprobación en estado PENDIENTE
        // Esto es lo que permite que luego el Gerente pueda "encontrar" el presupuesto para aprobarlo
        AprobacionPresupuesto gestionAprobacion = new AprobacionPresupuesto();
        gestionAprobacion.setPresupuesto(presupuestoGuardado);
        gestionAprobacion.setEstado("PENDIENTE"); // Importante: estado inicial

        // Guardamos en la tabla de aprobaciones
        aprobacionPresuRepo.save(gestionAprobacion);

        return presupuestoGuardado;

    }

    public Paginacion<Presupuesto> listarPorSolicitudAbierta(Integer idAprobSolicitud, Pageable pageable) {
        // El repo devuelve Page<Presupuesto>
        Page<Presupuesto> page = presupuestoRepo
                .findByAprobacionSolicitud_IdAndAprobacionSolicitud_Solicitud_CerradoFalse(idAprobSolicitud, pageable);

        // Convertimos a tu record personalizado
        return new Paginacion<>(page);
    }

    public long contarPresupuestos(Integer idAprobSolicitud) {
        return presupuestoRepo.countByAprobacionSolicitud_Id(idAprobSolicitud);
    }

    @Override
    protected JpaRepository<Presupuesto, Integer> getRepository() {

        return presupuestoRepo;
    }

    @Override
    protected String getEntityName() {
        return "Presupuesto";
    }

    @Transactional
    public Presupuesto modificarPresupuesto(Integer id, Map<String, Object> camposActualizar, String sector) {
        Presupuesto presupuesto = findById(id);

        // 2. --- VALIDACIÓN DE SEGURIDAD ---
        // Buscamos el estado de aprobación de ESTE presupuesto
        AprobacionPresupuesto aprobacion = aprobacionPresuRepo.findByPresupuesto_IdPresupuesto(id)
                .orElseThrow(() -> new ManejoErrores(HttpStatus.NOT_FOUND, "Inconsistencia: El presupuesto no tiene registro de aprobación."));

        // Si NO es PENDIENTE (es decir, es APROBADA o RECHAZADA), prohibimos la edición.
        if (!"PENDIENTE".equalsIgnoreCase(aprobacion.getEstado())) {
            throw new ManejoErrores(HttpStatus.BAD_REQUEST, 
                "BLOQUEO: No se puede editar este presupuesto porque ya fue evaluado por la gerencia. Estado actual: " + aprobacion.getEstado());
        }

        if (camposActualizar.containsKey("id_proveedor")) {
            Object valor = camposActualizar.get("id_proveedor");
            if (valor != null) {
                Integer idProv = ((Number) valor).intValue();
                presupuesto.setProveedor(proveedorService.findById(idProv));
            }
        }

        if (camposActualizar.containsKey("id_usuario") && sector.equals("GERENCIA")) {
            Object valor = camposActualizar.get("id_usuario");
            if (valor != null) {
                Integer idUser = ((Number) valor).intValue();
                presupuesto.setUsuario(UsuarioService.findById(idUser));
            }
        }

        if (camposActualizar.containsKey("cotizacion_satisfactoria")) {
            presupuesto.setCotizacionSatisfactoria((Boolean) camposActualizar.get("cotizacion_satisfactoria"));
        }

        if (camposActualizar.containsKey("observaciones")) {
            presupuesto.setObservaciones((String) camposActualizar.get("observaciones"));
        }

        if (camposActualizar.containsKey("fecha_solicitud")) {
            Object valor = camposActualizar.get("fecha_solicitud");
            if (valor instanceof String) {
                // Convierte el texto "yyyy-MM-dd" a un objeto LocalDate
                presupuesto.setFechaSolicitud(LocalDate.parse((String) valor));
            } else {
                presupuesto.setFechaSolicitud((LocalDate) valor);
            }
        }

        if (camposActualizar.containsKey("fecha_recepcion")) {
            Object valor = camposActualizar.get("fecha_recepcion");
            if (valor instanceof String) {
                presupuesto.setFechaRecepcion(LocalDate.parse((String) valor));
            } else {
                presupuesto.setFechaRecepcion((LocalDate) valor);
            }
        }
        if (camposActualizar.containsKey("archivo_pdf_path")) {
            presupuesto.setArchivoPdfPath((String) camposActualizar.get("archivo_pdf_path"));
        }

        LocalDate fSolicitud = presupuesto.getFechaSolicitud();
        LocalDate fRecepcion = presupuesto.getFechaRecepcion();
        
        

        if (fSolicitud != null && fRecepcion != null) {
            if (fSolicitud.isAfter(fRecepcion)) {
                throw new IllegalArgumentException("Error: La fecha de solicitud (" + fSolicitud + ") no puede ser posterior a la fecha de recepción (" + fRecepcion + ").");
            }
        }

        return presupuestoRepo.save(presupuesto);
    }

    public Presupuesto buscarPresupuestoById(Integer id) {
        return presupuestoRepo.findByIdPresupuestoAndAprobacionSolicitud_Solicitud_CerradoFalse(id).orElseThrow(() -> new ManejoErrores(
                HttpStatus.NOT_FOUND,
                "No se encontró el presupuesto con ID: " + id + " o la solicitud ya está cerrada"
        ));
    }

    public Paginacion<Presupuesto> listarTodo(Pageable pageable) {
        Page<Presupuesto> page = presupuestoRepo.findByAprobacionSolicitud_Solicitud_CerradoFalse(pageable);
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

    public long countByAprobacionSolicitud_Id(Integer idSoli) {
        
        return presupuestoRepo.countByAprobacionSolicitud_Id(idSoli);
    }

    
}

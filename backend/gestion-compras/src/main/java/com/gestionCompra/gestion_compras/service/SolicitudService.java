package com.gestionCompra.gestion_compras.service;

import com.gestionCompra.gestion_compras.domain.entidades.AprobacionSolicitud;
import com.gestionCompra.gestion_compras.domain.entidades.Solicitud;
import com.gestionCompra.gestion_compras.dto.ManejoErrores;
import com.gestionCompra.gestion_compras.dto.Paginacion;
import com.gestionCompra.gestion_compras.repository.AprobacionSolicitudRepo;
import com.gestionCompra.gestion_compras.repository.SolicitudRepo;
import com.gestionCompra.gestion_compras.util.ABMGenerico;
import org.springframework.beans.factory.annotation.Autowired; // Necesario para @Autowired
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpStatus;

@Service
public class SolicitudService extends ABMGenerico<Solicitud, Integer> {

    private final SolicitudRepo solicitudRepository;
    private final AprobacionSolicitudRepo aprobacionSolicitudRepository;

    // Inyectamos los servicios necesarios para buscar entidades por ID en el método modificar
    @Autowired
    private ProductoService productoService;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private NivelPrioridadService nivelPrioridadService;

    public SolicitudService(SolicitudRepo solicitudRepository,
            AprobacionSolicitudRepo aprobacionSolicitudRepository) {
        this.solicitudRepository = solicitudRepository;
        this.aprobacionSolicitudRepository = aprobacionSolicitudRepository;
    }

    @Override
    protected JpaRepository<Solicitud, Integer> getRepository() {
        return solicitudRepository;
    }

    @Override
    protected String getEntityName() {
        return "Solicitud";
    }

    @Transactional
    public Solicitud guardar(Solicitud solicitud) {
        Solicitud solicitudGuardada = solicitudRepository.save(solicitud);
        AprobacionSolicitud aprobacion = new AprobacionSolicitud();
        aprobacion.setSolicitud(solicitudGuardada);
        aprobacion.setEstado("PENDIENTE");
        aprobacion.setFecha(LocalDateTime.now());
        aprobacion.setUsuario(solicitudGuardada.getUsuario());
        aprobacionSolicitudRepository.save(aprobacion);
        return solicitudGuardada;
    }

    public Paginacion<Solicitud> listarPorUsuario(Integer idUsuario, Pageable pageable) {
        Page<Solicitud> page = solicitudRepository.findByUsuario_IdUsuarioAndCerradoFalse(idUsuario, pageable);
        return new Paginacion<>(page);

    }

    public Paginacion<Solicitud> findAllAbiertas(Pageable pageable) {
        Page<Solicitud> page = solicitudRepository.findByCerradoFalse(pageable);
        return new Paginacion<>(page);
    }

    public Paginacion<Solicitud> listarCerradas(Pageable pageable) {
        Page<Solicitud> page = solicitudRepository.findByCerradoTrue(pageable);
        return new Paginacion<>(page);
    }

    @Transactional
    public Solicitud modificar(Integer id, Map<String, Object> camposActualizar) {
        Solicitud solicitud = findById(id);
        if (solicitud.getAprobacion() != null) {
            String estadoAprobacion = solicitud.getAprobacion().getEstado();

            // Si el estado no es PENDIENTE (ej. APROBADA o RECHAZADA), bloqueamos la edición
            if (!"PENDIENTE".equalsIgnoreCase(estadoAprobacion)) {
                throw new ManejoErrores(HttpStatus.BAD_REQUEST,
                        "BLOQUEO: No se puede editar esta solicitud porque ya fue evaluada por la gerencia. Estado actual: " + estadoAprobacion);
            }
        }
        // 1. Procesamos el Producto con conversión segura
        if (camposActualizar.containsKey("id_producto")) {
            // Convertimos el valor a Number y luego sacamos el intValue
            Object valor = camposActualizar.get("id_producto");
            if (valor != null) {
                Integer idProd = ((Number) valor).intValue();
                solicitud.setProducto(productoService.findById(idProd));
            }
        }

        // 2. Procesamos el Nivel de Prioridad con conversión segura
        if (camposActualizar.containsKey("id_nivel_prioridad")) {
            Object valor = camposActualizar.get("id_nivel_prioridad");
            if (valor != null) {
                Integer idPrioridad = ((Number) valor).intValue();
                solicitud.setNivelPrioridad(nivelPrioridadService.findById(idPrioridad));
            }
        }

        // 3. Procesamos Cantidad
        if (camposActualizar.containsKey("cantidad")) {
            Object valor = camposActualizar.get("cantidad");
            if (valor != null) {
                solicitud.setCantidad(((Number) valor).intValue());
            }
        }

        if (camposActualizar.containsKey("id_usuario")) {
            // Convertimos el valor a Number y luego sacamos el intValue
            Object valor = camposActualizar.get("id_usuario");
            if (valor != null) {
                Integer idProd = ((Number) valor).intValue();
                solicitud.setUsuario(usuarioService.findById(idProd));
            }
        }

        if (camposActualizar.containsKey("comentarios")) {
            // Convertimos el valor a Number y luego sacamos el intValue
            Object valor = camposActualizar.get("comentarios");
            if (valor != null) {

                solicitud.setComentarios((String) valor);
            }
        }

        return getRepository().save(solicitud);
    }

    public Solicitud buscarSolicitudbyId(Integer id) {
        return solicitudRepository.findByIdSolicitudAndCerradoFalse(id).orElseThrow(() -> new ManejoErrores(
                HttpStatus.NOT_FOUND,
                "No se encontró la Solicitud con ID: " + id + " o la solicitud ya está cerrada"
        ));
    }

    public long countByUsuarioIdAndAprobacionEstado(Integer idUsuario, String estado) {
        return solicitudRepository.countByUsuario_IdUsuarioAndAprobacion_EstadoAndCerradoFalse(idUsuario, estado);
    }

}

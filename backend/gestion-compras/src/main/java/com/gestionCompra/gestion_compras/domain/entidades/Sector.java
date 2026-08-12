package com.gestionCompra.gestion_compras.domain.entidades;

import com.gestionCompra.gestion_compras.util.EntidadBase;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "sector")
public class Sector implements EntidadBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sector")
    private Integer idSector;

    private String nombre;

    @Column(nullable = false)
    private Boolean activo = true;

    @Override
    public Integer getId() {
        return idSector;
    }

    @Override
    public Boolean getActivo() {
        return this.activo;
    }

    @Override
    public void setActivo(Boolean estado) {
        this.activo = estado;
    }

    // Getters y Setters para 'nombre'
    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Integer getIdSector() {
        return idSector;
    }

    public void setIdSector(Integer idSector) {
        this.idSector = idSector;
    }

    @OneToMany(mappedBy = "sector", fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SectorPermiso> permisos = new ArrayList<>();

    public List<SectorPermiso> getPermisos() {
        return permisos;
    }

    public void setPermisos(List<SectorPermiso> permisos) {
        this.permisos = permisos;
    }

    /**
     * Devuelve los permisos efectivos del sector, ya expandidos: todo permiso
     * "_ADMIN" implica automáticamente el "_VER" del mismo recurso, aunque no
     * se haya asignado explícitamente al crear/editar el sector. Esto evita
     * tener que dar de alta ambos permisos a mano cada vez que se crea un
     * sector nuevo o se le asigna un permiso de administración.
     */
    public List<String> getNombresPermisos() {
        List<String> base = permisos.stream()
                .map(SectorPermiso::getGrupoRuta)
                .collect(Collectors.toList());

        return expandirPermisos(base);
    }

    private static final String SUFIJO_ADMIN = "_ADMIN";
    private static final String SUFIJO_EDITAR = "_EDITAR";
    private static final String SUFIJO_BORRAR = "_BORRAR";
    private static final String SUFIJO_VER = "_VER";
    private static final String SUFIJO_CREAR = "_CREAR";

    private List<String> expandirPermisos(List<String> base) {
        Set<String> efectivos = new LinkedHashSet<>(base);

        for (String permiso : base) {
            if (permiso == null) {
                continue;
            }

            if (permiso.endsWith(SUFIJO_ADMIN)) {
                String recurso = permiso.substring(0, permiso.length() - SUFIJO_ADMIN.length());
                efectivos.add(recurso + SUFIJO_VER);
                efectivos.add(recurso + SUFIJO_EDITAR);
                efectivos.add(recurso + SUFIJO_BORRAR);
                efectivos.add(recurso + SUFIJO_CREAR);
            } else if (permiso.endsWith(SUFIJO_EDITAR)) {
                String recurso = permiso.substring(0, permiso.length() - SUFIJO_EDITAR.length());
                efectivos.add(recurso + SUFIJO_VER);
            } else if (permiso.endsWith(SUFIJO_BORRAR)) {
                String recurso = permiso.substring(0, permiso.length() - SUFIJO_BORRAR.length());
                efectivos.add(recurso + SUFIJO_VER);
            } else if (permiso.endsWith(SUFIJO_CREAR)) {
                String recurso = permiso.substring(0, permiso.length() - SUFIJO_CREAR.length());
                efectivos.add(recurso + SUFIJO_VER);
            }
        }

        if (efectivos.contains("PERM_SOLICITUDES_CREAR")) {
            efectivos.add("PERM_PRODUCTOS_VER");
            efectivos.add("PERM_PRIORIDADES_VER");
        }

        if (efectivos.contains("PERM_APROB_PRESU_GESTIONAR")) {
            efectivos.add("PERM_APROB_PRESU_PENDIENTES_VER");
        }

        if (efectivos.contains("PERM_PRESUPUESTOS_GESTIONAR")) {
            efectivos.add("PERM_APROB_SOLI_ACEPTADAS_VER");
        }

        if (efectivos.contains("PERM_COMPRAS_GESTIONAR")) {
            efectivos.add("PERM_APROB_PRESU_EVALUADAS_VER");
        }

        if (efectivos.contains("PERM_EVAL_ENTREGA_EDITAR")) {
            efectivos.add("PERM_COMPRAS_VER");
            efectivos.add("PERM_RECLAMOS");
        }

        if (efectivos.contains("PERM_EVAL_PROVEEDOR_EDITAR")) {
            efectivos.add("PERM_PROVEEDORES_VER");
        }

        return new ArrayList<>(efectivos);
    }
}

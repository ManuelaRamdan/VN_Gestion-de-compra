package com.gestionCompra.gestion_compras.domain.entidades;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class SectorPermisoId implements Serializable {

    private Integer idSector;
    private String grupoRuta;

    public SectorPermisoId() {}
    public SectorPermisoId(Integer idSector, String grupoRuta) {
        this.idSector = idSector;
        this.grupoRuta = grupoRuta;
    }

    public Integer getIdSector() { return idSector; }
    public void setIdSector(Integer idSector) { this.idSector = idSector; }
    public String getGrupoRuta() { return grupoRuta; }
    public void setGrupoRuta(String grupoRuta) { this.grupoRuta = grupoRuta; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SectorPermisoId)) return false;
        SectorPermisoId that = (SectorPermisoId) o;
        return Objects.equals(idSector, that.idSector) && Objects.equals(grupoRuta, that.grupoRuta);
    }

    @Override
    public int hashCode() { return Objects.hash(idSector, grupoRuta); }
}
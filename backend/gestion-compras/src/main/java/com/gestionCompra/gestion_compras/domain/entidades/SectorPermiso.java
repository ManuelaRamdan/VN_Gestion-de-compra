package com.gestionCompra.gestion_compras.domain.entidades;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "sector_permiso")
public class SectorPermiso {

    @EmbeddedId
    private SectorPermisoId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idSector")
    @JoinColumn(name = "id_sector")
    @JsonIgnore
    private Sector sector;

    public SectorPermisoId getId() {
        return id;
    }

    public void setId(SectorPermisoId id) {
        this.id = id;
    }

    public Sector getSector() {
        return sector;
    }

    public void setSector(Sector sector) {
        this.sector = sector;
    }

    public String getGrupoRuta() {
        return id != null ? id.getGrupoRuta() : null;
    }
}

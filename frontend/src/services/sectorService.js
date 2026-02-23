import api from "./api";

export const listarSectoresPaginados = async (page = 0, size = 10) => {
    return await api.get(`/api/sectores/listar`, { params: { page, size } });
};

export const crearSector = async (data) => {
    return await api.post(`/api/sectores/`, data);
};

export const modificarSector = async (idSector, data) => {
    return await api.put(`/api/sectores/${idSector}`, data);
};

export const darDeBajaSector = async (idSector) => {
    return await api.patch(`/api/sectores/${idSector}`);
};
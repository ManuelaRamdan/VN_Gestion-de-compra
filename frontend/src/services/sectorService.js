import api from "./api";

export const listarSectoresPaginados = async (page = 0, size = 10) => {
    return await api.get(`/api/sectores/listar`, { params: { page, size } });
};

export const crearSector = (data) =>
    api.post('/api/sectores/', data);

export const modificarSector = (id, data) =>
    api.put(`/api/sectores/${id}`, data);

export const darDeBajaSector = async (idSector) => {
    return await api.patch(`/api/sectores/${idSector}`);
};

export const obtenerPermisosDisponibles = () =>
    api.get('/api/sectores/permisos');
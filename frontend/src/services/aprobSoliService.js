// src/services/aprobacionesService.j
import api from "./api";


export const listarAprobacionesSoli = async (estado='PENDIENTE',page = 0, size = 10) => {
    const response = await api.get(`/api/aprobaciones/solicitudes`, {
        params: { estado: estado, page, size }
    });
    return response.data;
};

export const decidirAprobacionSoli = async (idSolicitud, decision) => {
    const response = await api.post(`/api/aprobaciones/solicitudes/${idSolicitud}`, {
        estado: decision
    });
    return response.data;
};

export const modificarSolicitud = async (idSolicitud, datos) => {
    return await api.put(`/api/solicitudes/${idSolicitud}`, datos);
};
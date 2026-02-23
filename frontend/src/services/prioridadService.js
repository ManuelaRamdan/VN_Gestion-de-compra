import api from "./api"; 

export const listarPrioridadesPaginadas = async (page = 0, size = 10) => {
    return await api.get(`/api/prioridades/listar`, { params: { page, size } });
};

export const crearPrioridad = async (data) => {
    return await api.post(`/api/prioridades/`, data);
};

export const modificarPrioridad = async (idNivelPrioridad, data) => {
    return await api.put(`/api/prioridades/${idNivelPrioridad}`, data);
};

export const darDeBajaPrioridad = async (idNivelPrioridad) => {
    return await api.patch(`/api/prioridades/${idNivelPrioridad}`);
};
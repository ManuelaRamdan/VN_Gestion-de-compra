import api from "./api";

export const listarAprobacionesPresupuesto = async (estado = 'PENDIENTE', page = 0, size = 10) => {
    // El interceptor de api.js le pondrá el token automáticamente
    return await api.get(`/api/aprobaciones/presupuestos`, {
        params: { estado, page, size }
    });
};

export const decidirAprobacionPresupuesto = async (idPresupuesto, estado) => {
    // Quitamos por completo la configuración de headers, api.js se encarga
    return await api.post(`/api/aprobaciones/presupuestos/${idPresupuesto}`, { estado });
};
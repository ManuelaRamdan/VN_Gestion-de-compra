import api from "./api";


export const listarAprobacionesPorEstado = async (page = 0, size = 10) => {
    return api.get(`/api/aprobaciones/solicitudes/aprobadas?page=${page}&size=${size}`);
};

export const listarPresupuestosPorAprobacion = async (idAprobSolicitud) => {
    return api.get(`/api/presupuestos/solicitud/${idAprobSolicitud}`);
};


export const guardarPresupuesto = async (idAprobSolicitud, formData) => {
    // Nota: Al pasar FormData, axios detecta automáticamente el header 'multipart/form-data'
    return api.post(`/api/presupuestos/solicitud/${idAprobSolicitud}`, formData);
};


export const listarProveedores = async () => {
    return api.get("/api/proveedores/listar");
};

export const actualizarPresupuesto = async (idPresupuesto, formData) => {
    // Usamos PATCH como definiste en tu Controller
    return api.patch(`/api/presupuestos/${idPresupuesto}`, formData);
};

export const obtenerUrlPdf = async (nombreArchivo) => {
    // 1. Hacemos la petición con Axios (que inyecta el token automáticamente)
    const response = await api.get(`/api/uploads/${nombreArchivo}`, {
        responseType: 'blob' // Importante: Decimos que esperamos un archivo binario
    });

    // 2. Creamos una URL local temporal para ese archivo descargado
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const objectUrl = window.URL.createObjectURL(blob);
    
    return objectUrl;
};
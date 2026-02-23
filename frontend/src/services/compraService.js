import api from "./api";

export const listarPresupuestosPorAprobacion = async (idAprob) => {
    return api.get(`/api/compras/presupuesto/${idAprob}`);
};
export const ListarAprobPresupuestoAprobadas = async (page = 0, size = 10) => {
    return api.get(`/api/aprobaciones/presupuestos/aprobadas?page=${page}&size=${size}`);
};


export const crearCompra = async (formData) => {
    // Nota: Al pasar FormData, axios detecta automáticamente el header 'multipart/form-data'
    return api.post(`/api/compras/`, formData);
};


export const listarProveedores = async () => {
    return api.get("/api/proveedores/listar");
};

export const actualizarCompra = async (id, formData) => {
    // Usamos PATCH como definiste en tu Controller
    return api.put(`/api/compras/${id}`, formData);
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
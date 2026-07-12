import api from "./api";


export const crearEvaluacion = async (data) => {
    return api.post("/api/evalProveedor/", data);
};

export const listarTodas = async () => {
    return api.get("/api/evalProveedor/");
};


export const obtenerPorId = async (id) => {
    return api.get(`/api/evalProveedor/${id}`);
};

export const buscarPorProveedor = async (nombreProveedor) => {
    return api.get(`/api/evalProveedor/buscar`, {
        params: { nombreProveedor }
    });
};


export const modificarEvaluacionProveedor = (id, data) =>
    api.put(`/api/evalProveedor/${id}`, data);


export const listarProveedores = async (page = 0, size = 10) => {
    return api.get(`/api/proveedores/listar?page=${page}&size=${size}`);
};

export const descargarEvaluacionPdf = async (idEval) => {
    const response = await api.get(`/api/evalProveedor/descargar/${idEval}`, {
        responseType: 'blob'
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `evaluacion_proveedor_${idEval}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
};

export const tieneEvaluacionesProveedor = (idProveedor) =>
    api.get(`/api/evalProveedor/existe/${idProveedor}`);


export const descargarEvaluacionesPorPeriodo = async ({ anio, desde, hasta } = {}) => {
    const params = anio ? { anio } : { desde, hasta };

    const response = await api.get(`/api/evalProveedor/descargar-periodo`, {
        params,
        responseType: 'blob'
    });

    const nombreArchivo = anio
        ? `evaluaciones_proveedores_${anio}.zip`
        : `evaluaciones_proveedores_${desde}_a_${hasta}.zip`;

    const blob = new Blob([response.data], { type: 'application/zip' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', nombreArchivo);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};
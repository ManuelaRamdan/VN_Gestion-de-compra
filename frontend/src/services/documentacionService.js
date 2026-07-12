// src/services/documentacionService.js
import api from "./api";

// 1. Listar solicitudes que ya pasaron por el Cierre Administrativo
export const listarcierres = async (page = 0, size = 10) => {
    return api.get(`/api/cierres/?page=${page}&size=${size}`);
};

// 2. Descargar el PDF del expediente completo
export const descargarExpedientePdf = async (idCierre, idSolicitud) => {
    try {
        const response = await api.get(`/api/documentacion/descargar/${idCierre}`, {
            responseType: 'blob', // Vital para manejar archivos binarios
        });

        // Crear un link temporal para disparar la descarga en el navegador
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Expediente_Compra_${idSolicitud}.pdf`);
        document.body.appendChild(link);
        link.click();
        
        // Limpieza
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error al descargar el PDF", error);
        throw error;
    }
};

export const descargarExpedientesPorPeriodo = async ({ anio, desde, hasta } = {}) => {
    const params = anio ? { anio } : { desde, hasta };

    const response = await api.get(`/api/documentacion/descargar-periodo`, {
        params,
        responseType: 'blob'
    });

    const nombreArchivo = anio
        ? `expedientes_compras_${anio}.zip`
        : `expedientes_compras_${desde}_a_${hasta}.zip`;

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
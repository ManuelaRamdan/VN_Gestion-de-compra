import api from "./api";


// ===============================
// LISTAR TODOS LOS CIERRES (Con paginación)
// ===============================
export const listarCierres = async (page = 0, size = 10) => {
    return api.get(`/api/cierres/?page=${page}&size=${size}`);
};

// ===============================
// BUSCAR CIERRE POR ID
// ===============================
export const buscarCierrePorId = async (id) => {
    return api.get(`/api/cierres/${id}`);
};

// ===============================
// BUSCAR CIERRE POR ID DE EVALUACIÓN
// (Asegúrate de haber agregado este endpoint en tu CierreController como vimos en el paso anterior)
// ===============================
export const buscarCierrePorEvaluacion = async (idEval) => {
    return api.get(`/api/cierres/evaluacion/${idEval}`);
};

// ===============================
// CREAR CIERRE (Alta)
// ===============================
export const crearCierre = async (data) => {
    // data debe ser un objeto: { idEvalEntrega: 1, observaciones: "..." }
    return api.post("/api/cierres/", data);
};

// ===============================
// MODIFICAR CIERRE
// ===============================
export const modificarCierre = async (idCierre, data) => {
    // data debe ser el objeto con las observaciones a actualizar
    return api.put(`/api/cierres/${idCierre}`, data);
};
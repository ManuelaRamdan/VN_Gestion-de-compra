import api from "./api";

// ===============================
// LISTAR TODAS
// ===============================
export const listarEvaluaciones = async () => {
    return api.get("/api/evalEntrega/");
};

// ===============================
// CREAR
// ===============================
export const crearEvaluacion = async (data) => {
    return api.post("/api/evalEntrega/", data);
};

// ===============================
// MODIFICAR
// ===============================
export const modificarEvaluacion = async (id, data) => {
    return api.put(`/api/evalEntrega/${id}`, data);
};

// ===============================
// BUSCAR POR ID
// ===============================
export const buscarEvaluacionPorId = async (id) => {
    return api.get(`/api/evalEntrega/${id}`);
};

export const listarCompra = async (page = 0, size = 10) => {
    return api.get(`/api/compras/?page=${page}&size=${size}`);
};

// ===============================
// BUSCAR POR ID DE COMPRA
// ===============================
export const buscarEvaluacionPorCompra = async (idCompra) => {
    return api.get(`/api/evalEntrega/compra/${idCompra}`);
};

export const getReclamoPorEvaluacion = (idEval) =>
    api.get(`/api/reclamos/evaluacion/${idEval}`);

export const crearReclamo = (data) =>
    api.post("/api/reclamos/", data);

export const modificarReclamo = (id, data) =>
    api.put(`/api/reclamos/${id}`, data);

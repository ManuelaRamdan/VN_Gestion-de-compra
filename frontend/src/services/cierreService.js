import api from "./api";


export const listarEvaluaciones = async (page = 0, size = 10) => {
    return api.get(`/api/evalEntrega/sinCierre?page=${page}&size=${size}`);
};
export const listarCierres = async (page = 0, size = 10) => {
    return api.get(`/api/cierres/?page=${page}&size=${size}`);
};


export const buscarCierrePorId = async (id) => {
    return api.get(`/api/cierres/${id}`);
};


export const buscarCierrePorEvaluacion = async (idEval) => {
    return api.get(`/api/cierres/evaluacion/${idEval}`);
};


export const crearCierre = async (data) => {
    // data debe ser un objeto: { idEvalEntrega: 1, observaciones: "..." }
    return api.post("/api/cierres/", data);
};

export const modificarCierre = async (idCierre, data) => {
    // data debe ser el objeto con las observaciones a actualizar
    return api.put(`/api/cierres/${idCierre}`, data);
};
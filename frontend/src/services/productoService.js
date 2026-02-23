import api from "./api"; // Asumiendo que usas una instancia configurada de axios

export const listarProductosPaginados = async (page = 0, size = 10) => {
    return await api.get(`/api/productos/listar`, { params: { page, size } });
};

export const crearProducto = async (data) => {
    return await api.post(`/api/productos/`, data);
};

export const modificarProducto = async (idProducto, data) => {
    return await api.put(`/api/productos/${idProducto}`, data);
};

export const darDeBajaProducto = async (idProducto) => {
    return await api.patch(`/api/productos/${idProducto}`);
};
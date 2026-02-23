import React, { useEffect, useState } from 'react';
import Layout from '../../../components/Layout';
import TablaProducto from '../../../components/producto/TablaProducto';
import { listarProductosPaginados, darDeBajaProducto, modificarProducto, crearProducto } from '../../../services/productoService';
// Usamos Package para representar Productos
import { Plus, Package, AlertCircle, Check, X, AlertTriangle } from 'lucide-react';

export default function ProductoPage() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Alertas
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Modal unificado (Crear / Editar)
    const [showModal, setShowModal] = useState(false); 
    const [modalError, setModalError] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ nombre: "" });

    // Estado para el modal de confirmación de baja
    const [productoToDeactivate, setProductoToDeactivate] = useState(null);

    const cargarProductos = async (pageToLoad = 0, append = false) => {
        try {
            if (pageToLoad === 0) setLoading(true);
            else setIsLoadingMore(true);

            const res = await listarProductosPaginados(pageToLoad, size);
            const data = res.data?.contenido || [];
            const totalPages = res.data?.totalPaginas;

            setProductos(prev => append ? [...prev, ...data] : data);
            setHasMore(pageToLoad + 1 < totalPages);
            setPage(pageToLoad);
        } catch (err) {
            setError("Error al cargar el catálogo de productos.");
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        cargarProductos(0, false);
    }, []);

    const handleLoadMore = () => {
        if (!hasMore) return;
        cargarProductos(page + 1, true);
    };

    // --- LÓGICA DE BAJA ---
    const handleDeactivateClick = (idProducto) => {
        setProductoToDeactivate(idProducto);
    };

    const confirmDeactivate = async () => {
        if (!productoToDeactivate) return;
        
        try {
            await darDeBajaProducto(productoToDeactivate);
            setSuccess("Producto dado de baja exitosamente.");
            cargarProductos(0, false);
            setProductoToDeactivate(null); // Cerramos el modal
            setTimeout(() => setSuccess(""), 3500);
        } catch (err) {
            setError(err.response?.data?.error || "Error al dar de baja el producto.");
            setProductoToDeactivate(null); // Cerramos el modal
        }
    };

    // --- ACCIONES PARA ABRIR EL MODAL DE CREAR/EDITAR ---
    const handleNuevoClick = () => {
        setEditingId(null); 
        setFormData({ nombre: "" }); 
        setModalError("");
        setShowModal(true);
    };

    const handleEditClick = (producto) => {
        setEditingId(producto.idProducto); 
        setFormData({ nombre: producto.nombre }); 
        setModalError("");
        setShowModal(true);
    };

    // --- GUARDADO UNIFICADO ---
    const handleGuardar = async (e) => {
        e.preventDefault();
        setModalError("");
        try {
            if (editingId) {
                await modificarProducto(editingId, formData);
                setSuccess("Producto actualizado correctamente.");
            } else {
                await crearProducto(formData);
                setSuccess("Producto registrado correctamente.");
            }
            
            setShowModal(false);
            cargarProductos(0, false); 
            setTimeout(() => setSuccess(""), 3500);
        } catch (err) {
            setModalError(err.response?.data?.error || "Error al guardar el producto.");
        }
    };

    return (
        <Layout>
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Gestión de Productos</h1>
                    <p className="text-sm text-gray-500">Administre el catálogo de insumos y productos.</p>
                </div>
                <button
                    onClick={handleNuevoClick} 
                    className="bg-[#1C5B5A] hover:bg-[#164a49] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus size={18} /> Nuevo Producto
                </button>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-200 animate-in fade-in">
                    <AlertCircle size={16} /> {error}
                    <button onClick={() => setError("")} className="ml-auto hover:text-red-800"><X size={14} /></button>
                </div>
            )}

            {success && (
                <div className="mb-6 bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm flex items-center gap-2 border border-emerald-200 animate-in fade-in slide-in-from-top-2">
                    <Check size={16} /> <span className="font-medium">{success}</span>
                    <button onClick={() => setSuccess("")} className="ml-auto hover:text-emerald-900"><X size={14} /></button>
                </div>
            )}

            {!loading && productos.length > 0 ? (
                <TablaProducto
                    productos={productos}
                    onEdit={handleEditClick}
                    onDeactivate={handleDeactivateClick}
                    onLoadMore={handleLoadMore}
                    hasMore={hasMore}
                    isLoadingMore={isLoadingMore}
                />
            ) : !loading && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-20 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Package className="text-slate-300" size={30} />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">Sin productos registrados</h3>
                </div>
            )}

            {/* --- Modal Unificado de Edición / Creación --- */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="bg-[#1C5B5A] px-6 py-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">{editingId ? "Modificar Producto" : "Nuevo Producto"}</h3>
                            <button onClick={() => setShowModal(false)}><X size={20} className="hover:text-emerald-200" /></button>
                        </div>

                        <form onSubmit={handleGuardar} className="p-6 space-y-4">
                            {modalError && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-200">
                                    <AlertCircle size={16} /> {modalError}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del Producto</label>
                                <input
                                    type="text" required
                                    placeholder="ej. Resma de papel A4"
                                    className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-emerald-500"
                                    value={formData.nombre}
                                    onChange={e => setFormData({ nombre: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50">Cancelar</button>
                                <button type="submit" className="flex-1 py-2.5 bg-[#1C5B5A] text-white rounded-lg text-sm font-medium hover:bg-[#164a49] shadow-md transition-all">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- Modal de Confirmación de Baja --- */}
            {productoToDeactivate && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={30} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-800 mb-2">¿Dar de baja producto?</h3>
                        <p className="text-sm text-gray-500 mb-6">Esta acción cambiará el estado del producto a inactivo. Ya no estará disponible para nuevas solicitudes.</p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setProductoToDeactivate(null)} 
                                className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={confirmDeactivate} 
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 shadow-md transition-all"
                            >
                                Sí, dar de baja
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
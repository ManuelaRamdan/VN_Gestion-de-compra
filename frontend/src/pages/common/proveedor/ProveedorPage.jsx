import React, { useEffect, useState } from 'react';
import Layout from '../../../components/Layout';
import TablaProveedor from '../../../components/proveedor/TablaGestionProveedor';
import { listarProveedoresPaginados, darDeBajaProveedor, modificarProveedor, crearProveedor } from '../../../services/proveedorService';
// Usamos Truck (camión) para representar Proveedores
import { Plus, Truck, AlertCircle, Check, X, AlertTriangle } from 'lucide-react';

export default function ProveedorPage() {
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Alertas
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Modal de Edición / Creación
    const [showModal, setShowModal] = useState(false);
    const [modalError, setModalError] = useState("");
    const [editingId, setEditingId] = useState(null);
    
    // Objeto inicial para el formulario
    const initialForm = {
        nombreEmpresa: "",
        nombreContacto: "",
        mail: "",
        direccion: "",
        telefono: ""
    };
    const [formData, setFormData] = useState(initialForm);

    // Modal de confirmación de baja
    const [proveedorToDeactivate, setProveedorToDeactivate] = useState(null);

    const cargarProveedores = async (pageToLoad = 0, append = false) => {
        try {
            if (pageToLoad === 0) setLoading(true);
            else setIsLoadingMore(true);

            const res = await listarProveedoresPaginados(pageToLoad, size);
            const data = res.data?.contenido || [];
            const totalPages = res.data?.totalPaginas;

            setProveedores(prev => append ? [...prev, ...data] : data);
            setHasMore(pageToLoad + 1 < totalPages);
            setPage(pageToLoad);
        } catch (err) {
            setError("Error al cargar la lista de proveedores.");
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        cargarProveedores(0, false);
    }, []);

    const handleLoadMore = () => {
        if (!hasMore) return;
        cargarProveedores(page + 1, true);
    };

    // --- LÓGICA DE BAJA ---
    const handleDeactivateClick = (idProveedor) => {
        setProveedorToDeactivate(idProveedor);
    };

    const confirmDeactivate = async () => {
        if (!proveedorToDeactivate) return;
        
        try {
            await darDeBajaProveedor(proveedorToDeactivate);
            setSuccess("Proveedor dado de baja exitosamente.");
            cargarProveedores(0, false);
            setProveedorToDeactivate(null);
            setTimeout(() => setSuccess(""), 3500);
        } catch (err) {
            setError(err.response?.data?.error || "Error al dar de baja el proveedor.");
            setProveedorToDeactivate(null);
        }
    };

    // --- ACCIONES PARA ABRIR MODAL CREAR/EDITAR ---
    const handleNuevoClick = () => {
        setEditingId(null);
        setFormData(initialForm);
        setModalError("");
        setShowModal(true);
    };

    const handleEditClick = (proveedor) => {
        setEditingId(proveedor.idProveedor);
        setFormData({
            nombreEmpresa: proveedor.nombreEmpresa || "",
            nombreContacto: proveedor.nombreContacto || "",
            mail: proveedor.mail || "",
            direccion: proveedor.direccion || "",
            telefono: proveedor.telefono || ""
        });
        setModalError("");
        setShowModal(true);
    };

    // --- GUARDADO UNIFICADO ---
    const handleGuardar = async (e) => {
        e.preventDefault();
        setModalError("");
        try {
            // Convertimos el teléfono a un número antes de enviar si no está vacío
            const dataToSend = {
                ...formData,
                telefono: formData.telefono ? Number(formData.telefono) : null
            };

            if (editingId) {
                await modificarProveedor(editingId, dataToSend);
                setSuccess("Proveedor actualizado correctamente.");
            } else {
                await crearProveedor(dataToSend);
                setSuccess("Proveedor registrado correctamente.");
            }
            
            setShowModal(false);
            cargarProveedores(0, false);
            setTimeout(() => setSuccess(""), 3500);
        } catch (err) {
            setModalError(err.response?.data?.error || "Error al guardar el proveedor.");
        }
    };

    return (
        <Layout>
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Gestión de Proveedores</h1>
                    <p className="text-sm text-gray-500">Administre el directorio de empresas proveedoras.</p>
                </div>
                <button
                    onClick={handleNuevoClick}
                    className="bg-[#1C5B5A] hover:bg-[#164a49] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
                >
                    <Plus size={18} /> Nuevo Proveedor
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

            {!loading && proveedores.length > 0 ? (
                <TablaProveedor
                    proveedores={proveedores}
                    onEdit={handleEditClick}
                    onDeactivate={handleDeactivateClick}
                    onLoadMore={handleLoadMore}
                    hasMore={hasMore}
                    isLoadingMore={isLoadingMore}
                />
            ) : !loading && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-20 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Truck className="text-slate-300" size={30} />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">Sin proveedores registrados</h3>
                </div>
            )}

            {/* --- Modal Unificado de Edición / Creación --- */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="bg-[#1C5B5A] px-6 py-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">{editingId ? "Modificar Proveedor" : "Nuevo Proveedor"}</h3>
                            <button onClick={() => setShowModal(false)}><X size={20} className="hover:text-emerald-200" /></button>
                        </div>

                        <form onSubmit={handleGuardar} className="p-6 space-y-4">
                            {modalError && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-200">
                                    <AlertCircle size={16} /> {modalError}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre de la Empresa *</label>
                                    <input
                                        type="text" required
                                        placeholder="ej. Distribuidora del Sol S.A."
                                        className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-emerald-500"
                                        value={formData.nombreEmpresa}
                                        onChange={e => setFormData({ ...formData, nombreEmpresa: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre de Contacto</label>
                                    <input
                                        type="text" 
                                        placeholder="ej. Juan Pérez"
                                        className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-emerald-500"
                                        value={formData.nombreContacto}
                                        onChange={e => setFormData({ ...formData, nombreContacto: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Correo Electrónico</label>
                                    <input
                                        type="email" 
                                        placeholder="ej. ventas@distribuidora.com"
                                        className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-emerald-500"
                                        value={formData.mail}
                                        onChange={e => setFormData({ ...formData, mail: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Teléfono (Solo números)</label>
                                    <input
                                        type="number" 
                                        placeholder="ej. 1144556677"
                                        className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-emerald-500"
                                        value={formData.telefono}
                                        onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dirección</label>
                                    <input
                                        type="text" 
                                        placeholder="ej. Av. Siempreviva 742, Springfield"
                                        className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-emerald-500"
                                        value={formData.direccion}
                                        onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50">Cancelar</button>
                                <button type="submit" className="flex-1 py-2.5 bg-[#1C5B5A] text-white rounded-lg text-sm font-medium hover:bg-[#164a49] shadow-md transition-all">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- Modal de Confirmación de Baja --- */}
            {proveedorToDeactivate && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={30} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-800 mb-2">¿Dar de baja proveedor?</h3>
                        <p className="text-sm text-gray-500 mb-6">Esta acción cambiará el estado del proveedor a inactivo. Ya no podrá ser seleccionado en nuevos presupuestos.</p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setProveedorToDeactivate(null)} 
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
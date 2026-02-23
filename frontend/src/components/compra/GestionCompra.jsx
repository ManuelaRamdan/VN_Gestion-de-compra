import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus, FileText, Calendar, UploadCloud, Pencil, X, Trash2, AlertCircle, Check, Lock } from 'lucide-react'; // Importar Lock
import {
    listarPresupuestosPorAprobacion,
    crearCompra,
    actualizarCompra,
    obtenerUrlPdf
} from '../../services/compraService';
import Loading from '../Loading';

export default function GestionCompra({ aprobacion, onBack }) {
    const [compras, setCompras] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Estados del Modal
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    
    // Estados del Archivo
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    // Estados de Feedback
    const [error, setError] = useState(""); 
    const [success, setSuccess] = useState(""); 
    const [modalError, setModalError] = useState(""); 

    const initialForm = {
        fechaSolicitud: new Date().toISOString().split('T')[0],
        fechaRecepcion: "",
    };

    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        cargarDatos();
    }, [aprobacion]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const idAprob = aprobacion.id || aprobacion.idAprobacionPresupuesto;
            
            const res = await listarPresupuestosPorAprobacion(idAprob); 
            const data = res.data?.contenido || res.data || [];
            
            setCompras(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error cargando compras:", error);
            setError("No se pudo cargar el historial de compras.");
        } finally {
            setLoading(false);
        }
    };

    // --- MANEJO DE ARCHIVOS ---
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => { setIsDragging(false); };
    const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); validarYSetearArchivo(e.dataTransfer.files[0]); };
    const handleFileSelect = (e) => { validarYSetearArchivo(e.target.files[0]); };
    
    const validarYSetearArchivo = (archivo) => { 
        if (archivo && archivo.type === "application/pdf") {
            setFile(archivo);
            setModalError(""); 
        } else {
            setModalError("Solo se permiten archivos PDF (Facturas).");
        }
    };
    const removeFile = () => { setFile(null); };

    const handleVerPdf = async (nombreArchivo) => {
        setError("");
        try {
            const urlLocal = await obtenerUrlPdf(nombreArchivo);
            window.open(urlLocal, '_blank');
        } catch (error) {
            setError("No se pudo abrir el archivo. Verifique permisos o conexión.");
        }
    };

    // --- GESTIÓN DEL MODAL ---
    const limpiarMensajes = () => {
        setModalError("");
    };

    const handleNuevo = () => {
        setEditingId(null);
        setFile(null);
        setFormData(initialForm);
        limpiarMensajes();
        setShowModal(true);
    };

    const handleEditar = (compra) => {
        // Bloqueo preventivo en Front
        if (compra.evaluada) return;

        setEditingId(compra.idCompra);
        setFile(null);
        setFormData({
            fechaSolicitud: compra.fechaSolicitud || "",
            fechaRecepcion: compra.fechaRecepcion || ""
        });
        limpiarMensajes();
        setShowModal(true);
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        setModalError("");

        try {
            const dataToSend = new FormData();
            if (!editingId) {
                dataToSend.append("idAprobacionPresu", aprobacion.id);
            }
            
            dataToSend.append("fechaSolicitud", formData.fechaSolicitud);
            dataToSend.append("fechaRecepcion", formData.fechaRecepcion);

            if (file) {
                dataToSend.append("file", file);
            }

            if (editingId) {
                await actualizarCompra(editingId, dataToSend);
            } else {
                await crearCompra(dataToSend);
            }

            setShowModal(false);
            cargarDatos();
            setSuccess(editingId ? "Factura actualizada correctamente" : "Compra registrada correctamente");
            setError("");

            setTimeout(() => setSuccess(""), 3500);

        } catch (error) {
            const mensaje = error.response?.data?.error || error.message || "Error al procesar la solicitud";
            setModalError(mensaje);
        }
    };

    //if (loading) return <Loading fullScreen />;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            {/* Header */}
            <div className="mb-6 flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-white rounded-full text-slate-500 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Gestión de Compra / Facturación</h2>
                    <p className="text-sm text-gray-500">
                        Presupuesto #{aprobacion.id} • Proveedor: <span className="font-medium text-slate-800">{aprobacion.presupuesto?.proveedor?.nombreEmpresa}</span>
                    </p>
                </div>
            </div>

            {/* --- MENSAJES EN PANTALLA PRINCIPAL --- */}
            {error && (
                <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-200 animate-in fade-in">
                    <AlertCircle size={16} /> {error}
                    <button onClick={() => setError("")} className="ml-auto hover:text-red-800"><X size={14}/></button>
                </div>
            )}

            {success && (
                <div className="mb-6 bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm flex items-center gap-2 border border-emerald-200 animate-in fade-in slide-in-from-top-2">
                    <Check size={16} /> <span className="font-medium">{success}</span>
                    <button onClick={() => setSuccess("")} className="ml-auto hover:text-emerald-900"><X size={14}/></button>
                </div>
            )}

            {/* Grid de Compras */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {compras.map((item) => {
                    // --- AQUÍ ESTÁ LA LÓGICA DE BLOQUEO ---
                    const isLocked = item.evaluada; // "evaluada" viene del Java isEvaluada()

                    return (
                        <div key={item.idCompra} className={`bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative group hover:shadow-md transition-all ${isLocked ? 'opacity-90' : ''}`}>
                            <div className={`absolute top-0 left-0 w-1 h-full ${isLocked ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                            
                            {/* Badge de Evaluada */}
                            {isLocked && (
                                <div className="absolute top-3 left-4 z-20">
                                    <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded border border-purple-200 font-bold uppercase flex items-center gap-1">
                                        <Check size={10}/> Evaluada
                                    </span>
                                </div>
                            )}

                            {/* Botón Editar (Bloqueado si está evaluada) */}
                            <button 
                                onClick={() => !isLocked && handleEditar(item)} 
                                disabled={isLocked}
                                className={`absolute top-3 right-3 px-3 py-1 border shadow-sm rounded-md transition-all text-xs font-bold z-10 flex items-center gap-1
                                    ${isLocked 
                                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                                        : 'bg-white border-slate-200 text-slate-500 hover:text-blue-600 cursor-pointer'
                                    }`}
                                title={isLocked ? "No se puede editar: Ya tiene Evaluación de Entrega" : "Editar Factura"}
                            >
                                {isLocked ? <Lock size={14} /> : <Pencil size={14} />}
                                {isLocked ? "Cerrada" : "Editar"}
                            </button>
                            
                            <h3 className="font-bold text-slate-800 truncate mb-1 mt-6">Compra #{item.idCompra}</h3>
                            <p className="text-xs text-gray-400 mb-3">Registrada por: {item.usuario?.username || 'Sistema'}</p>

                            <div className="space-y-2 text-xs text-gray-600">
                                <div className="flex items-center gap-2"><Calendar size={14} className="text-gray-400" /> <span>Solicitud: {item.fechaSolicitud}</span></div>
                                <div className="flex items-center gap-2"><Calendar size={14} className="text-gray-400" /> <span>Recepción: {item.fechaRecepcion}</span></div>
                                
                                {item.facturaPdfPath ? (
                                    <div className="flex items-center gap-2 text-blue-600 font-medium cursor-pointer hover:underline mt-2 pt-2 border-t border-slate-50" onClick={() => handleVerPdf(item.facturaPdfPath)}>
                                        <FileText size={14} /> <span>Ver Factura (PDF)</span>
                                    </div>
                                ) : (
                                    <div className="mt-2 pt-2 border-t border-slate-50 text-orange-400 text-xs flex items-center gap-1">
                                        <AlertCircle size={12}/> Sin factura adjunta
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Botón Nueva Compra (Solo visible si no hay compras activas) */}
                {/* Nota: Si ya hay una compra, evaluada o no, no deberías poder crear otra si es relación 1:1 */}
                {compras.length === 0 && (
                    <button onClick={handleNuevo} className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/10 transition-all h-48">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                            <Plus size={20} />
                        </div>
                        <span className="text-sm font-medium">Registrar Factura</span>
                    </button>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="bg-[#1C5B5A] px-6 py-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">{editingId ? "Modificar Factura" : "Registrar Factura"}</h3>
                            <button onClick={() => setShowModal(false)}><X size={20} className="hover:text-emerald-200" /></button>
                        </div>
                        
                        <form onSubmit={handleGuardar} className="p-6 space-y-4">
                            
                            {/* Feedback en Modal */}
                            {modalError && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-200 animate-in slide-in-from-top-2">
                                    <AlertCircle size={16} /> {modalError}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">F. Solicitud</label>
                                    <input type="date" required className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-emerald-500" 
                                        value={formData.fechaSolicitud} onChange={e => setFormData({ ...formData, fechaSolicitud: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">F. Recepción</label>
                                    <input type="date" required className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-emerald-500" 
                                        value={formData.fechaRecepcion} onChange={e => setFormData({ ...formData, fechaRecepcion: e.target.value })} />
                                </div>
                            </div>

                            {/* Drag & Drop */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Adjuntar Factura (PDF)</label>
                                {!file ? (
                                    <div 
                                        onDragOver={handleDragOver} 
                                        onDragLeave={handleDragLeave} 
                                        onDrop={handleDrop} 
                                        className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:bg-slate-50'}`}
                                    >
                                        <UploadCloud size={30} className={isDragging ? "text-emerald-500" : "text-gray-400"} />
                                        <p className="mt-2 text-sm font-medium text-slate-700">Arrastra la factura aquí o <span className="text-emerald-600 underline">haz clic</span></p>
                                        <input type="file" accept="application/pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileSelect} />
                                    </div>
                                ) : (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-emerald-100 text-red-500"><FileText size={18} /></div>
                                            <span className="text-sm font-bold text-slate-700 truncate">{file.name}</span>
                                        </div>
                                        <button type="button" onClick={removeFile} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50">Cancelar</button>
                                <button type="submit" className="flex-1 py-2.5 bg-[#1C5B5A] text-white rounded-lg text-sm font-medium hover:bg-[#164a49] shadow-md transition-all">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus, FileText, Calendar, CheckCircle, UploadCloud, Pencil, X, Trash2, AlertCircle, Check, Lock } from 'lucide-react';
import { listarPresupuestosPorAprobacion, listarProveedores, guardarPresupuesto, actualizarPresupuesto, obtenerUrlPdf } from '../../services/presupuestoService';
import Loading from '../Loading';

export default function GestionPresupuestos({ aprobacion, onBack }) {
    const [presupuestos, setPresupuestos] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Estados para el Modal
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Estados para el Archivo (Drag & Drop)
    const [file, setFile] = useState(null); 
    const [isDragging, setIsDragging] = useState(false); 

    // --- ESTADOS DE FEEDBACK (Mensajes) ---
    const [error, setError] = useState(""); 
    const [success, setSuccess] = useState(""); 
    const [modalError, setModalError] = useState(""); 

    const initialForm = {
        idProveedor: "",
        fechaSolicitud: new Date().toISOString().split('T')[0],
        fechaRecepcion: "",
        observaciones: "",
        cotizacionSatisfactoria: false
    };

    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        cargarDatos();
    }, [aprobacion]);

    const cargarDatos = async () => {
        try {
            const idAprob = aprobacion.id || aprobacion.idAprobSolicitud; 
            const [resPresupuestos, resProveedores] = await Promise.all([
                listarPresupuestosPorAprobacion(idAprob),
                listarProveedores()
            ]);
            
            setPresupuestos(resPresupuestos.data?.contenido || resPresupuestos.data || []);
            setProveedores(resProveedores.data?.contenido || resProveedores.data || []);
        } catch (error) {
            console.error("Error cargando datos:", error);
            setError("No se pudieron cargar los datos del servidor.");
        } finally {
            setLoading(false);
        }
    };

    // --- LÓGICA DE BLOQUEO GLOBAL ---
    // Si AL MENOS UNO de los presupuestos ya fue APROBADO o RECHAZADO, 
    // significa que la gerencia ya tomó una decisión y se cierra todo.
    const hayDecisionTomada = presupuestos.some(p => {
        const estado = p.estadoAprobacion || 'PENDIENTE';
        return estado !== 'PENDIENTE';
    });

    // ... (Manejo de archivos y funciones auxiliares igual que antes) ...
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => { setIsDragging(false); };
    const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); validarYSetearArchivo(e.dataTransfer.files[0]); };
    const handleFileSelect = (e) => { validarYSetearArchivo(e.target.files[0]); };
    
    const validarYSetearArchivo = (archivo) => { 
        if (archivo && archivo.type === "application/pdf") {
            setFile(archivo);
            setModalError(""); 
        } else {
            setModalError("Solo se permiten archivos PDF.");
        }
    };
    
    const removeFile = () => { setFile(null); };
    
    const handleVerPdf = async (nombreArchivo) => {
        setError("");
        try {
            const urlLocal = await obtenerUrlPdf(nombreArchivo);
            window.open(urlLocal, '_blank');
        } catch (error) {
            setError("No se pudo cargar el archivo PDF. Verifique permisos.");
        }
    };

    const limpiarMensajes = () => {
        setModalError("");
    };

    const handleNuevo = () => {
        // Bloqueo extra por si acaso
        if (hayDecisionTomada) return;
        
        setEditingId(null);
        setFile(null);
        setFormData(initialForm);
        limpiarMensajes();
        setShowModal(true);
    };

    const handleEditar = (presupuesto) => {
        setEditingId(presupuesto.idPresupuesto);
        setFile(null);
        setFormData({
            idProveedor: presupuesto.proveedor?.idProveedor || "",
            fechaSolicitud: presupuesto.fechaSolicitud || "",
            fechaRecepcion: presupuesto.fechaRecepcion || "",
            archivoPdfPath: presupuesto.archivoPdfPath || "", 
            observaciones: presupuesto.observaciones || "",
            cotizacionSatisfactoria: presupuesto.cotizacionSatisfactoria || false
        });
        limpiarMensajes();
        setShowModal(true);
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        setModalError(""); 

        try {
            const dataToSend = new FormData();
            dataToSend.append("idProveedor", formData.idProveedor);
            dataToSend.append("fechaSolicitud", formData.fechaSolicitud);
            dataToSend.append("fechaRecepcion", formData.fechaRecepcion);
            dataToSend.append("observaciones", formData.observaciones);
            dataToSend.append("cotizacionSatisfactoria", formData.cotizacionSatisfactoria);

            if (file) {
                dataToSend.append("file", file);
            }

            if (editingId) {
                await actualizarPresupuesto(editingId, dataToSend);
            } else {
                const idAprob = aprobacion.id || aprobacion.idAprobSolicitud;
                await guardarPresupuesto(idAprob, dataToSend);
            }

            setShowModal(false); 
            cargarDatos(); 
            setSuccess("¡Operación realizada correctamente!");
            setError(""); 
            setTimeout(() => { setSuccess(""); }, 3000);

        } catch (error) {
            const mensaje = error.response?.data?.error || error.message || "Error al guardar";
            setModalError(mensaje);
        }
    };

   // if (loading) return <Loading fullScreen />;
    
    const slots = [0, 1, 2, 3]; 

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-white rounded-full transition-colors text-slate-500">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            Gestionar Presupuestos
                            {hayDecisionTomada && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold uppercase rounded border border-gray-200 flex items-center gap-1">
                                    <Lock size={10}/> Cerrado
                                </span>
                            )}
                        </h2>
                        <p className="text-sm text-gray-500">
                            Solicitud #{aprobacion.solicitud?.idSolicitud} • <span className="font-medium text-slate-800">{aprobacion.solicitud?.producto?.nombre}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Avisos */}
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
            
            {/* Aviso de Bloqueo */}
            {hayDecisionTomada && !success && (
                <div className="mb-6 bg-blue-50 text-blue-700 p-3 rounded-lg text-sm flex items-center gap-2 border border-blue-100">
                    <Lock size={16} />
                    <span>
                        <strong>Gestión Finalizada:</strong> Esta solicitud ya tiene un presupuesto evaluado (Aprobado/Rechazado). No se pueden cargar nuevas cotizaciones ni modificar las existentes.
                    </span>
                </div>
            )}

            {/* Grid de 4 Casillas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {slots.map((index) => {
                    const item = presupuestos[index];
                    
                    if (item) {
                        // Lógica individual (sigue aplicando por si acaso)
                        const estadoAprobacion = item.estadoAprobacion || 'PENDIENTE';
                        const isEditable = estadoAprobacion === 'PENDIENTE'; // Ya no se podrá editar si hay decisión

                        return (
                            <div key={item.idPresupuesto} className={`bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all ${!isEditable ? 'opacity-90' : ''}`}>
                                <div className={`absolute top-0 left-0 w-1 h-full ${item.cotizacionSatisfactoria ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                
                                {/* Badge de Estado */}
                                {estadoAprobacion !== 'PENDIENTE' && (
                                    <div className="absolute top-3 right-3 z-20">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                                            estadoAprobacion === 'APROBADA' 
                                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                                                : 'bg-red-100 text-red-700 border-red-200'
                                        }`}>
                                            {estadoAprobacion}
                                        </span>
                                    </div>
                                )}

                                {/* Botón Editar/Ver */}
                                <button 
                                    onClick={() => isEditable && handleEditar(item)}
                                    disabled={!isEditable}
                                    className={`absolute top-3 ${estadoAprobacion !== 'PENDIENTE' ? 'right-auto left-4' : 'right-3'} px-3 py-1 border shadow-sm rounded-md transition-all flex items-center gap-2 text-xs font-bold z-10
                                        ${isEditable 
                                            ? 'bg-white border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 cursor-pointer' 
                                            : 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'
                                        }`}
                                >
                                    {isEditable ? <Pencil size={16} /> : <FileText size={16}/>}
                                    {isEditable ? "Editar" : "Ver"}
                                </button>

                                <div className="mt-6"> 
                                    <h3 className="font-bold text-slate-800 truncate pr-2">{item.proveedor?.nombreEmpresa}</h3>
                                    <p className="text-xs text-gray-500 mb-3">{item.proveedor?.mail || "Sin email"}</p>

                                    <div className="space-y-2 text-xs text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-gray-400"/>
                                            <span>Recibido: {item.fechaRecepcion || 'Pendiente'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={14} className={item.cotizacionSatisfactoria ? "text-emerald-500" : "text-gray-300"}/>
                                            <span>{item.cotizacionSatisfactoria ? "Satisfactorio" : "Normal"}</span>
                                        </div>
                                        {item.archivoPdfPath && (
                                            <div className="flex items-center gap-2 text-blue-600 font-medium cursor-pointer hover:underline mt-2 pt-2 border-t border-slate-50" 
                                                onClick={() => handleVerPdf(item.archivoPdfPath)} 
                                            >
                                                <FileText size={14}/>
                                                <span className="truncate max-w-[150px]">Ver PDF adjunto</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    } else {
                        // --- CASILLA VACÍA (Botón Nuevo) ---
                        // Si ya hay decisión tomada, mostramos la casilla bloqueada (Gris)
                        if (hayDecisionTomada) {
                            return (
                                <div 
                                    key={index}
                                    className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-300 bg-slate-50 h-48 cursor-not-allowed"
                                    title="No se pueden agregar más presupuestos porque ya hay una decisión tomada."
                                >
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2 text-slate-300">
                                        <Lock size={20} />
                                    </div>
                                    <span className="text-sm font-medium">Bloqueado</span>
                                </div>
                            );
                        }

                        // Si NO hay decisión, mostramos el botón habilitado
                        return (
                            <button 
                                key={index}
                                onClick={handleNuevo}
                                className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/10 transition-all h-48"
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                                    <Plus size={20} />
                                </div>
                                <span className="text-sm font-medium">Cargar Presupuesto</span>
                            </button>
                        );
                    }
                })}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="bg-[#1C5B5A] px-6 py-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">{editingId ? "Modificar Presupuesto" : "Nuevo Presupuesto"}</h3>
                            <button onClick={() => setShowModal(false)}><X size={20} className="hover:text-emerald-200" /></button>
                        </div>
                        
                        <form onSubmit={handleGuardar} className="p-6 space-y-4">
                            {modalError && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-200 animate-in slide-in-from-top-2">
                                    <AlertCircle size={16} /> {modalError}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Proveedor</label>
                                <select 
                                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 outline-none"
                                    value={formData.idProveedor}
                                    onChange={e => setFormData({...formData, idProveedor: e.target.value})}
                                    required
                                    disabled={hayDecisionTomada} // Bloqueo extra por seguridad
                                >
                                    <option value="">Seleccione proveedor...</option>
                                    {proveedores.map(p => (
                                        <option key={p.idProveedor} value={p.idProveedor}>{p.nombreEmpresa}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha Solicitud</label>
                                    <input type="date" required className="w-full border border-slate-300 rounded-lg p-2 text-sm" 
                                        value={formData.fechaSolicitud}
                                        onChange={e => setFormData({...formData, fechaSolicitud: e.target.value})} 
                                        disabled={hayDecisionTomada} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha Recepción</label>
                                    <input type="date" className="w-full border border-slate-300 rounded-lg p-2 text-sm" 
                                        value={formData.fechaRecepcion}
                                        onChange={e => setFormData({...formData, fechaRecepcion: e.target.value})} 
                                        disabled={hayDecisionTomada} />
                                </div>
                            </div>

                            {/* ... (Drag & Drop y Observaciones siguen igual) ... */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Conversación (PDF)</label>
                                {!file ? (
                                    <div 
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:bg-slate-50'}`}
                                    >
                                        <UploadCloud size={30} className={isDragging ? "text-emerald-500" : "text-gray-400"} />
                                        <p className="mt-2 text-sm font-medium text-slate-700">Arrastra tu PDF aquí o <span className="text-emerald-600 underline">haz clic</span></p>
                                        <input type="file" accept="application/pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileSelect} disabled={hayDecisionTomada}/>
                                    </div>
                                ) : (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-emerald-100 text-red-500"><FileText size={18} /></div>
                                            <span className="text-sm font-bold text-slate-700 truncate">{file.name}</span>
                                        </div>
                                        <button type="button" onClick={removeFile} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors" disabled={hayDecisionTomada}><Trash2 size={16} /></button>
                                    </div>
                                )}
                                {editingId && !file && formData.archivoPdfPath && (
                                    <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                                        <CheckCircle size={12}/> Archivo actual guardado: {formData.archivoPdfPath}
                                    </p>
                                )}
                            </div>

                             <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Observaciones</label>
                                <textarea className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none resize-none h-20" value={formData.observaciones} onChange={e => setFormData({...formData, observaciones: e.target.value})} disabled={hayDecisionTomada}></textarea>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                <input type="checkbox" id="satisfactorio" className="w-5 h-5 accent-emerald-600 cursor-pointer" checked={formData.cotizacionSatisfactoria} onChange={e => setFormData({...formData, cotizacionSatisfactoria: e.target.checked})} disabled={hayDecisionTomada} />
                                <label htmlFor="satisfactorio" className="text-sm font-medium text-emerald-900 cursor-pointer select-none">Cotización Satisfactoria</label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50">Cancelar</button>
                                
                                <button 
                                    type="submit" 
                                    disabled={hayDecisionTomada} // Bloqueo final del botón guardar
                                    className={`flex-1 py-2.5 text-white rounded-lg text-sm font-medium shadow-md transition-all
                                        ${hayDecisionTomada
                                            ? 'bg-gray-400 cursor-not-allowed' 
                                            : 'bg-[#1C5B5A] hover:bg-[#164a49]'
                                        }`}
                                >
                                    {editingId ? "Guardar Cambios" : "Crear Presupuesto"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
import React, { useState, useEffect } from 'react';
import { X, Save, CheckCircle, XCircle, Package, AlertCircle, Lock, MessageSquare } from 'lucide-react'; // <-- Agregamos MessageSquare
import { decidirAprobacionSoli, modificarSolicitud } from '../../../services/aprobSoliService';
import { listarProductos, listarPrioridades } from '../../../services/solicitudService'; 

export default function GestionAprobSolicitud({ aprobacion, soloLectura, onClose, onSuccess }) {
    const soli = aprobacion.solicitud;
    const [loading, setLoading] = useState(false);
    const [cargandoListas, setCargandoListas] = useState(false);
    
    // --- ESTADO DE BLOQUEO ---
    const estadoAprobacion = aprobacion.estado || 'PENDIENTE';
    const isLocked = soloLectura || estadoAprobacion !== 'PENDIENTE';

    // --- ESTADOS DE FEEDBACK ---
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [productos, setProductos] = useState([]);
    const [prioridades, setPrioridades] = useState([]);

    // 1. ESTADO: Datos de la solicitud (Incluye los comentarios originales)
    const [formData, setFormData] = useState({
        cantidad: soli?.cantidad || 0,
        idProducto: soli?.producto?.idProducto || "",
        idNivelPrioridad: soli?.nivelPrioridad?.idNivelPrioridad || "",
        comentariosSolicitud: soli?.comentarios || "" // <-- Agregado
    });

    // 2. ESTADO: Comentarios de la decisión del Gerente
    const [comentariosAprobacion, setComentariosAprobacion] = useState(aprobacion.comentarios || ""); // <-- Agregado

    useEffect(() => {
        const fetchListas = async () => {
            setCargandoListas(true);
            try {
                const [resProd, resPrio] = await Promise.all([listarProductos(), listarPrioridades()]);
                setProductos(resProd.data?.contenido || resProd.data || []);
                setPrioridades(resPrio.data?.contenido || resPrio.data || []);
            } catch (err) {
                console.error("Error cargando listas en modal", err);
                setError("No se pudieron cargar las opciones de productos/prioridades.");
            } finally {
                setCargandoListas(false);
            }
        };
        fetchListas();
    }, []);

    const handleActualizarDatos = async () => {
        if (isLocked) return;
        try {
            setLoading(true);
            setError('');
            setSuccess('');
            
            // Agregamos los comentarios al payload de actualización
            const payload = {
                cantidad: parseInt(formData.cantidad),
                idProducto: parseInt(formData.idProducto),
                idNivelPrioridad: parseInt(formData.idNivelPrioridad),
                comentarios: formData.comentariosSolicitud // <-- Agregado
            };

            await modificarSolicitud(soli.idSolicitud, payload);
            
            setSuccess("Datos de la solicitud actualizados correctamente.");
            setTimeout(() => setSuccess(""), 3500); 
            
        } catch (err) {
            setError(err.response?.data?.error || "Error al modificar la solicitud.");
        } finally {
            setLoading(false);
        }
    };

    const handleDecidir = async (decision) => {
        if (isLocked) return;
        try {
            setLoading(true);
            setError('');
            
            // Pasamos los comentarios de aprobación al servicio
            await decidirAprobacionSoli(soli.idSolicitud, decision, comentariosAprobacion); // <-- Agregado el 3er parámetro
            
            onSuccess(`La solicitud fue ${decision.toLowerCase()} con éxito.`); 
        } catch (err) {
            setError(err.response?.data?.error || `Error al marcar como ${decision}`);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
                
                {/* --- HEADER --- */}
                <div className={`px-6 py-4 flex justify-between items-center text-white shrink-0 ${isLocked ? 'bg-slate-700' : 'bg-[#1C5B5A]'}`}>
                    <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            {isLocked ? 'Detalle de Solicitud' : 'Evaluación de Solicitud'}
                            {isLocked && (
                                <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold uppercase rounded border border-white/30 flex items-center gap-1">
                                    <Lock size={10}/> Evaluada
                                </span>
                            )}
                        </h3>
                        <span className="text-xs opacity-80">ID: #{soli?.idSolicitud} • Solicitante: {soli?.usuario?.username}</span>
                    </div>
                    <button onClick={onClose}><X size={20} className="hover:opacity-75" /></button>
                </div>

                {/* --- CUERPO SCROLLEABLE --- */}
                <div className="p-6 space-y-5 overflow-y-auto">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-200">
                            <AlertCircle size={16} className="shrink-0" /> {error}
                            <button onClick={() => setError("")} className="ml-auto hover:text-red-800"><X size={14}/></button>
                        </div>
                    )}

                    {success && (
                        <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm flex items-center gap-2 border border-emerald-200">
                            <CheckCircle size={16} className="shrink-0" /> <span className="font-medium">{success}</span>
                            <button onClick={() => setSuccess("")} className="ml-auto hover:text-emerald-900"><X size={14}/></button>
                        </div>
                    )}

                    {isLocked && !success && !error && (
                        <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm flex items-center gap-2 border border-blue-100">
                            <Lock size={16} className="shrink-0" />
                            <span>
                                <strong>Gestión Finalizada:</strong> Esta solicitud ya fue <b>{estadoAprobacion}</b>.
                            </span>
                        </div>
                    )}

                    {/* --- FORMULARIO DE LA SOLICITUD --- */}
                    <div className="space-y-4">
                        {!isLocked && (
                            <p className="text-[11px] text-gray-500 bg-emerald-50 p-2 rounded border border-emerald-100">
                                Puedes ajustar el pedido antes de evaluarlo. Haz clic en <b>Actualizar Datos</b> si modificas algo.
                            </p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Producto</label>
                                <div className="relative">
                                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <select
                                        disabled={isLocked || loading || cargandoListas}
                                        value={formData.idProducto}
                                        onChange={(e) => setFormData({...formData, idProducto: e.target.value})}
                                        className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                                    >
                                        <option value="">Seleccione producto...</option>
                                        {productos.map(p => (
                                            <option key={p.idProducto} value={p.idProducto}>{p.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Prioridad</label>
                                <select
                                    disabled={isLocked || loading || cargandoListas}
                                    value={formData.idNivelPrioridad}
                                    onChange={(e) => setFormData({...formData, idNivelPrioridad: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                                >
                                    <option value="">Seleccione...</option>
                                    {prioridades.map(p => (
                                        <option key={p.idNivelPrioridad} value={p.idNivelPrioridad}>{p.categoria}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cantidad</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    disabled={isLocked || loading || cargandoListas}
                                    value={formData.cantidad}
                                    onChange={(e) => setFormData({...formData, cantidad: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                                />
                            </div>

                            {/* TEXTAREA 1: Comentarios de la Solicitud */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                                    <MessageSquare size={12} /> Comentarios del Solicitante
                                </label>
                                <textarea
                                    disabled={isLocked || loading || cargandoListas}
                                    rows={2}
                                    value={formData.comentariosSolicitud}
                                    onChange={(e) => setFormData({...formData, comentariosSolicitud: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-slate-50 disabled:text-slate-500 resize-none"
                                    placeholder={isLocked ? "Sin comentarios" : "Modificar o agregar comentarios al pedido..."}
                                />
                            </div>
                        </div>

                        {!isLocked && (
                            <button 
                                onClick={handleActualizarDatos}
                                disabled={loading || cargandoListas}
                                className="w-full bg-slate-100 text-slate-700 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-200 transition-colors disabled:opacity-50"
                            >
                                <Save size={16}/> Guardar Cambios Previos
                            </button>
                        )}
                    </div>

                    {/* --- SECCIÓN DE DECISIÓN DE GERENCIA --- */}
                    <div className="pt-4 border-t border-slate-100 mt-2">
                        
                        {/* TEXTAREA 2: Comentarios del Gerente al aprobar/rechazar */}
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">
                                Comentarios de Evaluación (Gerencia)
                            </label>
                            <textarea
                                disabled={isLocked || loading}
                                rows={2}
                                value={comentariosAprobacion}
                                onChange={(e) => setComentariosAprobacion(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-slate-50 disabled:text-slate-500 resize-none bg-emerald-50/30"
                                placeholder={isLocked ? "Sin comentarios de evaluación" : "Escribe una justificación opcional para tu decisión..."}
                            />
                        </div>

                        {!isLocked ? (
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => handleDecidir('RECHAZADA')}
                                    disabled={loading || cargandoListas}
                                    className="flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 border border-red-200 transition-all disabled:opacity-50"
                                >
                                    <XCircle size={18} /> Rechazar
                                </button>
                                <button 
                                    onClick={() => handleDecidir('APROBADA')}
                                    disabled={loading || cargandoListas}
                                    className="flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-lg text-sm font-bold hover:bg-emerald-600 shadow-sm transition-all disabled:opacity-50"
                                >
                                    <CheckCircle size={18} /> Aprobar
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={onClose}
                                className="w-full py-3 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-all border border-slate-200"
                            >
                                Cerrar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
// src/components/cierre/GestionCierre.jsx
import React, { useEffect, useState } from "react";
import { ArrowLeft, Plus, Pencil, X, Calendar, CheckCircle, AlertCircle, Check, Archive, Lock, AlertTriangle, FileText } from "lucide-react";
import { crearCierre, modificarCierre, buscarCierrePorEvaluacion } from "../../services/cierreService";
import { getReclamoPorEvaluacion } from "../../services/evalEntregaService"; // IMPORTAMOS EL SERVICIO DE RECLAMOS
import Loading from "../Loading";

export default function GestionCierre({ evaluacion, onBack }) {
    const [cierre, setCierre] = useState(null);
    const [reclamo, setReclamo] = useState(null); // NUEVO ESTADO PARA EL RECLAMO
    const [loading, setLoading] = useState(true);
    
    // Estados del Modal
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [error, setError] = useState("");        
    const [success, setSuccess] = useState("");    
    const [modalError, setModalError] = useState(""); 

    const [formData, setFormData] = useState({ observaciones: "" });

    useEffect(() => {
        cargarDatos();
    }, [evaluacion]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError("");
            
            // 1. Buscamos el Cierre Administrativo
            try {
                const resCierre = await buscarCierrePorEvaluacion(evaluacion.idEvaluacionEntrega);
                setCierre(resCierre.data);
            } catch (err) {
                if(err.response && err.response.status !== 404) {
                     setError("Error al verificar el estado de cierre.");
                }
                setCierre(null);
            }

            // 2. Buscamos si existe un Reclamo (solo si fue No Conforme)
            if (!evaluacion.cumpleCondiciones) {
                try {
                    const resReclamo = await getReclamoPorEvaluacion(evaluacion.idEvaluacionEntrega);
                    setReclamo(resReclamo.data);
                } catch (err) {
                    setReclamo(null); // Si no hay reclamo o da 404, no pasa nada
                }
            }

        } finally {
            setLoading(false);
        }
    };

    const triggerSuccess = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(""), 3500);
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        setModalError("");

        try {
            if (editingId) {
                // PUT /api/cierres/{id}
                const dataToUpdate = { observaciones: formData.observaciones };
                await modificarCierre(editingId, dataToUpdate);
                triggerSuccess("Cierre actualizado correctamente");
            } else {
                // POST /api/cierres/
                const dataToCreate = {
                    idEvalEntrega: evaluacion.idEvaluacionEntrega,
                    observaciones: formData.observaciones
                };
                await crearCierre(dataToCreate);
                triggerSuccess("Cierre administrativo generado con éxito. La Solicitud ha sido cerrada.");
            }

            setShowModal(false);
            setEditingId(null);
            await cargarDatos(); 

        } catch (error) {
            const msg = error.response?.data?.error || error.message || "Error al procesar el cierre";
            setModalError(msg);
        }
    };

    const formatearFecha = (fechaString) => {
        if (!fechaString) return "-";
        const [anio, mes, dia] = fechaString.split('-'); 
        return `${dia}/${mes}/${anio}`;
    };

   // if (loading) return <Loading fullScreen />;

    return (
        <div className="pb-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-white rounded-full text-slate-500 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            Cierre Administrativo
                            {cierre && (
                                <span className="px-2 py-0.5 bg-gray-800 text-white text-xs font-bold uppercase rounded flex items-center gap-1 shadow-sm">
                                    <Lock size={10}/> Expediente Cerrado
                                </span>
                            )}
                        </h2>
                        <p className="text-sm text-gray-500">
                            Evaluación #{evaluacion.idEvaluacionEntrega} • Compra #{evaluacion.compra?.idCompra}
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-200">
                    <AlertCircle size={16} /> {error}
                    <button onClick={() => setError("")} className="ml-auto hover:text-red-800"><X size={14}/></button>
                </div>
            )}
            
            {success && (
                <div className="mb-6 bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm flex items-center gap-2 border border-emerald-200 animate-in fade-in">
                    <Check size={16} /> <span className="font-medium">{success}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* --- COLUMNA 1: INFO DE LA EVALUACIÓN Y RECLAMO --- */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider">Datos de Origen</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-gray-500 font-bold mb-1">Producto Adquirido</p>
                            <p className="text-slate-800 font-medium">
                                {evaluacion.compra?.aprobacionPresupuesto?.presupuesto?.aprobacionSolicitud?.solicitud?.producto?.nombre}
                            </p>
                        </div>
                        
                        <div>
                            <p className="text-xs text-gray-500 font-bold mb-1">Proveedor</p>
                            <p className="text-slate-800 font-medium">
                                {evaluacion.compra?.aprobacionPresupuesto?.presupuesto?.proveedor?.nombreEmpresa}
                            </p>
                        </div>

                        <div className="pt-3 border-t border-slate-200">
                            <p className="text-xs text-gray-500 font-bold mb-2">Resultado de la Evaluación</p>
                            <div className="flex items-center gap-2">
                                {evaluacion.cumpleCondiciones ? (
                                    <span className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
                                        <CheckCircle size={16}/> Entrega Conforme
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-red-600 font-bold text-sm">
                                        <AlertTriangle size={16}/> Entrega No Conforme
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 mt-2 italic bg-white p-3 rounded border border-slate-100">
                                "{evaluacion.observaciones || 'Sin observaciones en la evaluación.'}"
                            </p>
                        </div>

                        {/* SECCIÓN DEL RECLAMO ASOCIADO */}
                        {reclamo && (
                            <div className="pt-4 border-t border-slate-200 mt-4 animate-in fade-in">
                                <p className="text-xs text-orange-600 font-bold mb-2 uppercase flex items-center gap-1">
                                    <FileText size={14} className="text-orange-500"/>
                                    Reclamo Generado
                                </p>
                                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-slate-800 text-sm">Reclamo #{reclamo.idReclamo}</span>
                                        <span className="text-xs text-gray-500 font-medium bg-white px-2 py-0.5 rounded border border-orange-100 shadow-sm">
                                            {formatearFecha(reclamo.fechaReclamo)}
                                        </span>
                                    </div>
                                    <p className="mb-3 text-sm text-slate-700 italic">"{reclamo.detalleReclamo}"</p>
                                    
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {reclamo.esRecurrente && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase">Recurrente</span>}
                                        {reclamo.productoRechazado && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase">Rechazado</span>}
                                        {reclamo.entregaNueva && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">Nueva Entrega</span>}
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-orange-200 flex flex-col gap-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-gray-500 uppercase">Respuesta Prov:</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                                reclamo.respuestaProveedor === 'POSITIVA' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                                reclamo.respuestaProveedor === 'NEGATIVA' ? 'bg-red-100 text-red-700 border border-red-200' :
                                                'bg-gray-200 text-gray-700 border border-gray-300'
                                            }`}>
                                                {reclamo.respuestaProveedor || "PENDIENTE"}
                                            </span>
                                        </div>
                                        {/* Si hubo nueva entrega, mostramos si la nueva estuvo bien */}
                                        {reclamo.entregaNueva && (
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-xs font-bold text-gray-500 uppercase">Estado Reemplazo:</span>
                                                <span className={`text-xs font-bold ${reclamo.satisfechoConNuevaEntrega ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {reclamo.satisfechoConNuevaEntrega ? 'Satisfecho' : 'Aún No Satisfecho'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- COLUMNA 2: EL CIERRE --- */}
                <div>
                    {cierre ? (
                        <div className="bg-white border border-emerald-100 rounded-xl p-6 shadow-sm relative animate-in fade-in">
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l-xl"></div>
                            
                            <button
                                onClick={() => {
                                    setEditingId(cierre.idCierre);
                                    setFormData({ observaciones: cierre.observaciones || "" });
                                    setModalError("");
                                    setShowModal(true);
                                }}
                                className="absolute top-4 right-4 text-slate-400 hover:text-blue-600 transition-colors p-1"
                                title="Editar Observaciones de Cierre"
                            >
                                <Pencil size={18} />
                            </button>

                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                    <Archive size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 leading-tight">Expediente Cerrado</h3>
                                    <p className="text-xs text-emerald-600 font-bold">Cierre #{cierre.idCierre}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-slate-600 text-sm bg-slate-50 p-2 rounded border border-slate-100">
                                    <Calendar size={16} className="text-slate-400" />
                                    <span>Fecha de Cierre: <b>{formatearFecha(cierre.fechaCierre)}</b></span>
                                </div>
                                
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Observaciones Finales</p>
                                    <p className="text-sm text-slate-700 bg-white border border-slate-200 p-3 rounded-lg leading-relaxed">
                                        {cierre.observaciones || "Sin observaciones adicionales."}
                                    </p>
                                </div>

                                <div className="pt-3 border-t border-slate-100 text-xs text-gray-500 text-right">
                                    Cerrado por: <span className="font-bold">{cierre.usuario?.username}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col justify-center">
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                                <div className="bg-white p-3 rounded-full mb-4 shadow-sm text-blue-500">
                                    <Archive size={32} />
                                </div>
                                <h3 className="font-bold text-slate-800 mb-2">Listo para el Cierre</h3>
                                <p className="text-sm text-gray-600 mb-6 max-w-xs">
                                    Al generar el cierre administrativo, la <b>Solicitud de Compra original</b> cambiará su estado a "Cerrado" y concluirá el circuito.
                                </p>
                                
                                {/* Si hay un reclamo, mostramos una advertencia amigable */}
                                {reclamo && (
                                    <div className="mb-4 bg-orange-100/50 text-orange-800 text-xs p-3 rounded border border-orange-200">
                                        <b>Nota:</b> Estás por cerrar un expediente que tuvo un reclamo. Asegúrate de que el conflicto haya sido resuelto.
                                    </div>
                                )}

                                <button
                                    onClick={() => {
                                        setEditingId(null);
                                        setFormData({ observaciones: "" });
                                        setModalError("");
                                        setShowModal(true);
                                    }}
                                    className="px-6 py-2.5 bg-[#1C5B5A] text-white rounded-lg font-bold hover:bg-[#164a49] shadow-md transition-all flex items-center gap-2"
                                >
                                    <CheckCircle size={18} /> Procesar Cierre
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Formulario */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 animate-in fade-in">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl animate-in zoom-in-95">
                        <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100 bg-[#1C5B5A] text-white rounded-t-xl">
                            <h3 className="font-bold text-lg">{editingId ? "Editar Cierre" : "Generar Cierre Administrativo"}</h3>
                            <button onClick={() => setShowModal(false)}><X size={20} className="hover:text-emerald-200" /></button>
                        </div>
                        
                        <form onSubmit={handleGuardar} className="p-6 space-y-4">
                            {modalError && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-200">
                                    <AlertCircle size={16} className="shrink-0"/> {modalError}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                    Observaciones de Cierre (Opcional)
                                </label>
                                <textarea 
                                    rows={4} 
                                    value={formData.observaciones} 
                                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })} 
                                    className="w-full border border-slate-300 rounded-lg p-3 text-sm outline-none resize-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                                    placeholder="Agrega notas finales sobre la finalización de esta compra..."
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" className="flex-1 py-2.5 bg-[#1C5B5A] text-white rounded-lg text-sm font-bold hover:bg-[#164a49] shadow-md transition-all">
                                    {editingId ? "Guardar Cambios" : "Confirmar Cierre"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
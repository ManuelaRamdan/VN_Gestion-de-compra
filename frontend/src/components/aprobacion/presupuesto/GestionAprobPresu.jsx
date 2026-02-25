import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Calendar, FileText, AlertCircle, Building } from 'lucide-react';
import { decidirAprobacionPresupuesto } from '../../../services/aprobPresuService'; // O la ruta donde lo pusiste
import { obtenerUrlPdf } from '../../../services/presupuestoService'; // Reutilizamos tu función para abrir el PDF

export default function GestionAprobPresu({ grupoSeleccionado, soloLectura, onClose, onSuccess }) {
    const { solicitud, presupuestosAsociados } = grupoSeleccionado;
    const [loadingId, setLoadingId] = useState(null);
    const [error, setError] = useState('');

    const handleVerPdf = async (nombreArchivo) => {
        try {
            const url = await obtenerUrlPdf(nombreArchivo);
            window.open(url, '_blank');
        } catch (error) {
            setError("No se pudo cargar el archivo PDF.");
        }
    };

    const formatDateLocal = (dateString) => {
        if (!dateString) return 'Pendiente';
        const date = dateString.includes('T') ? new Date(dateString) : new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString();
    };

    const handleDecidir = async (idPresupuesto, decision) => {
        try {
            setLoadingId(idPresupuesto);
            setError('');
            // Pasamos el idPresupuesto porque es lo que espera tu AprobacionPresupuestoService en el backend
            await decidirAprobacionPresupuesto(idPresupuesto, decision);
            onSuccess(`El presupuesto seleccionado fue ${decision.toLowerCase()} con éxito.`);
        } catch (err) {
            setError(err.response?.data?.error || `Error al procesar la decisión`);
            setLoadingId(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
                
                {/* Header */}
                <div className={`px-6 py-4 flex justify-between items-center text-white ${soloLectura ? 'bg-slate-700' : 'bg-[#1C5B5A]'}`}>
                    <div>
                        <h3 className="font-bold text-lg">
                            {soloLectura ? 'Detalle de Presupuestos' : 'Comparación de Presupuestos'}
                        </h3>
                        <span className="text-xs opacity-80">
                            Solicitud #{solicitud?.idSolicitud} • Producto: {solicitud?.producto?.nombre} ({solicitud?.cantidad} un.)
                        </span>
                    </div>
                    <button onClick={onClose}><X size={20} className="hover:opacity-75" /></button>
                </div>

                {/* Contenido scrolleable */}
                <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
                    {error && (
                        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-200">
                            <AlertCircle size={16} /> {error}
                            <button onClick={() => setError("")} className="ml-auto"><X size={14}/></button>
                        </div>
                    )}

                    {!soloLectura && (
                        <div className="mb-5 text-sm text-blue-700 bg-blue-100/50 border border-blue-200 p-3 rounded-lg flex items-center gap-2">
                            <AlertCircle size={18} className="text-blue-500 shrink-0"/> 
                            <span>Al hacer clic en <b>Aprobar</b> sobre un presupuesto, los demás presupuestos de esta solicitud <b>se rechazarán automáticamente</b> en el sistema.</span>
                        </div>
                    )}

                    {/* Grid de Presupuestos (1 fila de 1 o 2 columnas dependiendo de cuántos haya) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {presupuestosAsociados.map(aprob => {
                            const p = aprob.presupuesto;
                            const isEvaluatingThis = loadingId === p.idPresupuesto;
                            const estadoAprob = aprob.estado;

                            return (
                                <div key={aprob.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-colors flex flex-col">
                                    
                                    {/* Barra decorativa */}
                                    <div className={`absolute top-0 left-0 w-1 h-full ${soloLectura ? (estadoAprob === 'APROBADA' ? 'bg-emerald-500' : 'bg-red-500') : (p.cotizacionSatisfactoria ? 'bg-emerald-500' : 'bg-slate-300')}`}></div>
                                    
                                    {soloLectura && (
                                        <div className="absolute top-3 right-3">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                                                estadoAprob === 'APROBADA' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'
                                            }`}>
                                                {estadoAprob}
                                            </span>
                                        </div>
                                    )}

                                    {/* Info del Proveedor */}
                                    <div className="mb-4">
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                            <Building size={14}/> Proveedor
                                        </div>
                                        <h4 className="font-bold text-slate-800 text-lg leading-tight">{p.proveedor?.nombreEmpresa}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{p.proveedor?.mail}</p>
                                    </div>

                                    {/* Detalles Técnicos */}
                                    <div className="space-y-3 text-sm text-slate-600 mb-5">
                                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-md border border-slate-100">
                                            <Calendar size={16} className="text-gray-400 shrink-0"/> 
                                            <span className="text-xs">Recibido: <b className="text-slate-700">{formatDateLocal(p.fechaRecepcion)}</b></span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-md border border-slate-100">
                                            <CheckCircle size={16} className={`shrink-0 ${p.cotizacionSatisfactoria ? "text-emerald-500" : "text-gray-400"}`}/> 
                                            <span className="text-xs">Validación de Compras: <b className={p.cotizacionSatisfactoria ? 'text-emerald-700' : 'text-slate-700'}>{p.cotizacionSatisfactoria ? "Satisfactoria" : "Normal"}</b></span>
                                        </div>

                                        {p.observaciones && (
                                            <div className="mt-2 text-xs italic text-slate-500 bg-yellow-50/50 p-2 border-l-2 border-yellow-300">
                                                "{p.observaciones}"
                                            </div>
                                        )}

                                        {p.archivoPdfPath && (
                                            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs cursor-pointer hover:underline pt-2" 
                                                onClick={() => handleVerPdf(p.archivoPdfPath)} >
                                                <FileText size={14}/> Ver PDF Cotización adjunta
                                            </div>
                                        )}
                                    </div>

                                    {/* Botones de Acción (Solo en Pendientes) */}
                                    {!soloLectura && (
                                        <div className="flex gap-2 pt-4 border-t border-slate-100 mt-auto">
                                            <button 
                                                onClick={() => handleDecidir(p.idPresupuesto, 'RECHAZADA')}
                                                disabled={loadingId !== null}
                                                className="flex-1 py-2.5 text-xs font-bold text-slate-500 bg-white hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-lg transition-all flex justify-center items-center gap-1 disabled:opacity-50"
                                            >
                                                <XCircle size={16}/> Rechazar Individual
                                            </button>
                                            <button 
                                                onClick={() => handleDecidir(p.idPresupuesto, 'APROBADA')}
                                                disabled={loadingId !== null}
                                                className="flex-1 py-2.5 text-xs font-bold text-white bg-[#1C5B5A] hover:bg-[#134140] shadow-sm rounded-lg transition-all flex justify-center items-center gap-1 disabled:opacity-50"
                                            >
                                                {isEvaluatingThis ? 'Procesando...' : <><CheckCircle size={16}/> Elegir y Aprobar</>}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Modal */}
                <div className="p-4 bg-white border-t border-slate-200 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-all"
                    >
                        {soloLectura ? 'Cerrar Detalles' : 'Cancelar Evaluación'}
                    </button>
                </div>
            </div>
        </div>
    );
}
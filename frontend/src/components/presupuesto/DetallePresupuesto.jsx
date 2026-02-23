import React from 'react';
import { X, Calendar, Building, User, CheckCircle, FileText, MessageSquare, Package } from 'lucide-react';

export default function DetallesPresupuesto({ item, onClose }) {
    if (!item) return null;

    // Dependiendo de si recibimos Presupuesto o AprobacionPresupuesto
    const p = item.presupuesto || item;
    const aprob = item.presupuesto ? item : null;

    const formatDate = (dateString) => {
        if (!dateString) return "No registrada";
        return new Date(dateString).toLocaleDateString('es-ES');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="bg-[#1C5B5A] px-6 py-4 flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-lg font-bold">Presupuesto #{p.idPresupuesto}</h2>
                        <p className="text-emerald-100 text-xs">Cargado por {p.usuario?.username}</p>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white p-2 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[80vh]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Proveedor */}
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-2 mb-3 text-emerald-700 font-semibold text-sm uppercase tracking-wide">
                                <Building size={16} /> Proveedor
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-bold text-slate-800">{p.proveedor?.nombreEmpresa}</p>
                                <p className="text-sm text-gray-500">{p.proveedor?.mail}</p>
                                <p className="text-xs text-gray-400">Contacto: {p.proveedor?.nombreContacto}</p>
                            </div>
                        </div>

                        {/* Referencia Solicitud */}
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-2 mb-3 text-emerald-700 font-semibold text-sm uppercase tracking-wide">
                                <Package size={16} /> Solicitud Origen
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-slate-800">{p.aprobacionSolicitud?.solicitud?.producto?.nombre}</p>
                                <p className="text-sm text-gray-500">Cantidad: {p.aprobacionSolicitud?.solicitud?.cantidad} units</p>
                                <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">
                                    Solicitud #{p.aprobacionSolicitud?.solicitud?.idSolicitud}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2 text-slate-800 font-bold text-sm">
                            <MessageSquare size={16} className="text-gray-400" /> Observaciones del Presupuesto
                        </div>
                        <div className="bg-white border border-slate-200 p-4 rounded-lg text-sm text-gray-600 italic">
                            {p.observaciones || "Sin observaciones adicionales."}
                        </div>
                    </div>

                    <div className="border-t border-slate-100 my-4"></div>

                    {/* Tiempos y Estado */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <Calendar size={16} className="text-gray-400" /> Tiempos
                            </h3>
                            <ul className="text-sm space-y-2 text-gray-600">
                                <li><span className="font-medium text-slate-700">Solicitado:</span> {formatDate(p.fechaSolicitud)}</li>
                                <li><span className="font-medium text-slate-700">Recibido:</span> {formatDate(p.fechaRecepcion)}</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <CheckCircle size={16} className="text-gray-400" /> Validación
                            </h3>
                            <ul className="text-sm space-y-2 text-gray-600">
                                <li className="flex items-center gap-2">
                                    <span className="font-medium text-slate-700">Satisfactorio:</span> 
                                    {p.cotizacionSatisfactoria ? "SÍ" : "NO"}
                                </li>
                                {aprob && (
                                    <li className="flex items-center gap-2">
                                        <span className="font-medium text-slate-700">Estado Aprobación:</span>
                                        <span className="font-bold text-emerald-600">{aprob.estado}</span>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
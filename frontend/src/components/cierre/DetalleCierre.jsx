import React from 'react';
import { X, Calendar, Package, MessageSquare, User } from 'lucide-react';

export default function DetalleCierre({ cierre, onClose }) {
    if (!cierre) return null;
    const solicitud = cierre.evaluacionEntrega?.compra?.aprobacionPresupuesto?.presupuesto?.aprobacionSolicitud?.solicitud;

    const formatDate = (dateString) => {
        if (!dateString) return "No registrada";
        return new Date(dateString + 'T00:00:00').toLocaleDateString('es-ES');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-[#1C5B5A] px-6 py-4 flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-lg font-bold">Cierre #{cierre.idCierre}</h2>
                        <p className="text-emerald-100 text-xs">Evaluación de entrega #{cierre.evaluacionEntrega?.idEvaluacionEntrega}</p>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white p-2 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[80vh]">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6">
                        <div className="flex items-center gap-2 mb-3 text-emerald-700 font-semibold text-sm uppercase tracking-wide">
                            <Package size={16} /> Producto
                        </div>
                        <p className="font-bold text-slate-800">{solicitud?.producto?.nombre}</p>
                        <p className="text-sm text-gray-500">Cantidad: {solicitud?.cantidad}</p>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2 text-slate-800 font-bold text-sm">
                            <MessageSquare size={16} className="text-gray-400" /> Observaciones de Cierre
                        </div>
                        <div className="bg-white border border-slate-200 p-4 rounded-lg text-sm text-gray-600 italic">
                            {cierre.observaciones || "Sin observaciones."}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <Calendar size={16} className="text-gray-400" /> Fecha de Cierre
                            </h3>
                            <p className="text-sm text-gray-600">{formatDate(cierre.fechaCierre)}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <User size={16} className="text-gray-400" /> Cerrado por
                            </h3>
                            <p className="text-sm text-gray-600">{cierre.usuario?.username}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
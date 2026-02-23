import React from 'react';
import { X, Calendar, Package, User, CheckCircle, Clock } from 'lucide-react';

export default function DetallesSolicitud({ request, onClose }) {
    if (!request) return null;

    // Helper simple para fechas con hora
    const formatDateTime = (dateString) => {
        if (!dateString) return "Pendiente";
        return new Date(dateString).toLocaleString('es-ES');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header del Modal */}
                <div className="bg-[#1C5B5A] px-6 py-4 flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-lg font-bold">Detalle de Solicitud #{request.idSolicitud}</h2>
                        <p className="text-emerald-100 text-xs">Creada el {formatDateTime(request.fecha)}</p>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Cuerpo del Modal */}
                <div className="p-6 overflow-y-auto max-h-[80vh]">

                    {/* Grid de Información Principal */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Producto */}
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-2 mb-3 text-emerald-700 font-semibold text-sm uppercase tracking-wide">
                                <Package size={16} /> Producto
                            </div>
                            <div className="space-y-1">
                                <p className="text-xl font-bold text-slate-800">{request.producto?.nombre}</p>
                                <p className="text-sm text-gray-500">Cantidad: <span className="font-medium text-slate-800">{request.cantidad} unidades</span></p>
                                <p className="text-xs text-gray-400">ID Producto: {request.producto?.idProducto}</p>
                            </div>
                        </div>

                        {/* Prioridad y Estado */}
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-2 mb-3 text-emerald-700 font-semibold text-sm uppercase tracking-wide">
                                <CheckCircle size={16} /> Estado
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Prioridad:</span>
                                    <span className="font-bold text-slate-800">{request.nivelPrioridad?.categoria}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Límite Aprox:</span>
                                    <span className="text-sm text-slate-800">{request.nivelPrioridad?.dias} días</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Estado Actual:</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${request.aprobacion?.estado === 'APROBADA' ? 'bg-emerald-100 text-emerald-700' :
                                            request.aprobacion?.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {request.aprobacion?.estado}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 my-4"></div>

                    {/* Detalles Técnicos / Usuario */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <User size={16} className="text-gray-400" /> Solicitante
                            </h3>
                            <ul className="text-sm space-y-2 text-gray-600">
                                <li><span className="font-medium text-slate-700">Usuario:</span> {request.usuario?.username}</li>
                                <li><span className="font-medium text-slate-700">Sector:</span> {request.usuario?.sector?.nombre}</li>
                                <li><span className="font-medium text-slate-700">ID Usuario:</span> {request.usuario?.idUsuario}</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <Clock size={16} className="text-gray-400" /> Tiempos
                            </h3>
                            <ul className="text-sm space-y-2 text-gray-600">
                                <li><span className="font-medium text-slate-700">Fecha Solicitud:</span> {formatDateTime(request.fecha)}</li>
                                <li><span className="font-medium text-slate-700">Fecha Límite Admisible:</span> {formatDateTime(request.fechaAdmisible)}</li>
                                <li><span className="font-medium text-slate-700">Última Actualización:</span> {formatDateTime(request.aprobacion?.fecha)}</li>
                            </ul>
                        </div>
                    </div>

                </div>

                {/* Footer del Modal */}
                <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>

            </div>
        </div>
    );
}
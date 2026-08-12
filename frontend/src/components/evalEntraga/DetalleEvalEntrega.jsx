import React from 'react';
import { X, Calendar, Building, Package, MessageSquare, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function DetalleEvalEntrega({ evaluacion, onClose }) {
    if (!evaluacion) return null;
    const p = evaluacion.compra?.aprobacionPresupuesto?.presupuesto;
    const reclamo = evaluacion.reclamo;

    const formatDate = (dateString) => {
        if (!dateString) return "No registrada";
        return new Date(dateString + 'T00:00:00').toLocaleDateString('es-ES');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-[#1C5B5A] px-6 py-4 flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-lg font-bold">Evaluación de Entrega #{evaluacion.idEvaluacionEntrega}</h2>
                        <p className="text-emerald-100 text-xs">Compra #{evaluacion.compra?.idCompra}</p>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white p-2 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[80vh]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-2 mb-3 text-emerald-700 font-semibold text-sm uppercase tracking-wide">
                                <Building size={16} /> Proveedor
                            </div>
                            <p className="text-lg font-bold text-slate-800">{p?.proveedor?.nombreEmpresa}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-2 mb-3 text-emerald-700 font-semibold text-sm uppercase tracking-wide">
                                <Package size={16} /> Producto
                            </div>
                            <p className="font-bold text-slate-800">{p?.aprobacionSolicitud?.solicitud?.producto?.nombre}</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2 text-slate-800 font-bold text-sm">
                            <MessageSquare size={16} className="text-gray-400" /> Observaciones
                        </div>
                        <div className="bg-white border border-slate-200 p-4 rounded-lg text-sm text-gray-600 italic">
                            {evaluacion.observaciones || "Sin observaciones."}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <Calendar size={16} className="text-gray-400" /> Fecha de Entrega
                            </h3>
                            <p className="text-sm text-gray-600">{formatDate(evaluacion.fechaEntrega)}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <CheckCircle size={16} className="text-gray-400" /> Resultado
                            </h3>
                            <div className="flex items-center gap-2 text-sm">
                                {evaluacion.cumpleCondiciones ? (
                                    <><CheckCircle size={14} className="text-emerald-500" /> <span className="text-emerald-700 font-bold">Cumple condiciones</span></>
                                ) : (
                                    <><XCircle size={14} className="text-red-500" /> <span className="text-red-700 font-bold">No cumple condiciones</span></>
                                )}
                            </div>
                        </div>
                    </div>

                    {reclamo && (
                        <div className="border-t border-slate-100 pt-4">
                            <div className="flex items-center gap-2 mb-2 text-red-700 font-bold text-sm">
                                <AlertTriangle size={16} /> Reclamo Registrado
                                {!reclamo.activo && (
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded border border-slate-200">
                                        Inactivo
                                    </span>
                                )}
                            </div>
                            <div className="bg-red-50 border border-red-200 p-4 rounded-lg space-y-2">
                                <p className="text-sm text-slate-700">
                                    <span className="font-medium">Fecha del reclamo:</span> {formatDate(reclamo.fechaReclamo)}
                                </p>

                                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                                    <span className="font-medium">Detalle:</span> {reclamo.detalleReclamo || "Sin detalle."}
                                </p>

                                {reclamo.respuestaProveedor && (
                                    <p className="text-sm text-slate-700">
                                        <span className="font-medium">Respuesta del proveedor:</span> {reclamo.respuestaProveedor}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-2 pt-2">
                                    {reclamo.esRecurrente && (
                                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold uppercase rounded border border-orange-200">
                                            Recurrente
                                        </span>
                                    )}
                                    {reclamo.productoRechazado && (
                                        <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded border border-red-200">
                                            Producto rechazado
                                        </span>
                                    )}
                                    {reclamo.entregaNueva && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded border border-blue-200">
                                            Entrega nueva solicitada
                                        </span>
                                    )}
                                </div>

                                {reclamo.entregaNueva && reclamo.satisfechoConNuevaEntrega !== null && (
                                    <p className="text-sm text-slate-700 pt-1">
                                        <span className="font-medium">Satisfecho con nueva entrega:</span>{" "}
                                        {reclamo.satisfechoConNuevaEntrega ? "Sí" : "No"}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
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
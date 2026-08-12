import React from 'react';
import { X, Calendar, Building, Package, FileText, CheckCircle, XCircle } from 'lucide-react';

export default function DetalleCompra({ compra, onClose }) {
    if (!compra) return null;
    const presupuesto = compra.aprobacionPresupuesto?.presupuesto;

    const formatDate = (dateString) => {
        if (!dateString) return "No registrada";
        return new Date(dateString).toLocaleDateString('es-ES');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                <div className="bg-[#1C5B5A] px-6 py-4 flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-lg font-bold">Compra #{compra.idCompra}</h2>
                        <p className="text-emerald-100 text-xs">Registrada por {compra.usuario?.username}</p>
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
                            <p className="text-lg font-bold text-slate-800">{presupuesto?.proveedor?.nombreEmpresa}</p>
                            <p className="text-sm text-gray-500">{presupuesto?.proveedor?.mail}</p>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-2 mb-3 text-emerald-700 font-semibold text-sm uppercase tracking-wide">
                                <Package size={16} /> Producto
                            </div>
                            <p className="font-bold text-slate-800">{presupuesto?.aprobacionSolicitud?.solicitud?.producto?.nombre}</p>
                            <p className="text-sm text-gray-500">Cantidad: {presupuesto?.aprobacionSolicitud?.solicitud?.cantidad}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <Calendar size={16} className="text-gray-400" /> Tiempos
                            </h3>
                            <ul className="text-sm space-y-2 text-gray-600">
                                <li><span className="font-medium text-slate-700">Solicitada:</span> {formatDate(compra.fechaSolicitud)}</li>
                                <li><span className="font-medium text-slate-700">Recibida:</span> {formatDate(compra.fechaRecepcion)}</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <CheckCircle size={16} className="text-gray-400" /> Estado
                            </h3>
                            <ul className="text-sm space-y-2 text-gray-600">
                                <li className="flex items-center gap-2">
                                    {compra.activo ? <CheckCircle size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-slate-400" />}
                                    <span className="font-medium text-slate-700">{compra.activo ? "Activa" : "Inactiva"}</span>
                                </li>
                                <li>
                                    <span className="font-medium text-slate-700">Evaluada:</span> {compra.evaluada ? "Sí" : "No"}
                                </li>
                            </ul>
                        </div>
                    </div>

                    {compra.facturaPdfPath && (
                        <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                            <FileText size={16} /> Factura adjunta: {compra.facturaPdfPath}
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
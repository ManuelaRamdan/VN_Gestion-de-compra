import React, { useState } from 'react';
import { X, Calendar, Building, FileText, CheckCircle, XCircle, Package } from 'lucide-react';
import { obtenerUrlPdf } from '../../services/presupuestoService';

export default function DetalleGrupoPresupuestos({ grupo, onClose }) {
    const { solicitud, presupuestos } = grupo;
    const [error, setError] = useState('');

    const handleVerPdf = async (nombreArchivo) => {
        try {
            const url = await obtenerUrlPdf(nombreArchivo);
            window.open(url, '_blank');
        } catch (err) {
            setError("No se pudo cargar el archivo PDF.");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No registrada';
        const date = dateString.includes('T') ? new Date(dateString) : new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('es-ES');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">

                <div className="px-6 py-4 flex justify-between items-center text-white bg-slate-700">
                    <div>
                        <h3 className="font-bold text-lg">Presupuestos de la Solicitud</h3>
                        <span className="text-xs opacity-80">
                            Solicitud #{solicitud?.idSolicitud} • Producto: {solicitud?.producto?.nombre} ({solicitud?.cantidad} un.)
                        </span>
                    </div>
                    <button onClick={onClose}><X size={20} className="hover:opacity-75" /></button>
                </div>

                <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
                    {error && (
                        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
                    )}

                    <div className="mb-4 text-xs text-gray-500 flex items-center gap-1">
                        <Package size={14} /> {presupuestos.length} de 4 presupuestos posibles cargados
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {presupuestos.map(p => (
                            <div key={p.idPresupuesto} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden flex flex-col">
                                <div className={`absolute top-0 left-0 w-1 h-full ${p.cotizacionSatisfactoria ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>

                                <div className="mb-4">
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                        <Building size={14} /> Proveedor
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-lg leading-tight">{p.proveedor?.nombreEmpresa}</h4>
                                    <p className="text-xs text-gray-500 mt-1">{p.proveedor?.mail}</p>
                                </div>

                                <div className="space-y-3 text-sm text-slate-600 mb-2">
                                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-md border border-slate-100">
                                        <Calendar size={16} className="text-gray-400 shrink-0" />
                                        <span className="text-xs">Recibido: <b className="text-slate-700">{formatDate(p.fechaRecepcion)}</b></span>
                                    </div>

                                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-md border border-slate-100">
                                        {p.cotizacionSatisfactoria ? (
                                            <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                                        ) : (
                                            <XCircle size={16} className="text-gray-400 shrink-0" />
                                        )}
                                        <span className="text-xs">
                                            Estado: <b className={p.cotizacionSatisfactoria ? 'text-emerald-700' : 'text-slate-700'}>
                                                {p.cotizacionSatisfactoria ? "Satisfactoria" : "No satisfactoria / Pendiente"}
                                            </b>
                                        </span>
                                    </div>

                                    {p.observaciones && (
                                        <div className="mt-2 text-xs italic text-slate-500 bg-yellow-50/50 p-2 border-l-2 border-yellow-300">
                                            "{p.observaciones}"
                                        </div>
                                    )}

                                    {p.archivoPdfPath && (
                                        <div
                                            className="flex items-center gap-2 text-blue-600 font-bold text-xs cursor-pointer hover:underline pt-2"
                                            onClick={() => handleVerPdf(p.archivoPdfPath)}
                                        >
                                            <FileText size={14} /> Ver PDF Cotización adjunta
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 bg-white border-t border-slate-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-all"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
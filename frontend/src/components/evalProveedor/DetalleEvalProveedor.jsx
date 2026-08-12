import React from 'react';
import { X, Building, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

export default function DetalleEvalProveedor({ evaluacion, onClose }) {
    if (!evaluacion) return null;

    const criterios = [
        ['Calidad del producto', evaluacion.calidadproducto],
        ['Cumplimiento de plazos', evaluacion.cumplimientoplazos],
        ['Atención al cliente', evaluacion.atencioncliente],
        ['Respuesta a reclamos', evaluacion.respuestareclamos],
        ['Precio del servicio', evaluacion.precioservicio],
        ['Gestión administrativa', evaluacion.gestionadministrativa],
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-[#1C5B5A] px-6 py-4 flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Building size={18} /> {evaluacion.proveedor?.nombreEmpresa}
                        </h2>
                        <p className="text-emerald-100 text-xs">Período {evaluacion.periodoEvaluado}</p>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white p-2 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[80vh]">
                    <div className="mb-6 flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <span className="text-sm font-medium text-slate-700">Resultado final</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-slate-800">{evaluacion.resultado}%</span>
                            {evaluacion.aprobado ? (
                                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded"><CheckCircle size={12} /> Aprobado</span>
                            ) : (
                                <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded"><XCircle size={12} /> No aprobado</span>
                            )}
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-slate-800 mb-3">Criterios de evaluación</h3>
                        <div className="space-y-2">
                            {criterios.map(([label, valor]) => (
                                <div key={label} className="flex justify-between text-sm border-b border-slate-50 pb-2">
                                    <span className="text-slate-600">{label}</span>
                                    <span className="font-medium text-slate-800">{valor}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2 text-slate-800 font-bold text-sm">
                            <MessageSquare size={16} className="text-gray-400" /> Comentarios
                        </div>
                        <div className="bg-white border border-slate-200 p-4 rounded-lg text-sm text-gray-600 italic">
                            {evaluacion.comentarios || "Sin comentarios."}
                        </div>
                    </div>

                    <p className="text-xs text-gray-400">Firmado por: {evaluacion.firmaResponsable}</p>
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
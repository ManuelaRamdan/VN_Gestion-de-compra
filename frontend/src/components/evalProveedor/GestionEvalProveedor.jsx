import React, { useEffect, useState } from "react";
// CORRECCIÓN: Agregado icono FileText para el PDF
import { ArrowLeft, Plus, Pencil, X, Check, AlertCircle, CheckCircle, FileText } from "lucide-react";
import {
    crearEvaluacion,
    modificarEvaluacionProveedor,
    buscarPorProveedor,
    descargarEvaluacionPdf // CORRECCIÓN: Importar función de descarga
} from "../../services/evalProveedorService";
import Loading from "../Loading";

export default function GestionEvalProveedor({ proveedor, onBack, onSaved }) {
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [evaluacion, setEvaluacion] = useState(null);

    // Estados de Feedback
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [modalError, setModalError] = useState("");

    const initialForm = {
        servicioProducto: "",
        periodoEvaluado: new Date().getFullYear(),
        proveedorsgc: false,
        comentarios: "",
        calidadproducto: "BUENO",
        cumplimientoplazos: "BUENO",
        atencioncliente: "BUENO",
        respuestareclamos: "BUENO",
        precioservicio: "BUENO",
        gestionadministrativa: "BUENO",
    };

    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        if (proveedor) cargar();
    }, [proveedor]);

    const cargar = async () => {
        try {
            setLoading(true);
            const res = await buscarPorProveedor(proveedor.nombreEmpresa);
            const data = res.data?.contenido?.[0];

            if (data) {
                setEvaluacion(data);
                setEditingId(data.idEvalProveedor);
                setFormData({
                    servicioProducto: data.servicioProducto,
                    periodoEvaluado: data.periodoEvaluado,
                    proveedorsgc: data.proveedorsgc,
                    comentarios: data.comentarios || "",
                    calidadproducto: data.calidadproducto,
                    cumplimientoplazos: data.cumplimientoplazos,
                    atencioncliente: data.atencioncliente,
                    respuestareclamos: data.respuestareclamos,
                    precioservicio: data.precioservicio,
                    gestionadministrativa: data.gestionadministrativa,
                });
            }
        } catch (e) {
            console.error(e);
            setError("No se pudo cargar la evaluación del proveedor.");
        } finally {
            setLoading(false);
        }
    };

    // --- NUEVO: FUNCIÓN DE DESCARGA ---
    const handleDescargar = async () => {
        if (!evaluacion) return;
        try {
            await descargarEvaluacionPdf(evaluacion.idEvalProveedor);
        } catch (e) {
            console.error(e);
            setError("No se pudo generar el archivo PDF.");
        }
    };

    const handleOpenModal = () => {
        setModalError("");
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalError("");
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        setModalError("");

        try {
            const payload = {
                ...formData,
                periodoEvaluado: Number(formData.periodoEvaluado),
                proveedor: { idProveedor: proveedor.idProveedor },
                usuario: { idUsuario: 1 } 
            };

            if (editingId) {
                await modificarEvaluacionProveedor(editingId, payload);
            } else {
                await crearEvaluacion({
                    ...payload,
                    idProveedor: proveedor.idProveedor,
                });
            }

            setShowModal(false);
            await cargar(); 
            setSuccess(editingId ? "Evaluación actualizada correctamente" : "Evaluación registrada correctamente");
            onSaved?.();
            setTimeout(() => setSuccess(""), 3500);

        } catch (error) {
            const msg = error.response?.data?.error || error.message || "Error al guardar la evaluación";
            setModalError(msg);
        }
    };

    if (loading) return <Loading fullScreen />;

    return (
        <div className="animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-white rounded-full text-slate-500 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Evaluación del Proveedor</h2>
                        <p className="text-sm text-gray-500">{proveedor?.nombreEmpresa}</p>
                    </div>
                </div>

                {success && (
                    <div className="bg-emerald-100 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-2">
                        <CheckCircle size={16} /> {success}
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-200">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* TARJETA */}
            {evaluacion ? (
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative w-full max-w-md hover:shadow-md transition-shadow">
                    
                    {/* BOTONES DE ACCIÓN */}
                    <div className="absolute top-4 right-4 flex gap-2">
                        {/* NUEVO: BOTÓN DESCARGAR PDF */}
                        <button
                            onClick={handleDescargar}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Descargar Planilla PDF"
                        >
                            <FileText size={20} />
                        </button>

                        <button
                            onClick={handleOpenModal}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Editar evaluación"
                        >
                            <Pencil size={20} />
                        </button>
                    </div>

                    <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Resumen de Evaluación</h3>

                    <div className="space-y-3 text-sm text-slate-600">
                        <div className="flex justify-between">
                            <span className="font-medium">Periodo Evaluado:</span>
                            <span>{evaluacion.periodoEvaluado}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Resultado Final:</span>
                            <span className={`font-bold ${evaluacion.resultado >= 70 ? 'text-emerald-600' : 'text-orange-500'}`}>
                                {evaluacion.resultado}%
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-medium">Estado:</span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${evaluacion.aprobado ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {evaluacion.aprobado ? "APROBADO" : "NO APROBADO"}
                            </span>
                        </div>
                        
                        {evaluacion.comentarios && (
                            <div className="mt-4 pt-3 border-t border-slate-50">
                                <span className="block text-xs font-bold text-gray-400 mb-1 uppercase">Comentarios</span>
                                <p className="italic text-slate-500 bg-slate-50 p-2 rounded">{evaluacion.comentarios}</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <button
                    onClick={handleOpenModal}
                    className="w-full max-w-md border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/30 transition-all gap-3"
                >
                    <div className="bg-slate-100 p-4 rounded-full group-hover:bg-emerald-100 transition-colors">
                        <Plus size={32} />
                    </div>
                    <div className="font-medium text-lg">Registrar Primera Evaluación</div>
                    <p className="text-xs text-gray-400">Evalúa el desempeño de este proveedor</p>
                </button>
            )}

            {/* ================= MODAL ================= */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in p-4">
                    <div className="bg-white w-full max-w-xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col animate-in zoom-in-95">

                        {/* HEADER */}
                        <div className="bg-[#1C5B5A] text-white px-6 py-4 flex justify-between items-center rounded-t-xl">
                            <h3 className="font-bold text-lg">
                                {editingId ? "Modificar" : "Nueva"} Evaluación
                            </h3>
                            <button onClick={handleCloseModal} className="hover:text-emerald-200 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* BODY CON SCROLL */}
                        <form
                            onSubmit={handleGuardar}
                            className="p-6 space-y-5 overflow-y-auto custom-scrollbar"
                        >
                            {/* Error del Modal */}
                            {modalError && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-200">
                                    <AlertCircle size={16} /> {modalError}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Servicio / Producto</label>
                                    <input
                                        placeholder="Ej: Insumos oficina"
                                        className="w-full border border-slate-300 p-2 rounded-lg text-sm outline-none focus:border-emerald-500 transition-colors"
                                        value={formData.servicioProducto}
                                        onChange={(e) => setFormData({ ...formData, servicioProducto: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Periodo</label>
                                    <input
                                        type="number"
                                        placeholder="Año"
                                        className="w-full border border-slate-300 p-2 rounded-lg text-sm outline-none focus:border-emerald-500 transition-colors"
                                        value={formData.periodoEvaluado}
                                        onChange={(e) => setFormData({ ...formData, periodoEvaluado: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    ["calidadproducto", "Calidad"],
                                    ["cumplimientoplazos", "Cumplimiento Plazos"],
                                    ["atencioncliente", "Atención al Cliente"],
                                    ["respuestareclamos", "Respuesta a Reclamos"],
                                    ["precioservicio", "Precio / Servicio"],
                                    ["gestionadministrativa", "Gestión Administrativa"],
                                ].map(([key, label]) => (
                                    <div key={key}>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
                                        <select
                                            className="w-full border border-slate-300 p-2 rounded-lg text-sm bg-white outline-none focus:border-emerald-500 transition-colors"
                                            value={formData[key]}
                                            onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                        >
                                            <option value="malo">MALO</option>
                                            <option value="regular">REGULAR</option>
                                            <option value="bueno">BUENO</option>
                                            <option value="muybueno">MUY BUENO</option>
                                        </select>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Comentarios Adicionales</label>
                                <textarea
                                    placeholder="Observaciones sobre el desempeño..."
                                    className="w-full border border-slate-300 p-2 rounded-lg text-sm outline-none resize-none h-20 focus:border-emerald-500 transition-colors"
                                    value={formData.comentarios}
                                    onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-1 py-2.5 bg-[#1C5B5A] text-white rounded-lg font-medium hover:bg-[#164a49] shadow-md transition-all flex items-center justify-center gap-2"
                                >
                                    <Check size={18}/> Guardar Evaluación
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
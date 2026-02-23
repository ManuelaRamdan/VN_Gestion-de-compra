import React, { useEffect, useState } from "react";
import { ArrowLeft, Plus, Pencil, X, Calendar, CheckCircle, AlertTriangle, AlertCircle, Check, Lock, ThumbsUp } from "lucide-react"; 
import {
    buscarEvaluacionPorCompra,
    crearEvaluacion,
    modificarEvaluacion,
    getReclamoPorEvaluacion,
    crearReclamo,
    modificarReclamo
} from "../../services/evalEntregaService";
import Loading from "../Loading";

export default function GestionEntrega({ compra, onBack }) {
    const [evaluacion, setEvaluacion] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [mostrarReclamo, setMostrarReclamo] = useState(false); 
    const [reclamoId, setReclamoId] = useState(null);

    const [error, setError] = useState("");        
    const [success, setSuccess] = useState("");    
    const [modalError, setModalError] = useState(""); 
    const [reclamoError, setReclamoError] = useState(""); 

    const initialForm = {
        fechaEntrega: new Date().toISOString().split("T")[0],
        observaciones: "",
        cumpleCondiciones: true,
    };

    const initialReclamo = {
        fechaReclamo: new Date().toISOString().split("T")[0],
        detalleReclamo: "",
        respuestaProveedor: "",
        esRecurrente: false,
        productoRechazado: false,
        entregaNueva: false,
        satisfechoConNuevaEntrega: false,
    };

    const [formData, setFormData] = useState(initialForm);
    const [reclamoForm, setReclamoForm] = useState(initialReclamo);

    useEffect(() => {
        cargarTodo();
    }, [compra]);

    const formatearFecha = (fechaString) => {
        if (!fechaString) return "-";
        const [anio, mes, dia] = fechaString.split('-'); 
        return `${dia}/${mes}/${anio}`;
    };

    const cargarTodo = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await buscarEvaluacionPorCompra(compra.idCompra);
            const evalData = res.data;
            setEvaluacion(evalData);

            try {
                // Buscamos SOLO reclamos activos (el backend filtra activo=true)
                const r = await getReclamoPorEvaluacion(evalData.idEvaluacionEntrega);
                setReclamoId(r.data.idReclamo);
                setReclamoForm({
                    fechaReclamo: r.data.fechaReclamo,
                    detalleReclamo: r.data.detalleReclamo,
                    respuestaProveedor: r.data.respuestaProveedor || "",
                    esRecurrente: r.data.esRecurrente || false,
                    productoRechazado: r.data.productoRechazado || false,
                    entregaNueva: r.data.entregaNueva || false,
                    satisfechoConNuevaEntrega: r.data.satisfechoConNuevaEntrega || false,
                });
                setMostrarReclamo(false);
            } catch (err) {
                // Si no hay reclamo activo (o se dio de baja), limpiamos el estado
                setReclamoId(null);
                setReclamoForm(initialReclamo);
                setMostrarReclamo(false);
            }

        } catch (err) {
            if(err.response && err.response.status !== 404) {
                 setError("Error al cargar datos.");
            }
            setEvaluacion(null);
            setReclamoId(null);
        } finally {
            setLoading(false);
        }
    };

    const triggerSuccess = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(""), 3500);
    };

    // --- LÓGICA DE BLOQUEO CORREGIDA ---
    
    // 1. Bloqueo duro: Solo si hay un Cierre Administrativo (Campo 'cerrada' del backend)
    const isGlobalLocked = evaluacion?.cerrada === true;
    
    // 2. Bloqueo Evaluación:
    //    - Si está cerrado globalmente -> BLOQUEADO
    //    - Si hay reclamo activo Y la evaluación dice "No conforme" -> BLOQUEADO (Para obligar a resolver el reclamo)
    //    - PERO: Si quieres corregir la evaluación para poner "Conforme" (y borrar el reclamo), DEBERÍAS poder editar.
    //    --> Por eso, relajamos el bloqueo aquí: solo bloqueamos si está CERRADA globalmente.
    const isEvaluacionLocked = isGlobalLocked; 

    // 3. Bloqueo Reclamo:
    //    - Antes bloqueabas si había respuesta del proveedor. AHORA LO QUITAMOS para que puedas editar.
    const isReclamoLocked = isGlobalLocked; 


    const handleGuardarEvaluacion = async (e) => {
        e.preventDefault();
        setModalError("");

        if (isEvaluacionLocked) return; 

        try {
            const dataToSend = {
                idCompra: compra.idCompra,
                fechaEntrega: formData.fechaEntrega,
                cumpleCondiciones: formData.cumpleCondiciones, // Si esto es true, el backend borrará el reclamo
                observaciones: formData.observaciones,
            };

            if (editingId) {
                await modificarEvaluacion(editingId, dataToSend);
                triggerSuccess("Evaluación actualizada correctamente");
            } else {
                await crearEvaluacion(dataToSend);
                triggerSuccess("Evaluación creada correctamente");
            }

            setShowModal(false);
            setEditingId(null);
            setFormData(initialForm);
            await cargarTodo(); // Al recargar, si pusiste "Conforme", el reclamo desaparecerá visualmente

        } catch (error) {
            const msg = error.response?.data?.error || error.message || "Error al guardar evaluación";
            setModalError(msg);
        }
    };

    const handleGuardarReclamo = async (e) => {
        e.preventDefault();
        setReclamoError("");
    
        // Si el formulario está visible, permitimos guardar incluso si isReclamoLocked es true
        // para poder realizar la reactivación o cierre del caso.
        
        try {
            // Construimos el objeto respetando la estructura de la entidad Reclamo del Backend
            const data = {
                fechaReclamo: reclamoForm.fechaReclamo,
                detalleReclamo: reclamoForm.detalleReclamo,
                // Enviamos null si el string está vacío para los ENUMs o campos opcionales
                respuestaProveedor: reclamoForm.respuestaProveedor === "" ? null : reclamoForm.respuestaProveedor,
                esRecurrente: reclamoForm.esRecurrente,
                productoRechazado: reclamoForm.productoRechazado,
                entregaNueva: reclamoForm.entregaNueva,
                satisfechoConNuevaEntrega: reclamoForm.entregaNueva ? reclamoForm.satisfechoConNuevaEntrega : null,
                idEvaluacionEntrega: evaluacion.idEvaluacionEntrega,
                // CORRECCIÓN CLAVE: El backend espera un objeto evaluacionEntrega para obtener el ID
                evaluacionEntrega: {
                    idEvaluacionEntrega: evaluacion.idEvaluacionEntrega
                }
            };
    
            if (reclamoId) {
                // Actualización de reclamo existente
                await modificarReclamo(reclamoId, data);
                triggerSuccess("Reclamo actualizado correctamente");
            } else {
                // Creación de nuevo reclamo (o reactivación si el backend usa la lógica de reciclaje)
                await crearReclamo(data);
                triggerSuccess("Reclamo generado correctamente");
            }
    
            // Recargamos los datos para actualizar la vista y ocultar el formulario
            await cargarTodo(); 
    
        } catch (error) {
            console.error("Error al guardar reclamo:", error);
            const msg = error.response?.data?.error || error.message || "Error al guardar reclamo";
            setReclamoError(msg);
        }
    };

    //if (loading) return <Loading fullScreen />;

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
                            Evaluación de Entrega
                            {isGlobalLocked && (
                                <span className="px-2 py-0.5 bg-gray-800 text-white text-xs font-bold uppercase rounded flex items-center gap-1 shadow-sm">
                                    <Lock size={10}/> Caso Cerrado
                                </span>
                            )}
                        </h2>
                        <p className="text-sm text-gray-500">Compra #{compra.idCompra}</p>
                    </div>
                </div>
            </div>

            {/* Aviso de Bloqueo Global */}
            {isGlobalLocked && (
                <div className="mb-6 bg-gray-50 text-gray-700 p-3 rounded-lg text-sm flex items-center gap-2 border border-gray-200">
                    <Lock size={16} />
                    <span>
                        <strong>Proceso Finalizado:</strong> Este caso ha sido cerrado administrativamente.
                    </span>
                </div>
            )}

            {/* Mensajes */}
            {error && (
                <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-200">
                    <AlertCircle size={16} /> {error}
                    <button onClick={() => setError("")} className="ml-auto hover:text-red-800"><X size={14}/></button>
                </div>
            )}
            {success && (
                <div className="mb-6 bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm flex items-center gap-2 border border-emerald-200">
                    <Check size={16} /> <span className="font-medium">{success}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* --- COLUMNA 1: EVALUACIÓN --- */}
                <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase mb-3 flex justify-between items-center">
                        Evaluación Inicial
                    </h3>
                    {evaluacion ? (
                        <div className={`bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative ${isEvaluacionLocked ? 'opacity-80' : ''}`}>
                            <button
                                onClick={() => {
                                    if (!isEvaluacionLocked) {
                                        setEditingId(evaluacion.idEvaluacionEntrega);
                                        setFormData({
                                            fechaEntrega: evaluacion.fechaEntrega,
                                            observaciones: evaluacion.observaciones || "",
                                            cumpleCondiciones: evaluacion.cumpleCondiciones,
                                        });
                                        setModalError("");
                                        setShowModal(true);
                                    }
                                }}
                                disabled={isEvaluacionLocked}
                                className={`absolute top-3 right-3 transition-colors ${
                                    isEvaluacionLocked 
                                        ? 'text-slate-300 cursor-not-allowed' 
                                        : 'text-slate-400 hover:text-blue-600'
                                }`}
                            >
                                {isEvaluacionLocked ? <Lock size={16} /> : <Pencil size={16} />}
                            </button>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-slate-700">
                                    <Calendar size={18} className="text-slate-400" />
                                    <span className="font-bold">{formatearFecha(evaluacion.fechaEntrega)}</span>
                                </div>

                                <div className={`flex items-center gap-2 font-medium ${evaluacion.cumpleCondiciones ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {evaluacion.cumpleCondiciones ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                                    {evaluacion.cumpleCondiciones ? "Entrega Conforme" : "Entrega No Conforme"}
                                </div>

                                {evaluacion.observaciones ? (
                                    <div className="bg-slate-50 p-3 rounded-lg text-gray-600 italic text-sm border border-slate-100">
                                        "{evaluacion.observaciones}"
                                    </div>
                                ) : (
                                    <span className="text-xs text-gray-400">Sin observaciones.</span>
                                )}
                            </div>
                        </div>
                    ) : (
                        !isGlobalLocked && (
                            <button
                                onClick={() => {
                                    setEditingId(null);
                                    setFormData(initialForm);
                                    setModalError("");
                                    setShowModal(true);
                                }}
                                className="w-full border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all gap-2"
                            >
                                <Plus size={24} className="bg-slate-100 p-1 rounded-full mb-1" />
                                <span className="font-medium">Registrar Evaluación</span>
                            </button>
                        )
                    )}
                </div>

                {/* --- COLUMNA 2: RECLAMO --- */}
                {evaluacion && (
                    <div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase mb-3 flex justify-between items-center">
                            Estado del Reclamo
                        </h3>
                        
                        {/* SI CUMPLE CONDICIONES: MENSAJE DE ÉXITO */}
                        {evaluacion.cumpleCondiciones ? (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-8 flex flex-col items-center justify-center text-center animate-in fade-in h-full">
                                <div className="bg-white p-3 rounded-full mb-3 shadow-sm border border-emerald-50">
                                    <ThumbsUp size={30} className="text-emerald-500" />
                                </div>
                                <h4 className="text-emerald-800 font-bold mb-1">Entrega Exitosa</h4>
                                <p className="text-sm text-emerald-600">
                                    La entrega cumple con las condiciones acordadas.<br/>
                                    No es necesario generar reclamos.
                                </p>
                            </div>
                        ) : (
                            /* SI NO CUMPLE: GESTIÓN DE RECLAMOS */
                            <>
                                {reclamoId && !mostrarReclamo ? (
                                    <div className={`bg-white border border-red-100 rounded-xl p-5 shadow-sm relative animate-in fade-in ${isReclamoLocked ? 'opacity-80' : ''}`}>
                                        <button
                                            onClick={() => {
                                                if (!isReclamoLocked) {
                                                    setReclamoError("");
                                                    setMostrarReclamo(true);
                                                }
                                            }}
                                            disabled={isReclamoLocked}
                                            className={`absolute top-3 right-3 transition-colors ${
                                                isReclamoLocked 
                                                    ? 'text-slate-300 cursor-not-allowed' 
                                                    : 'text-slate-400 hover:text-blue-600'
                                            }`}
                                        >
                                            {isReclamoLocked ? <Lock size={16} /> : <Pencil size={16} />}
                                        </button>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold uppercase">Reclamo #{reclamoId}</span>
                                                <span className="text-sm text-gray-500">{formatearFecha(reclamoForm.fechaReclamo)}</span>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Motivo</p>
                                                <p className="text-sm text-slate-800 bg-red-50 p-3 rounded-lg border border-red-50">{reclamoForm.detalleReclamo}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {reclamoForm.esRecurrente && <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">Recurrente</span>}
                                                {reclamoForm.productoRechazado && <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Producto Rechazado</span>}
                                            </div>
                                            <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                                                <span className="text-sm text-gray-500 font-medium">Respuesta Proveedor:</span>
                                                <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                                                    reclamoForm.respuestaProveedor === 'POSITIVA' ? 'bg-emerald-100 text-emerald-700' :
                                                    reclamoForm.respuestaProveedor === 'NEGATIVA' ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {reclamoForm.respuestaProveedor || "PENDIENTE"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    (mostrarReclamo || (!reclamoId && !isGlobalLocked)) && (
                                        mostrarReclamo ? (
                                            <form onSubmit={handleGuardarReclamo} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-md animate-in slide-in-from-bottom-2">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="font-bold text-slate-800">{reclamoId ? "Editar Reclamo" : "Nuevo Reclamo"}</h4>
                                                    <button type="button" onClick={() => setMostrarReclamo(false)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
                                                </div>
                                                {reclamoError && <div className="bg-red-50 text-red-600 p-2 rounded text-sm"><AlertCircle size={16} className="inline mr-1"/>{reclamoError}</div>}
                                                
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha</label>
                                                        <input type="date" required value={reclamoForm.fechaReclamo} onChange={(e) => setReclamoForm({ ...reclamoForm, fechaReclamo: e.target.value })} className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-emerald-500" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Respuesta</label>
                                                        <select value={reclamoForm.respuestaProveedor} onChange={(e) => setReclamoForm({ ...reclamoForm, respuestaProveedor: e.target.value })} className="w-full border border-slate-300 rounded p-2 text-sm bg-white">
                                                            <option value="">-- Sin respuesta --</option>
                                                            <option value="PENDIENTE">Pendiente</option>
                                                            <option value="POSITIVA">Positiva</option>
                                                            <option value="NEGATIVA">Negativa</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Detalle</label>
                                                    <textarea required rows={3} value={reclamoForm.detalleReclamo} onChange={(e) => setReclamoForm({ ...reclamoForm, detalleReclamo: e.target.value })} className="w-full border border-slate-300 rounded p-2 text-sm resize-none" placeholder="Motivo del reclamo..." />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"><input type="checkbox" checked={reclamoForm.esRecurrente} onChange={(e) => setReclamoForm({ ...reclamoForm, esRecurrente: e.target.checked })} className="accent-emerald-600" /> Es recurrente</label>
                                                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"><input type="checkbox" checked={reclamoForm.productoRechazado} onChange={(e) => setReclamoForm({ ...reclamoForm, productoRechazado: e.target.checked })} className="accent-emerald-600" /> Producto rechazado</label>
                                                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"><input type="checkbox" checked={reclamoForm.entregaNueva} onChange={(e) => setReclamoForm({ ...reclamoForm, entregaNueva: e.target.checked })} className="accent-emerald-600" /> Hubo nueva entrega</label>
                                                    {reclamoForm.entregaNueva && (
                                                        <div className="pl-6 pt-1 animate-in fade-in">
                                                            <label className="flex items-center gap-2 text-sm font-medium text-emerald-700 cursor-pointer"><input type="checkbox" checked={reclamoForm.satisfechoConNuevaEntrega} onChange={(e) => setReclamoForm({ ...reclamoForm, satisfechoConNuevaEntrega: e.target.checked })} className="accent-emerald-600" /> ¿Satisfecho con el cambio?</label>
                                                        </div>
                                                    )}
                                                </div>
                                                <button type="submit" className="w-full py-2 bg-[#1C5B5A] text-white rounded text-sm font-medium hover:bg-[#164a49]">Guardar</button>
                                            </form>
                                        ) : (
                                            <button onClick={() => { setReclamoError(""); setMostrarReclamo(true); }} className="w-full border-2 border-dashed border-red-200 bg-red-50/50 rounded-xl p-8 flex flex-col items-center justify-center text-red-400 hover:border-red-400 hover:text-red-600 hover:bg-red-50 transition-all gap-2">
                                                <AlertTriangle size={24} className="bg-white border border-red-100 p-1 rounded-full"/>
                                                <span className="font-medium">Generar Reclamo</span>
                                            </button>
                                        )
                                    )
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Evaluación (Omitido por brevedad, es igual al anterior) */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 animate-in fade-in">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl animate-in zoom-in-95">
                        <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100">
                            <h3 className="font-bold text-lg text-slate-800">{editingId ? "Modificar Evaluación" : "Registrar Evaluación"}</h3>
                            <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
                        </div>
                        <form onSubmit={handleGuardarEvaluacion} className="p-6 space-y-4">
                            {modalError && <div className="bg-red-50 text-red-600 p-2 rounded text-sm"><AlertCircle size={16} className="inline mr-1"/>{modalError}</div>}
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha de Entrega</label><input type="date" required value={formData.fechaEntrega} onChange={(e) => setFormData({ ...formData, fechaEntrega: e.target.value })} className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-emerald-500" /></div>
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Observaciones</label><textarea rows={3} value={formData.observaciones} onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })} className="w-full border border-slate-300 rounded p-2 text-sm outline-none resize-none focus:border-emerald-500" /></div>
                            <div className="bg-slate-50 p-3 rounded border border-slate-100"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.cumpleCondiciones} onChange={(e) => setFormData({ ...formData, cumpleCondiciones: e.target.checked })} className="accent-emerald-600 w-5 h-5" /><span className="text-sm font-medium text-slate-700">Cumple las condiciones acordadas</span></label></div>
                            <button className="w-full py-2.5 bg-[#1C5B5A] text-white rounded font-medium hover:bg-[#164a49]">Guardar Evaluación</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}


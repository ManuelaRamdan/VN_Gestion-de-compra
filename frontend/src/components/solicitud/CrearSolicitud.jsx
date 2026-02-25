import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { ArrowLeft, Package, AlertCircle, Check } from 'lucide-react';
import { listarProductos, listarPrioridades, crearSolicitud } from '../../services/solicitudService';
import { useAuth } from '../../context/AuthContext';

export default function CrearSolicitud() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Estados para datos del formulario
    const [formData, setFormData] = useState({
        idProducto: "",
        cantidad: 1,
        idNivelPrioridad: "",
        fechaAdmisible: "",
        comentarios: ""
    });

    // Estados para listas y UI
    const [productos, setProductos] = useState([]);
    const [prioridades, setPrioridades] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados para feedback (Error y Éxito)
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Cargar listas al iniciar
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [resProd, resPrio] = await Promise.all([listarProductos(), listarPrioridades()]);
                setProductos(resProd.data?.contenido || []);
                setPrioridades(resPrio.data?.contenido || []);
            } catch (err) {
                console.error("Error cargando listas", err);
                setError("Error cargando productos o prioridades.");
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            // Validaciones básicas
            if (!formData.idProducto || !formData.idNivelPrioridad) {
                setError("Por favor completa todos los campos obligatorios.");
                return;
            }

            const payload = {
                cantidad: parseInt(formData.cantidad),
                idProducto: parseInt(formData.idProducto),
                idNivelPrioridad: parseInt(formData.idNivelPrioridad),
                idUsuario: user.idUsuario,
                comentarios: formData.comentarios
            };

            await crearSolicitud(payload);

            // --- ÉXITO ---
            setSuccess("¡Solicitud creada exitosamente! Redirigiendo...");

            // Esperamos 2 segundos para que el usuario lea el mensaje y luego navegamos
            setTimeout(() => {
                navigate('/solicitudes');
            }, 2000);

        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.error || "Hubo un error al crear la solicitud.";
            setError(msg);
        }
    };

    return (
        <Layout>
            {/* Se asegura w-full y un padding lateral consistente para que no choque con los bordes del celular */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 w-full pb-8">

                {/* Header con botón Volver */}
                <div className="mb-6 flex items-center gap-4 mt-4 sm:mt-0">
                    <button
                        onClick={() => navigate('/solicitudes')}
                        className="p-2 rounded-full hover:bg-white hover:shadow-sm transition-all text-gray-500 flex-shrink-0"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Nueva Solicitud de Compra</h1>
                    </div>
                </div>

                {/* Tarjeta Principal del Formulario */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-8">

                    {/* Barra de Progreso Visual */}
                    <div className="flex border-b border-slate-100">
                        <div className="px-4 sm:px-6 py-3 border-b-2 border-[#1C5B5A] text-[#1C5B5A] text-sm font-semibold flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#1C5B5A] text-white flex items-center justify-center text-xs">1</span>
                            Crear Solicitud
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8">

                        {/* Mensaje de Error */}
                        {error && (
                            <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2 border border-red-200 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle size={16} className="flex-shrink-0" /> {error}
                            </div>
                        )}

                        {/* Mensaje de Éxito */}
                        {success && (
                            <div className="mb-6 bg-emerald-50 text-emerald-700 p-3 rounded-md text-sm flex items-center gap-2 border border-emerald-200 animate-in fade-in slide-in-from-top-2">
                                <Check size={16} className="flex-shrink-0" />
                                <span className="font-medium">{success}</span>
                            </div>
                        )}

                        {/* 1. Selección de Producto */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Buscar Producto del Catálogo
                            </label>
                            <div className="relative">
                                <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <select
                                    name="idProducto"
                                    value={formData.idProducto}
                                    onChange={handleChange}
                                    // Se agrega w-full y truncate para que el texto largo no rompa el select
                                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none truncate"
                                >
                                    <option value="">Selecciona un producto...</option>
                                    {productos.map(prod => (
                                        <option key={prod.idProducto} value={prod.idProducto}>
                                            {prod.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-6 w-full">
                            {/* 2. Cantidad */}
                            <div className="w-full">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Cantidad</label>
                                {/* SOLUCIÓN PRINCIPAL: flex items-stretch y flex-1 en el input */}
                                <div className="flex items-stretch w-full">
                                    <input
                                        type="number"
                                        name="cantidad"
                                        min="1"
                                        value={formData.cantidad}
                                        onChange={handleChange}
                                        // flex-1 permite que el input tome el espacio restante sin empujar al span hacia afuera
                                        className="flex-1 min-w-0 px-4 py-2.5 bg-slate-50 border border-slate-200 border-r-0 rounded-l-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                    <span className="bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-r-lg text-gray-500 text-sm whitespace-nowrap flex items-center">
                                        Unidades
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Prioridad (Radio Buttons) */}
                        <div className="mb-8 w-full">
                            <label className="block text-sm font-semibold text-slate-700 mb-3">Nivel de Prioridad</label>
                            {/* SOLUCIÓN: Cambiar flex por un grid. Esto fuerza a que se apilen 1 sobre otro en móvil (grid-cols-1) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {prioridades.map(prio => (
                                    <label
                                        key={prio.idNivelPrioridad}
                                        className={`
                                            flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all w-full
                                            ${formData.idNivelPrioridad == prio.idNivelPrioridad
                                                ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500'
                                                : 'border-slate-200 hover:border-emerald-300 bg-white'
                                            }
                                        `}
                                    >
                                        <input
                                            type="radio"
                                            name="idNivelPrioridad"
                                            value={prio.idNivelPrioridad}
                                            checked={formData.idNivelPrioridad == prio.idNivelPrioridad}
                                            onChange={handleChange}
                                            className="accent-emerald-600 w-4 h-4 flex-shrink-0"
                                        />
                                        <span className="text-sm font-medium text-slate-700">
                                            {prio.categoria}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div>
                                <label
                                    className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                    Comentarios
                                </label>
                                <textarea
                                    rows={3}
                                    name="comentarios" /* Agregamos el name para usar handleChange */
                                    value={formData.comentarios} /* Todo en minúscula */
                                    onChange={handleChange} /* Usamos la función genérica */
                                    className="w-full border border-slate-300 rounded p-2 text-sm outline-none resize-none focus:border-emerald-500"
                                /></div>
                        </div>

                        {/* 4. Botones del Footer */}
                        {/* El w-full en los botones funciona perfectamente ahora que el input no está "estirando" el contenedor padre */}
                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 border-t border-slate-100 pt-6">
                            <button
                                type="button"
                                onClick={() => navigate('/solicitudes')}
                                className="w-full sm:w-auto px-6 py-2.5 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors text-center"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={!!success}
                                className={`w-full sm:w-auto px-6 py-2.5 bg-[#1C5B5A] text-white rounded-lg font-medium hover:bg-[#164a49] transition-colors flex items-center justify-center gap-2 shadow-sm ${success ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {success ? 'Guardado' : 'Crear Solicitud'} <Check size={18} />
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </Layout>
    );
}
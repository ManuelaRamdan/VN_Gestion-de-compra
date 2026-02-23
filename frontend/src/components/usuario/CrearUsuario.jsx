import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import { registrarUsuario, listarSectores } from '../../services/usuarioService';
import { ArrowLeft, User, AlertCircle, Check } from 'lucide-react';

export default function CrearUsuario() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        idSector: ""
    });

    const [sectores, setSectores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(""); 

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const res = await listarSectores();
                setSectores(res.data?.contenido || res.data || []);
            } catch (err) {
                setError("Error cargando los sectores disponibles.");
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
            if (!formData.username || !formData.password || !formData.idSector) {
                setError("Por favor completa todos los campos obligatorios.");
                return;
            }

            const payload = {
                username: formData.username,
                password: formData.password,
                idSector: parseInt(formData.idSector)
            };

            await registrarUsuario(payload);

            setSuccess("¡Usuario registrado exitosamente! Redirigiendo...");
            
            setTimeout(() => {
                navigate('/usuarios');
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.error || "Hubo un error al registrar el usuario.");
        }
    };

    //if (loading) return <Loading fullScreen />;

    return (
        <Layout>
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/usuarios')}
                        className="p-2 rounded-full hover:bg-white hover:shadow-sm transition-all text-gray-500"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Registrar Nuevo Usuario</h1>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="flex border-b border-slate-100">
                        <div className="px-6 py-3 border-b-2 border-[#1C5B5A] text-[#1C5B5A] text-sm font-semibold flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#1C5B5A] text-white flex items-center justify-center text-xs">1</span>
                            Datos del Usuario
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8">
                        {error && (
                            <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2 border border-red-200 animate-in fade-in">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 bg-emerald-50 text-emerald-700 p-3 rounded-md text-sm flex items-center gap-2 border border-emerald-200 animate-in fade-in">
                                <Check size={16} /> <span className="font-medium">{success}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre de Usuario</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="ej. juan.perez"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Contraseña</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="mb-8">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Sector asignado</label>
                            <select
                                name="idSector"
                                value={formData.idSector}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none"
                            >
                                <option value="">Seleccione el sector correspondiente...</option>
                                {sectores.map(sec => (
                                    <option key={sec.idSector} value={sec.idSector}>
                                        {sec.nombre} 
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-4 border-t border-slate-100 pt-6">
                            <button
                                type="button"
                                onClick={() => navigate('/usuarios')}
                                className="px-6 py-2.5 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={!!success} 
                                className={`px-6 py-2.5 bg-[#1C5B5A] text-white rounded-lg font-medium hover:bg-[#164a49] transition-colors flex items-center gap-2 shadow-sm ${success ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {success ? 'Registrado' : 'Registrar Usuario'} <Check size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
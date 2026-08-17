import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Download, X, AlertCircle } from 'lucide-react';
import Layout from '../../../components/Layout';
import SeleccionProveedor from '../../../components/evalProveedor/SeleccionProveedor';
import GestionEvalProveedor from '../../../components/evalProveedor/GestionEvalProveedor';
import { descargarEvaluacionesPorPeriodo } from '../../../services/evalProveedorService';
import { useAuth } from '../../../context/AuthContext';

export default function EvalProveedorPage() {
    const { user } = useAuth();
    const permisos = user?.permisos || [];
    
    const puedeEditar = permisos.includes('PERM_EVAL_PROVEEDOR_EDITAR');
    const puedeDescargar = permisos.includes('PERM_EVAL_PROVEEDOR_DESCARGAR');

    const location = useLocation();
    const navigate = useNavigate();

    const [proveedorSeleccionado, setProveedorSeleccionado] = useState(
        location.state?.proveedorPreseleccionado || null
    );
    const [returnTo, setReturnTo] = useState(location.state?.returnTo || null);
    const [showDescargaModal, setShowDescargaModal] = useState(false);

    useEffect(() => {
        if (location.state?.proveedorPreseleccionado || location.state?.returnTo) {
            window.history.replaceState({}, document.title);
        }
    }, []);

    const handleBack = () => {
        if (returnTo?.pathname) {
            navigate(returnTo.pathname, { state: returnTo.state });
            return;
        }
        setProveedorSeleccionado(null);
    };

    const handleSaved = () => {
        if (returnTo?.pathname) {
            navigate(returnTo.pathname, { state: returnTo.state });
        }
    };

    return (
        <Layout>
            <div className="animate-in fade-in duration-300">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">
                            {proveedorSeleccionado ? "Detalle de Evaluación" : "Evaluaciones de Proveedor"}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {proveedorSeleccionado 
                                ? "Consulte o gestione la evaluación de este proveedor." 
                                : "Seleccione un proveedor de la lista."}
                        </p>
                    </div>
                    
                    {puedeDescargar && !proveedorSeleccionado && (
                        <button
                            onClick={() => setShowDescargaModal(true)}
                            className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-[#1C5B5A] text-white rounded-lg font-bold text-sm hover:bg-[#164a49] shadow-md transition-all"
                        >
                            <Download size={16} /> Descargar evaluaciones por período
                        </button>
                    )}
                </div>

                {/* SIEMPRE MOSTRAMOS LA LISTA DE PROVEEDORES COMO BASE */}
                {!proveedorSeleccionado ? (
                    <SeleccionProveedor 
                        onSelect={(prov) => setProveedorSeleccionado(prov)} 
                        puedeEditar={puedeEditar}
                    />
                ) : (
                    <GestionEvalProveedor
                        proveedor={proveedorSeleccionado}
                        onBack={handleBack}
                        onSaved={handleSaved}
                        puedeEditar={puedeEditar}
                        puedeDescargar={puedeDescargar} 
                    />
                )}
            </div>

            {showDescargaModal && (
                <DescargaPorPeriodoModal onClose={() => setShowDescargaModal(false)} />
            )}
        </Layout>
    );
}

// ================= MODAL DESCARGA =================
function DescargaPorPeriodoModal({ onClose }) {
    const [modo, setModo] = useState('anio'); 
    const [anio, setAnio] = useState(new Date().getFullYear());
    const [desde, setDesde] = useState('');
    const [hasta, setHasta] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDescargar = async (e) => {
        e.preventDefault();
        setError('');

        if (modo === 'rango' && desde && hasta && desde > hasta) {
            setError('La fecha "desde" no puede ser posterior a "hasta".');
            return;
        }

        setLoading(true);
        try {
            if (modo === 'anio') {
                await descargarEvaluacionesPorPeriodo({ anio: Number(anio) });
            } else {
                await descargarEvaluacionesPorPeriodo({ desde, hasta });
            }
            onClose();
        } catch (err) {
            setError(err.message || 'No se pudo descargar el archivo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl animate-in zoom-in-95">
                <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100 bg-[#1C5B5A] text-white rounded-t-xl">
                    <h3 className="font-bold text-lg">Descargar evaluaciones por período</h3>
                    <button onClick={onClose}><X size={20} className="hover:text-emerald-200" /></button>
                </div>

                <form onSubmit={handleDescargar} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-200">
                            <AlertCircle size={16} className="shrink-0" /> {error}
                        </div>
                    )}

                    <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setModo('anio')}
                            className={`flex-1 py-2 rounded-md text-sm font-bold transition-colors ${
                                modo === 'anio' ? 'bg-white text-[#1C5B5A] shadow-sm' : 'text-slate-500'
                            }`}
                        >
                            Por año
                        </button>
                        <button
                            type="button"
                            onClick={() => setModo('rango')}
                            className={`flex-1 py-2 rounded-md text-sm font-bold transition-colors ${
                                modo === 'rango' ? 'bg-white text-[#1C5B5A] shadow-sm' : 'text-slate-500'
                            }`}
                        >
                            Por rango de fechas
                        </button>
                    </div>

                    {modo === 'anio' ? (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                Período evaluado (año)
                            </label>
                            <input
                                type="number"
                                value={anio}
                                onChange={(e) => setAnio(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg p-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                required
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Desde</label>
                                <input
                                    type="date"
                                    value={desde}
                                    onChange={(e) => setDesde(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg p-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Hasta</label>
                                <input
                                    type="date"
                                    value={hasta}
                                    onChange={(e) => setHasta(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg p-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-gray-400">
                        Se descargará un archivo .zip con el PDF de cada evaluación del período seleccionado.
                    </p>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 bg-[#1C5B5A] text-white rounded-lg text-sm font-bold hover:bg-[#164a49] shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Generando...' : <><Download size={16} /> Descargar ZIP</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
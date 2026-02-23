import { useEffect, useState } from "react";
import Loading from "../../../components/Loading";
import { misSolicitudes } from "../../../services/solicitudService";
import Layout from "../../../components/Layout";
import TablaSolicitud from "../../../components/solicitud/TablaSolicitud"; 
import DetallesSolicitud from "../../../components/solicitud/DetallesSolicitud"; 
import { FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../../context/AuthContext";

export default function SolicitudPanel() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [solicitudes, setSolicitudes] = useState([]);

    // --- ESTADOS DE PAGINACIÓN ---
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // Estado para el modal de detalles
    const [selectedRequest, setSelectedRequest] = useState(null);

    const [stats, setStats] = useState({ total: 0, pendientes: 0, aprobadas: 0 });

    const cargar = async (pageToLoad = 0) => {
        try {
            if (pageToLoad === 0) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const res = await misSolicitudes(pageToLoad);
            const data = res.data;
            const contenido = data.contenido || data || [];

            if (Array.isArray(contenido)) {
                
                // 1. ACTUALIZAR LA LISTA
                if (pageToLoad === 0) {
                    setSolicitudes(contenido);
                } else {
                    setSolicitudes(prev => [...prev, ...contenido]);
                }

                // 2. ACTUALIZAR ESTADÍSTICAS (Si vienen en el DTO)
                if (data.totalElementos !== undefined) {
                    setStats({
                        total: data.totalElementos,       
                        pendientes: data.cantidadPendientes, 
                        aprobadas: data.cantidadAprobadas    
                    });
                }

                // 3. LÓGICA ROBUSTA PARA 'VER MÁS'
                if (data.ultima !== undefined) {
                    setHasMore(!data.ultima);
                } else {
                    // Fallback: si no hay metadata, ocultamos si no trajo nada
                    setHasMore(contenido.length > 0);
                }
            }
        } catch (err) {
            console.error(err);
            setError("No se pudieron cargar las solicitudes");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const cargarMas = () => {
        const next = page + 1;
        setPage(next);
        cargar(next);
    };

    useEffect(() => {
        cargar(0);
    }, []);

    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <Layout>
            {loading ? (
                <div className="h-screen flex items-center justify-center">
                    <Loading />
                </div>
            ) : (
                <>
                    {/* Título de sección */}
                    <div className="mb-6">
                        <h1 className="text-xl font-bold text-slate-900">Solicitudes</h1>
                        <button
                            onClick={() => navigate('/solicitudes/nueva')}
                            className="bg-[#1C5B5A] hover:bg-[#164a49] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
                        >
                            <Plus size={18} /> Nueva Solicitud
                        </button>
                    </div>

                    {/* --- TARJETAS DE ESTADÍSTICAS --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-lg shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
                            <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-4">TOTAL SOLICITUDES</h3>
                            <div className="text-3xl font-bold text-slate-900 mb-2">{stats.total}</div>
                            <div className="text-xs text-emerald-500 font-medium">↗ Actualizado</div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
                            <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-4">PENDIENTES</h3>
                            <div className="text-3xl font-bold text-slate-900 mb-2">{stats.pendientes}</div>
                            <div className="text-xs text-orange-400 font-medium">En espera</div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
                            <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-4">APROBADAS</h3>
                            <div className="text-3xl font-bold text-slate-900 mb-2">{stats.aprobadas}</div>
                            <div className="text-xs text-emerald-500 font-medium">✓ Procesado</div>
                        </div>
                    </div>

                    {/* --- TABLA CON PAGINACIÓN --- */}
                    {solicitudes.length > 0 ? (
                        <TablaSolicitud
                            solicitudes={solicitudes}
                            onViewDetails={(req) => setSelectedRequest(req)}
                            onLoadMore={cargarMas}
                            hasMore={hasMore}
                            isLoadingMore={loadingMore}
                        />
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-20 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <FileText className="text-slate-300" size={30} />
                            </div>
                            <h3 className="text-base font-bold text-slate-800 mb-1">No se encontraron solicitudes</h3>
                        </div>
                    )}

                    {/* --- MODAL DE DETALLES --- */}
                    {selectedRequest && (
                        <DetallesSolicitud
                            request={selectedRequest}
                            onClose={() => setSelectedRequest(null)}
                        />
                    )}
                </>
            )}
        </Layout>
    );
}
import React, { useEffect, useState } from 'react';
import { listarTodosLosPresupuestos } from '../../services/presupuestoService';
import { Search, Eye, FileText, Package } from 'lucide-react';
import DetalleGrupoPresupuestos from './DetalleGrupoPresupuestos';
import Loading from '../Loading';

export default function ListaPresupuestosSoloLectura() {
    const [gruposPresupuestos, setGruposPresupuestos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);

    useEffect(() => {
        const cargar = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await listarTodosLosPresupuestos();
                const data = res.data?.contenido || res.data || [];

                // Agrupamos por solicitud, igual que en Aprobación de Presupuesto
                const grouped = new Map();
                data.forEach(presupuesto => {
                    const solicitud = presupuesto.aprobacionSolicitud?.solicitud;
                    const idSoli = solicitud?.idSolicitud;
                    if (!idSoli) return;

                    if (!grouped.has(idSoli)) {
                        grouped.set(idSoli, {
                            solicitud,
                            aprobacionSolicitud: presupuesto.aprobacionSolicitud,
                            presupuestos: []
                        });
                    }
                    grouped.get(idSoli).presupuestos.push(presupuesto);
                });

                setGruposPresupuestos(Array.from(grouped.values()));
            } catch (err) {
                setError('No se pudieron cargar los presupuestos.');
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = dateString.includes('T') ? new Date(dateString) : new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const filteredData = gruposPresupuestos.filter((grupo) => {
        const term = searchTerm.toLowerCase();
        const producto = grupo.solicitud?.producto?.nombre?.toLowerCase() || "";
        const idSoli = grupo.solicitud?.idSolicitud?.toString() || "";
        const proveedores = grupo.presupuestos.map(p => p.proveedor?.nombreEmpresa?.toLowerCase()).join(" ");
        return producto.includes(term) || idSoli.includes(term) || proveedores.includes(term);
    });

    if (loading) return <Loading />;
    if (error) return <div className="text-center py-10 text-red-500 text-sm">{error}</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-base font-bold text-slate-800">Solicitudes con Presupuestos</h2>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por ID, producto, proveedor..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredData.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F8F9FC] text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                <th className="px-6 py-4">SOLICITUD</th>
                                <th className="px-6 py-4">PRODUCTO</th>
                                <th className="px-6 py-4">CANTIDAD</th>
                                <th className="px-6 py-4">PRESUPUESTOS</th>
                                <th className="px-6 py-4 text-right">ACCIÓN</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredData.map((grupo) => (
                                <tr key={grupo.solicitud.idSolicitud} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-slate-800">#SOL-{grupo.solicitud.idSolicitud}</div>
                                        <div className="text-[11px] text-gray-400">{formatDate(grupo.solicitud.fecha)}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                                        {grupo.solicitud.producto?.nombre}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {grupo.solicitud.cantidad} un.
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-blue-50 text-blue-600 px-2 py-1.5 rounded font-bold text-[10px] flex items-center gap-1 w-max border border-blue-100">
                                            <Package size={12} /> {grupo.presupuestos.length} / 4
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setGrupoSeleccionado(grupo)}
                                            className="inline-flex items-center gap-1 text-[#1C5B5A] font-bold text-xs hover:underline"
                                        >
                                            <Eye size={14} /> Detalles
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <FileText className="text-slate-300" size={30} />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">Sin presupuestos registrados</h3>
                </div>
            )}

            {grupoSeleccionado && (
                <DetalleGrupoPresupuestos
                    grupo={grupoSeleccionado}
                    onClose={() => setGrupoSeleccionado(null)}
                />
            )}
        </div>
    );
}
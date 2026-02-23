import React, { useEffect, useState } from 'react';
import Layout from '../Layout';
import Loading from '../Loading';
import TablaSolicitud from '../solicitud/TablaSolicitud';
import GestionPresupuestos from './GestionPresupuestos'; 
import { listarAprobacionesPorEstado } from '../../services/presupuestoService';
import { FileText } from 'lucide-react';

export default function Presupuestos() {
    const [loading, setLoading] = useState(true);
    const [solicitudes, setSolicitudes] = useState([]);
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null); 

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const res = await listarAprobacionesPorEstado();
            const data = res.data?.contenido || res.data || [];
            

            setSolicitudes(data);
        } catch (error) {
            console.error("Error al cargar solicitudes", error);
        } finally {
            setLoading(false);
        }
    };

    // Si hay una solicitud seleccionada, mostramos la pantalla de gestión de presupuestos
    if (solicitudSeleccionada) {
        return (
            <GestionPresupuestos 
                solicitud={solicitudSeleccionada} 
                onBack={() => {
                    setSolicitudSeleccionada(null);
                    cargarDatos(); // Recargar al volver por si cambió algo
                }} 
            />
        );
    }

    if (loading) return <Loading fullScreen />;

    return (
        <Layout>
            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">Gestión de Presupuestos</h1>
            </div>

            {solicitudes.length > 0 ? (
                <TablaSolicitud 
                    solicitudes={solicitudes} 
                    onViewDetails={(req) => setSolicitudSeleccionada(req)} // Al clickear, cambiamos de vista
                />
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-20 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <FileText className="text-slate-300" size={30} />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">Sin solicitudes pendientes</h3>
                    <p className="text-gray-400 text-sm max-w-sm">
                        No hay solicitudes aprobadas esperando presupuesto.
                    </p>
                </div>
            )}
        </Layout>
    );
}
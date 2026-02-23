import React, { useEffect, useState } from 'react';
import Layout from '../Layout';
import Loading from '../Loading';
import TablaPresupuesto from '../presupuesto/TablaPresupuesto';
import GestionCompra from './GestionCompra'; 
import { ListarAprobPresupuestoAprobadas } from '../../services/compraService';
import { FileText } from 'lucide-react';

export default function Compras() {
    const [loading, setLoading] = useState(true);
    const [presupuestos, setPresupuestos] = useState([]);
    const [presupuestoSeleccionada, setpresupuestoSeleccionada] = useState(null); 

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const res = await ListarAprobPresupuestoAprobadas();
            const data = res.data?.contenido || res.data || [];
            setPresupuestos(data);
        } catch (error) {
            console.error("Error al cargar presupuestos", error);
        } finally {
            setLoading(false);
        }
    };

    // Si hay una solicitud seleccionada, mostramos la pantalla de gestión de presupuestos
    if (presupuestoSeleccionada) {
        return (
            <GestionCompra
                aprobacion={presupuestoSeleccionada} 
                onBack={() => {
                    setpresupuestoSeleccionada(null);
                    cargarDatos(); 
                }} 
            />
        );
    }

    if (loading) return <Loading fullScreen />;

    return (
        <Layout>
            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">Gestión de Presupuestos</h1>
                <p className="text-sm text-gray-500">Seleccione un presupuesto aprobado para cargar sus compra.</p>
            </div>

            {presupuestos.length > 0 ? (
                <TablaPresupuesto
                    presupuestos={presupuestos} 
                    onViewDetails={(req) => setpresupuestoSeleccionada(req)} // Al clickear, cambiamos de vista
                />
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-20 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <FileText className="text-slate-300" size={30} />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">Sin presupuestos pendientes</h3>
                    <p className="text-gray-400 text-sm max-w-sm">
                        No hay presupuestos aprobadas esperando presupuesto.
                    </p>
                </div>
            )}
        </Layout>
    );
}
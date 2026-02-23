import React, { useEffect, useState } from 'react';
import Layout from '../Layout';
import Loading from '../Loading';
import TablaCompra from '../compra/TablaCompra';
import GestionEntrega from './GestionEntrega'; 
import { listarCompra } from '../../services/evalEntregaService';
import { FileText } from 'lucide-react';

export default function EvalEntragas() {
    const [loading, setLoading] = useState(true);
    const [compras, setcompras] = useState([]);
    const [compraSeleccionada, setCompraSeleccionada] = useState(null); 

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const res = await listarCompra();
            const data = res.data?.contenido || res.data || [];
            setcompras(data);
        } catch (error) {
            console.error("Error al cargar compras", error);
        } finally {
            setLoading(false);
        }
    };

    // Si hay una solicitud seleccionada, mostramos la pantalla de gestión de presupuestos
    if (presupuestoSeleccionada) {
        return (
            <GestionEntrega
                compra={compraSeleccionada} 
                onBack={() => {
                    setCompraSeleccionada(null);
                    cargarDatos(); 
                }} 
            />
        );
    }

    if (loading) return <Loading fullScreen />;

    return (
        <Layout>
            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">Gestión de Evaluación de compra</h1>
                <p className="text-sm text-gray-500">Seleccione una compra para registrar la evaluación.</p>
            </div>

            {compras.length > 0 ? (
                <TablaCompra
                    compras={compras} 
                    onViewDetails={(req) => setCompraSeleccionada(req)} // Al clickear, cambiamos de vista
                />
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-20 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <FileText className="text-slate-300" size={30} />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">Sin compras pendientes</h3>
                    <p className="text-gray-400 text-sm max-w-sm">
                        No hay eval de entrega pendientes
                    </p>
                </div>
            )}
        </Layout>
    );
}
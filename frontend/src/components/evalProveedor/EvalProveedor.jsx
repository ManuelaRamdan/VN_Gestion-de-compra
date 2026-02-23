import React, { useEffect, useState } from 'react';
import Layout from '../Layout';
import Loading from '../Loading';
import TablaProveedor from '../proveedor/TablaProveedor';
import GestionEvalProveedor from './GestionEvalProveedor';
import { listarProveedores } from '../../services/evalProveedorService';
import { FileText } from 'lucide-react';

export default function EvalProveedor() {
    const [loading, setLoading] = useState(true);
    const [proveedores, setProveedores] = useState([]);
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
    const [evaluacionExistente, setEvaluacionExistente] = useState(null);


    const seleccionarProveedor = async (prov) => {
        setProveedorSeleccionado(prov);
        setLoading(true);
        try {
            const res = await buscarPorProveedor(prov.nombreEmpresa);
            setEvaluacionExistente(res.data?.[0] || null);
        } catch (error) {
            console.error("Error buscando evaluación:", error);
            setEvaluacionExistente(null);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const res = await listarProveedores();
            const data = res.data?.contenido || res.data || [];
            setProveedores(data);
        } catch (error) {
            console.error("Error al cargar proveedores", error);
        } finally {
            setLoading(false);
        }
    };

    if (proveedorSeleccionado) {
        return (
            <GestionEvalProveedor
                proveedor={proveedorSeleccionado}
                onBack={() => {
                    setProveedorSeleccionado(null);
                    cargarDatos();
                }}
            />
        );
    }

    if (loading) return <Loading fullScreen />;

    return (
        <Layout>
            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">
                    Gestión de Evaluación de proveedor
                </h1>
                <p className="text-sm text-gray-500">
                    Seleccione un proveedor para registrar la evaluación.
                </p>
            </div>
    
            {proveedorSeleccionado ? (
                <GestionEvalProveedor
                    proveedor={proveedorSeleccionado}
                    evaluacionExistente={evaluacionExistente} // <--- aquí llega correctamente
                    onBack={() => {
                        setProveedorSeleccionado(null);
                        setEvaluacionExistente(null);
                        cargarDatos();
                    }}
                    onSaved={() => {
                        cargarDatos();
                        setEvaluacionExistente(null);
                    }}
                />
            ) : loading ? (
                <Loading fullScreen />
            ) : proveedores.length > 0 ? (
                <TablaProveedor
                    proveedores={proveedores}
                    onSelect={seleccionarProveedor} 
                />
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-20 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <FileText className="text-slate-300" size={30} />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">
                        Sin proveedores
                    </h3>
                    <p className="text-gray-400 text-sm max-w-sm">
                        No hay proveedores disponibles para evaluar.
                    </p>
                </div>
            )}
        </Layout>
    );
}

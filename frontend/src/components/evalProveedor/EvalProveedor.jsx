import React, { useEffect, useState } from 'react';
import Layout from '../Layout';
import Loading from '../Loading';
import TablaProveedor from '../proveedor/TablaProveedor';
import GestionEvalProveedor from './GestionEvalProveedor';
import { listarProveedores, buscarPorProveedor } from '../../services/evalProveedorService';
import { FileText } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function EvalProveedor() {
    const [loading, setLoading] = useState(true);
    const [proveedores, setProveedores] = useState([]);
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
    const [evaluacionExistente, setEvaluacionExistente] = useState(null);

    // Info para volver al lugar de origen (ej: un Cierre) cuando se llegó
    // acá desde otra pantalla con un proveedor preseleccionado.
    const [returnTo, setReturnTo] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();

    console.log('STATE RECIBIDO EN EVALPROVEEDOR:', location.state);

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
        const preseleccionado = location.state?.proveedorPreseleccionado;
        const returnToState = location.state?.returnTo;

        if (returnToState) setReturnTo(returnToState);

        if (preseleccionado) {
            seleccionarProveedor(preseleccionado);
            window.history.replaceState({}, document.title); // limpia el state para que no se repita en un refresh
        } else {
            cargarDatos();
        }
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

    // Vuelve al cierre de origen si vinimos desde ahí; si no, vuelve a la
    // lista de proveedores de esta misma pantalla.
    const handleBack = () => {
        if (returnTo?.pathname) {
            navigate(returnTo.pathname, { state: returnTo.state });
            return;
        }
        setProveedorSeleccionado(null);
        setEvaluacionExistente(null);
        cargarDatos();
    };

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
                    evaluacionExistente={evaluacionExistente}
                    onBack={handleBack}
                    onSaved={() => {
                        // Si venimos de un cierre, después de guardar la evaluación
                        // volvemos directo a ese cierre en vez de quedarnos acá.
                        if (returnTo?.pathname) {
                            navigate(returnTo.pathname, { state: returnTo.state });
                        } else {
                            cargarDatos();
                            setEvaluacionExistente(null);
                        }
                    }}
                />
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
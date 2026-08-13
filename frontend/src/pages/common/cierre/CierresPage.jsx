import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../../../components/Layout';
import SeleccionEvaluacion from '../../../components/cierre/SeleccionEvaluacion';
import GestionCierre from '../../../components/cierre/GestionCierre';
import ListaCierresSoloLectura from '../../../components/cierre/ListaCierresSoloLectura';
import { useAuth } from '../../../context/AuthContext';

export default function CierresPage() {
    const { user } = useAuth();
    const permisos = user?.permisos || [];
    const puedeGestionar = permisos.includes('PERM_CIERRES_GESTIONAR');

    const location = useLocation();
    const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState(
        location.state?.evaluacionPreseleccionada || null
    );

    useEffect(() => {
        if (location.state?.evaluacionPreseleccionada) {
            window.history.replaceState({}, document.title);
        }
    }, []);

    if (!puedeGestionar) {
        return (
            <Layout>
                <div className="animate-in fade-in duration-300">
                    <div className="mb-6">
                        <h1 className="text-xl font-bold text-slate-900">Cierres Administrativos</h1>
                        <p className="text-sm text-gray-500">Consulte los expedientes cerrados.</p>
                    </div>
                    <ListaCierresSoloLectura />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="animate-in fade-in duration-300">
                {!evaluacionSeleccionada ? (
                    <>
                        <div className="mb-6">
                            <h1 className="text-xl font-bold text-slate-900">Cierre Administrativo</h1>
                            <p className="text-sm text-gray-500">Seleccione una evaluación de entrega para finalizar el proceso de compra.</p>
                        </div>
                        <SeleccionEvaluacion onSelect={(ev) => setEvaluacionSeleccionada(ev)} />
                    </>
                ) : (
                    <GestionCierre
                        evaluacion={evaluacionSeleccionada}
                        onBack={() => setEvaluacionSeleccionada(null)}
                    />
                )}
            </div>
        </Layout>
    );
}
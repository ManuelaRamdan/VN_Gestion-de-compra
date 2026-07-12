// src/pages/CierresPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../../../components/Layout';
import SeleccionEvaluacion from '../../../components/cierre/SeleccionEvaluacion';
import GestionCierre from '../../../components/cierre/GestionCierre';

export default function CierresPage() {
    const location = useLocation();

    // Si volvemos desde "Evaluar proveedor" (originado en un cierre), acá
    // llega la evaluación de entrega que estábamos gestionando, para
    // reabrir ese mismo cierre en vez de mostrar la lista.
    const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState(
        location.state?.evaluacionPreseleccionada || null
    );

    useEffect(() => {
        if (location.state?.evaluacionPreseleccionada) {
            window.history.replaceState({}, document.title); // evita que se repita en un refresh
        }
    }, []);

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
// src/pages/CierresPage.jsx
import React, { useState } from 'react';
import Layout from '../../../components/Layout';
import SeleccionEvaluacion from '../../../components/cierre/SeleccionEvaluacion';
import GestionCierre from '../../../components/cierre/GestionCierre';

export default function CierresPage() {
    const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState(null);

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
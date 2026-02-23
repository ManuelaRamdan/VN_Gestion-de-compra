import React from 'react';
import Layout from '../../../components/Layout';
// Ajusta la ruta dependiendo de dónde guardaste el componente que creamos recién
import PanelAprobaciones from '../../../components/aprobacion/presupuesto/PanelAprobacionesPresu'; 

export default function AprobPresuPage() {
    return (
        <Layout>
            <div className="animate-in fade-in duration-300">
                <PanelAprobaciones />
            </div>
        </Layout>
    );
}
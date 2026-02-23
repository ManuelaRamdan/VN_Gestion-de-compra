import React from 'react';
import Layout from '../../../components/Layout';
// Ajusta la ruta dependiendo de dónde guardaste el componente que creamos recién
import PanelAprobacionesSoli from '../../../components/aprobacion/solicitud/PanelAprobacionesSoli'; 

export default function AprobSoliPage() {
    return (
        <Layout>
            <div className="animate-in fade-in duration-300">
                <PanelAprobacionesSoli />
            </div>
        </Layout>
    );
}
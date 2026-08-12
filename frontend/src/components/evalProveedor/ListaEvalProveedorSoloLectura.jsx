import React, { useEffect, useState } from 'react';
import { listarTodas, descargarEvaluacionPdf } from '../../services/evalProveedorService';
import TablaEvalProveedorResultados from './TablaEvalProveedorResultados';
import DetalleEvalProveedor from './DetalleEvalProveedor';
import Loading from '../Loading';

export default function ListaEvalProveedorSoloLectura({ puedeDescargar }) {
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [seleccionada, setSeleccionada] = useState(null);

    useEffect(() => {
        const cargar = async () => {
            try {
                setLoading(true);
                const res = await listarTodas();
                const data = res.data?.contenido || res.data || [];
                setEvaluaciones(data);
            } catch (err) {
                setError('No se pudieron cargar las evaluaciones.');
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    if (loading) return <Loading />;
    if (error) return <div className="text-center py-10 text-red-500 text-sm">{error}</div>;

    return (
        <>
            <TablaEvalProveedorResultados
                evaluaciones={evaluaciones}
                onViewDetails={(item) => setSeleccionada(item)}
                onDescargar={descargarEvaluacionPdf}
                puedeDescargar={puedeDescargar}
            />
            {seleccionada && (
                <DetalleEvalProveedor evaluacion={seleccionada} onClose={() => setSeleccionada(null)} />
            )}
        </>
    );
}
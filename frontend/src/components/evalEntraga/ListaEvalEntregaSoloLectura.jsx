import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import TablaEvalEntrega from './TablaEvalEntrega';
import DetalleEvalEntrega from './DetalleEvalEntrega';
import Loading from '../Loading';

export default function ListaEvalEntregaSoloLectura() {
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [seleccionada, setSeleccionada] = useState(null);

    useEffect(() => {
        const cargar = async () => {
            try {
                setLoading(true);
                const res = await api.get('/api/evalEntrega/');
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
            <TablaEvalEntrega evaluaciones={evaluaciones} onViewDetails={(item) => setSeleccionada(item)} />
            {seleccionada && (
                <DetalleEvalEntrega evaluacion={seleccionada} onClose={() => setSeleccionada(null)} />
            )}
        </>
    );
}
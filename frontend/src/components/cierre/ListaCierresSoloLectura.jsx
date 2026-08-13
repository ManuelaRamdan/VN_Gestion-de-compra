import React, { useEffect, useState } from 'react';
import { listarCierres } from '../../services/cierreService';
import TablaCierre from './TablaCierre';
import DetalleCierre from './DetalleCierre';
import Loading from '../Loading';

export default function ListaCierresSoloLectura() {
    const [cierres, setCierres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [seleccionado, setSeleccionado] = useState(null);

    useEffect(() => {
        const cargar = async () => {
            try {
                setLoading(true);
                const res = await listarCierres();
                const data = res.data?.contenido || res.data || [];
                setCierres(data);
            } catch (err) {
                setError('No se pudieron cargar los cierres.');
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
            <TablaCierre cierres={cierres} onViewDetails={(item) => setSeleccionado(item)} />
            {seleccionado && (
                <DetalleCierre cierre={seleccionado} onClose={() => setSeleccionado(null)} />
            )}
        </>
    );
}
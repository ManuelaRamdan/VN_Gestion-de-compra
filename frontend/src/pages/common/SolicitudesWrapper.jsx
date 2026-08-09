import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

import SolicitudPanel from './solicitud/SolicitudPanel';

export default function SolicitudesWrapper() {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const permisos = user?.permisos || [];
    const puedeVerPanel =
        permisos.includes('PERM_SOLICITUDES_ADMIN') ||
        permisos.includes('PERM_SOLICITUDES_VER');

    if (puedeVerPanel) {
        return <SolicitudPanel />;
    }

    // Quien solo tiene PERM_APROBACIONES_VER no gestiona "sus" solicitudes,
    // ve el listado de solicitudes pendientes/aprobadas/rechazadas para aprobar.
    if (permisos.includes('PERM_APROBACIONES_VER')) {
        return <Navigate to="/aprobSolicitud" replace />;
    }

    return <Navigate to="/login" replace />;
}
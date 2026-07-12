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
        permisos.includes('PERM_APROBACIONES_VER') ||
        permisos.includes('PERM_SOLICITUDES_VER');

    if (puedeVerPanel) {
        return <SolicitudPanel />;
    }

    return <Navigate to="/login" />;
}
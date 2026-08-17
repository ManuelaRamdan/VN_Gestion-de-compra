/**
 * Mapa de recurso → ruta de aterrizaje. La clave es un prefijo (o el nombre
 * completo, para permisos que no siguen el patrón _VER/_EDITAR/_BORRAR/_ADMIN).
 * Se recorre en orden y se navega a la primera ruta cuyo prefijo matchee
 * algún permiso que el usuario tenga.
 *
 * Para un módulo nuevo con niveles granulares (_VER, _EDITAR, _BORRAR, _ADMIN),
 * alcanza con una sola fila usando el prefijo común, ej: 'PERM_PRODUCTOS_'.
 * Para permisos sueltos que no comparten prefijo con otros del mismo recurso
 * (como Solicitudes, que tiene ADMIN/VER/CREAR yendo a rutas distintas),
 * se listan explícitos y van ANTES de cualquier prefijo genérico que pudiera
 * también matchearlos.
 */
const RUTAS_POR_RECURSO = [
    { prefijo: 'PERM_SOLICITUDES_ADMIN', ruta: '/solicitudes' },
    { prefijo: 'PERM_APROBACIONES_VER', ruta: '/aprobSolicitud' },
    { prefijo: 'PERM_SOLICITUDES_VER', ruta: '/solicitudes' },
    { prefijo: 'PERM_SOLICITUDES_CREAR', ruta: '/solicitudes/nueva' },
    { prefijo: 'PERM_PRIORIDADES_', ruta: '/nivelPrioridad' },
    { prefijo: 'PERM_PRODUCTOS_', ruta: '/producto' },
    { prefijo: 'PERM_PROVEEDORES_', ruta: '/proveedor' },
    { prefijo: 'PERM_PRESUPUESTOS', ruta: '/presupuestos' },
    { prefijo: 'PERM_COMPRAS', ruta: '/compras' },
    { prefijo: 'PERM_EVAL_PROVEEDOR', ruta: '/evalProveedor' },
    { prefijo: 'PERM_EVAL_ENTREGA', ruta: '/evalEntrega' },
    { prefijo: 'PERM_RECLAMOS', ruta: '/reclamos' },
    { prefijo: 'PERM_DOCUMENTACION', ruta: '/documentacion' },
    { prefijo: 'PERM_CIERRES', ruta: '/cierre' },
    { prefijo: 'PERM_USUARIOS_', ruta: '/usuarios' },
    { prefijo: 'PERM_UPLOADS', ruta: '/uploads' },
    { prefijo: 'PERM_SECTOR_', ruta: '/sector' },
    { prefijo: 'PERM_APROB_SOLI_', ruta: '/aprobSolicitud' },
    { prefijo: 'PERM_APROB_PRESU_', ruta: '/aprobPresupuesto' }
];

/**
 * Devuelve la primera ruta a la que el usuario tiene acceso real,
 * según sus permisos. Si no matchea ninguna, devuelve null
 * (el caller decide qué hacer en ese caso).
 */
export function getRutaLanding(rol, permisos = []) {
    if (rol === 'GERENCIA') {
        return '/aprobSolicitud';
    }

    const match = RUTAS_POR_RECURSO.find(({ prefijo }) =>
        permisos.some(p => p.startsWith(prefijo))
    );
    return match ? match.ruta : null;
}
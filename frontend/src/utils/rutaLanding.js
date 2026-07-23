/**
 * Mapa de permiso → ruta de aterrizaje, en orden de prioridad.
 * Se recorre de arriba hacia abajo y se navega a la primera ruta
 * cuyo permiso el usuario efectivamente tenga.
 *
 * Para agregar un sector/permiso nuevo, solo hay que sumar una fila acá.
 */
const RUTAS_POR_PERMISO = [
    { permiso: 'PERM_SOLICITUDES_ADMIN',   ruta: '/solicitudes' },
    { permiso: 'PERM_APROBACIONES_VER',    ruta: '/solicitudes' },
    { permiso: 'PERM_SOLICITUDES_VER',     ruta: '/solicitudes' },
    { permiso: 'PERM_PRIORIDADES_ADMIN',   ruta: '/nivelPrioridad' },
    { permiso: 'PERM_PRIORIDADES_VER',     ruta: '/nivelPrioridad' },
    { permiso: 'PERM_PRODUCTOS_ADMIN',     ruta: '/producto' },
    { permiso: 'PERM_PRODUCTOS_VER',       ruta: '/producto' },
    { permiso: 'PERM_PROVEEDORES_ADMIN',   ruta: '/proveedor' },
    { permiso: 'PERM_PROVEEDORES_VER',     ruta: '/proveedor' },
    { permiso: 'PERM_PRESUPUESTOS',        ruta: '/presupuestos' },
    { permiso: 'PERM_COMPRAS',             ruta: '/compras' },
    { permiso: 'PERM_EVAL_PROVEEDOR',      ruta: '/evalProveedor' },
    { permiso: 'PERM_EVAL_ENTREGA',        ruta: '/evalEntrega' },
    { permiso: 'PERM_RECLAMOS',            ruta: '/reclamos' },
    { permiso: 'PERM_DOCUMENTACION',       ruta: '/documentacion' },
    { permiso: 'PERM_CIERRES',             ruta: '/cierre' },
    { permiso: 'PERM_USUARIOS_ADMIN',      ruta: '/usuarios' },
    { permiso: 'PERM_UPLOADS',             ruta: '/uploads' },
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

    const match = RUTAS_POR_PERMISO.find(({ permiso }) => permisos.includes(permiso));
    return match ? match.ruta : null;
}
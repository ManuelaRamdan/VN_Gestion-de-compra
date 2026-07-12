-- Tabla de permisos disponibles (los checkboxes que ve el admin)
CREATE TABLE grupo_ruta (
    nombre VARCHAR(50) PRIMARY KEY,
    descripcion VARCHAR(200) NOT NULL
);

INSERT INTO grupo_ruta (nombre, descripcion) VALUES
('PERM_UPLOADS',              'Ver y subir archivos'),
('PERM_SOLICITUDES_CREAR',    'Crear solicitudes'),
('PERM_SOLICITUDES_VER',      'Ver mis solicitudes'),
('PERM_PRODUCTOS_VER',        'Ver listado de productos'),
('PERM_PRIORIDADES_VER',      'Ver listado de prioridades'),
('PERM_SOLICITUDES_HISTORIAL','Ver historial de solicitudes'),
('PERM_PROVEEDORES_VER',      'Ver listado de proveedores'),
('PERM_APROBACIONES_VER',     'Ver aprobaciones'),
('PERM_PRESUPUESTOS',         'Gestionar presupuestos'),
('PERM_COMPRAS',              'Gestionar compras'),
('PERM_EVAL_PROVEEDOR',       'Evaluar proveedores'),
('PERM_EVAL_ENTREGA',         'Evaluar entregas'),
('PERM_RECLAMOS',             'Gestionar reclamos'),
('PERM_DOCUMENTACION',        'Ver documentación'),
('PERM_PRODUCTOS_ADMIN',      'Administrar productos'),
('PERM_USUARIOS_ADMIN',       'Administrar usuarios'),
('PERM_PROVEEDORES_ADMIN',    'Administrar proveedores'),
('PERM_SOLICITUDES_ADMIN',    'Administrar todas las solicitudes'),
('PERM_APROBACIONES_ADMIN',   'Administrar aprobaciones'),
('PERM_CIERRES',              'Gestionar cierres'),
('PERM_PRIORIDADES_ADMIN',    'Administrar prioridades');

-- Tabla que asocia sector con sus permisos
CREATE TABLE sector_permiso (
    id_sector INTEGER NOT NULL REFERENCES sector(id_sector),
    grupo_ruta VARCHAR(50) NOT NULL REFERENCES grupo_ruta(nombre),
    PRIMARY KEY (id_sector, grupo_ruta)
);

-- Permisos de GERENCIA (todo)
INSERT INTO sector_permiso (id_sector, grupo_ruta)
SELECT s.id_sector, g.nombre FROM sector s, grupo_ruta g
WHERE s.nombre = 'GERENCIA';

-- Permisos de CALIDAD
INSERT INTO sector_permiso (id_sector, grupo_ruta)
SELECT s.id_sector, g.nombre FROM sector s, grupo_ruta g
WHERE s.nombre = 'CALIDAD'
AND g.nombre IN (
    'PERM_UPLOADS','PERM_SOLICITUDES_CREAR','PERM_SOLICITUDES_VER',
    'PERM_PRODUCTOS_VER','PERM_PRIORIDADES_VER','PERM_SOLICITUDES_HISTORIAL',
    'PERM_PROVEEDORES_VER','PERM_APROBACIONES_VER','PERM_PRESUPUESTOS',
    'PERM_COMPRAS','PERM_EVAL_PROVEEDOR','PERM_EVAL_ENTREGA',
    'PERM_RECLAMOS','PERM_DOCUMENTACION'
);

-- Permisos de ADMINISTRACION
INSERT INTO sector_permiso (id_sector, grupo_ruta)
SELECT s.id_sector, g.nombre FROM sector s, grupo_ruta g
WHERE s.nombre = 'ADMINISTRACION'
AND g.nombre IN (
    'PERM_UPLOADS','PERM_SOLICITUDES_CREAR','PERM_SOLICITUDES_VER',
    'PERM_PRODUCTOS_VER','PERM_PRIORIDADES_VER'
);

-- Permisos de RECURSOS HUMANOS (básico por ahora, editable desde la app)
INSERT INTO sector_permiso (id_sector, grupo_ruta)
SELECT s.id_sector, g.nombre FROM sector s, grupo_ruta g
WHERE s.nombre = 'RECURSOS HUMANOS'
AND g.nombre IN (
    'PERM_UPLOADS','PERM_SOLICITUDES_CREAR','PERM_SOLICITUDES_VER',
    'PERM_PRODUCTOS_VER','PERM_PRIORIDADES_VER'
);
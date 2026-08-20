


-- ==========================================
-- 2. Limpieza de tablas de configuración
-- ==========================================
DELETE FROM public.sector_permiso;
DELETE FROM public.grupo_ruta;


-- ==========================================
-- 3. Inserción de datos (Grupo Ruta)
-- ==========================================
COPY public.grupo_ruta (nombre, descripcion) FROM stdin;
PERM_UPLOADS	Ver y subir archivos
PERM_SOLICITUDES_CREAR	Crear solicitudes
PERM_SOLICITUDES_VER	Ver mis solicitudes
PERM_PRODUCTOS_VER	Ver listado de productos
PERM_PRIORIDADES_VER	Ver listado de prioridades
PERM_PROVEEDORES_VER	Ver listado de proveedores
PERM_RECLAMOS	Gestionar reclamos
PERM_PRODUCTOS_ADMIN	Administrar productos
PERM_USUARIOS_ADMIN	Administrar usuarios
PERM_PROVEEDORES_ADMIN	Administrar proveedores
PERM_SOLICITUDES_ADMIN	Administrar todas las solicitudes
PERM_APROBACIONES_ADMIN	Administrar aprobaciones
PERM_PRIORIDADES_ADMIN	Administrar prioridades
PERM_USUARIOS_VER	Ver usuarios
PERM_USUARIOS_EDITAR	Ver y editar usuarios
PERM_USUARIOS_BORRAR	Ver y dar de baja usuarios
PERM_SECTOR_VER	Ver listado de sectores
PERM_SECTOR_EDITAR	Ver y editar sectores
PERM_SECTOR_BORRAR	Ver y dar de baja sectores
PERM_SECTOR_ADMIN	Administrar sectores
PERM_PRODUCTOS_EDITAR	Ver y editar productos
PERM_PRODUCTOS_BORRAR	Ver y dar de baja productos
PERM_PROVEEDORES_EDITAR	Ver y editar proveedores
PERM_PROVEEDORES_BORRAR	Ver y dar de baja proveedores
PERM_PRIORIDADES_EDITAR	Ver y editar niveles de prioridad
PERM_PRIORIDADES_BORRAR	Ver y dar de baja niveles de prioridad
PERM_USUARIOS_CREAR	Ver y crear usuarios
PERM_PRODUCTOS_CREAR	Ver y crear productos
PERM_PROVEEDORES_CREAR	Ver y crear proveedores
PERM_PRIORIDADES_CREAR	Ver y crear niveles de prioridad
PERM_APROB_SOLI_PENDIENTES_VER	Ver aprobaciones de solicitudes pendientes
PERM_APROB_SOLI_ACEPTADAS_VER	Ver aprobaciones de solicitudes aceptadas
PERM_APROB_SOLI_RECHAZADAS_VER	Ver aprobaciones de solicitudes rechazadas
PERM_APROB_SOLI_GESTIONAR	Ver pendientes y evaluar (aprobar/rechazar) solicitudes
PERM_SECTOR_CREAR	Ver y crear sectores
PERM_APROB_PRESU_PENDIENTES_VER	Ver aprobaciones de presupuestos pendientes
PERM_APROB_PRESU_EVALUADAS_VER	Ver aprobaciones de presupuestos evaluadas (aprobadas y rechazadas)
PERM_APROB_PRESU_GESTIONAR	Ver pendientes y evaluar (aprobar/rechazar) presupuestos
PERM_PRESUPUESTOS_VER	Ver listado de presupuestos y sus detalles
PERM_PRESUPUESTOS_GESTIONAR	Cargar y gestionar presupuestos para solicitudes aprobadas
PERM_COMPRAS_VER	Ver listado de compras y sus detalles
PERM_COMPRAS_GESTIONAR	Registrar y gestionar compras sobre presupuestos aprobados
PERM_EVAL_ENTREGA_VER	Ver evaluaciones de entrega
PERM_EVAL_ENTREGA_EDITAR	Ver y registrar/editar evaluaciones de entrega
PERM_EVAL_PROVEEDOR_VER	Ver listado de evaluaciones de proveedor
PERM_EVAL_PROVEEDOR_EDITAR	Ver y evaluar proveedores
PERM_EVAL_PROVEEDOR_DESCARGAR	Descargar evaluaciones de proveedor en PDF
PERM_CIERRES_VER	Ver listado de cierres administrativos
PERM_CIERRES_GESTIONAR	Gestionar y generar cierres administrativos
PERM_DOCUMENTACION_VER	Ver listado de expedientes archivados
PERM_DOCUMENTACION_DESCARGAR	Descargar expedientes en PDF/ZIP
\.


-- ==========================================
-- 4. Inserción de datos (Sector Permiso - Solo sectores 1, 2, 3 y 6)
-- ==========================================
COPY public.sector_permiso (id_sector, grupo_ruta) FROM stdin;
3	PERM_SOLICITUDES_CREAR
3	PERM_SOLICITUDES_VER
3	PERM_PRODUCTOS_VER
3	PERM_PROVEEDORES_VER
3	PERM_RECLAMOS
3	PERM_PRODUCTOS_ADMIN
3	PERM_USUARIOS_ADMIN
3	PERM_PROVEEDORES_ADMIN
3	PERM_SOLICITUDES_ADMIN
3	PERM_APROBACIONES_ADMIN
3	PERM_PRIORIDADES_ADMIN
2	PERM_UPLOADS
2	PERM_SOLICITUDES_CREAR
2	PERM_SOLICITUDES_VER
2	PERM_PRODUCTOS_VER
2	PERM_PRIORIDADES_VER
2	PERM_PROVEEDORES_VER
2	PERM_RECLAMOS
1	PERM_UPLOADS
1	PERM_SOLICITUDES_CREAR
1	PERM_SOLICITUDES_VER
1	PERM_PRODUCTOS_VER
1	PERM_PRIORIDADES_VER
3	PERM_UPLOADS
3	PERM_SECTOR_ADMIN
3	PERM_APROB_SOLI_GESTIONAR
2	PERM_APROB_SOLI_GESTIONAR
3	PERM_APROB_PRESU_GESTIONAR
2	PERM_APROB_PRESU_GESTIONAR
3	PERM_APROB_PRESU_EVALUADAS_VER
3	PERM_APROB_PRESU_PENDIENTES_VER
3	PERM_APROB_SOLI_ACEPTADAS_VER
3	PERM_APROB_SOLI_PENDIENTES_VER
3	PERM_APROB_SOLI_RECHAZADAS_VER
3	PERM_PRESUPUESTOS_GESTIONAR
2	PERM_PRESUPUESTOS_GESTIONAR
3	PERM_COMPRAS_GESTIONAR
2	PERM_COMPRAS_GESTIONAR
3	PERM_EVAL_ENTREGA_EDITAR
2	PERM_EVAL_ENTREGA_EDITAR
3	PERM_EVAL_PROVEEDOR_EDITAR
2	PERM_EVAL_PROVEEDOR_EDITAR
3	PERM_EVAL_PROVEEDOR_DESCARGAR
2	PERM_EVAL_PROVEEDOR_DESCARGAR
3	PERM_CIERRES_GESTIONAR
3	PERM_DOCUMENTACION_VER
2	PERM_DOCUMENTACION_VER
3	PERM_DOCUMENTACION_DESCARGAR
2	PERM_DOCUMENTACION_DESCARGAR
\.
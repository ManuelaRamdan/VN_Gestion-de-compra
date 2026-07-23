/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.service;

import com.gestionCompra.gestion_compras.domain.entidades.EvaluacionProveedor;
import com.gestionCompra.gestion_compras.domain.entidades.Proveedor;
import com.gestionCompra.gestion_compras.domain.entidades.Solicitud;
import com.gestionCompra.gestion_compras.dto.Paginacion;
import com.gestionCompra.gestion_compras.repository.AprobacionSolicitudRepo;
import com.gestionCompra.gestion_compras.repository.CompraRepo;
import com.gestionCompra.gestion_compras.repository.EvalProveedorRepo;
import com.gestionCompra.gestion_compras.repository.ProveedorRepo;
import com.gestionCompra.gestion_compras.repository.SolicitudRepo;
import com.gestionCompra.gestion_compras.util.ABMGenerico;
import java.math.BigDecimal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author Usuario
 */
@Service
public class EvaluacionProveedorService extends ABMGenerico<EvaluacionProveedor, Integer> {

    private final EvalProveedorRepo evalProveedorRepo;

    @Autowired
    private ProveedorRepo proveedorRepo;

    @Autowired
    private CompraRepo compraRepo;

    public EvaluacionProveedorService(EvalProveedorRepo evalProveedorRepo) {
        this.evalProveedorRepo = evalProveedorRepo;
    }

    @Override
    protected JpaRepository<EvaluacionProveedor, Integer> getRepository() {
        return evalProveedorRepo;
    }

    @Override
    protected String getEntityName() {
        return "EvaluacionProveedor";
    }

    public Paginacion<EvaluacionProveedor> listarTodas(Pageable paginable) {
        // Mostramos solo la última evaluación de cada proveedor (no todo el
        // historial de correcciones), para reflejar el estado actual de cada uno.
        Page<EvaluacionProveedor> page = evalProveedorRepo.findUltimaEvaluacionPorProveedor(paginable);
        return new Paginacion<>(page);
    }

    public Paginacion<EvaluacionProveedor> buscarPorNombreProveedor(Pageable paginable, String nombre) {
        Page<EvaluacionProveedor> page = evalProveedorRepo.findUltimaEvaluacionPorProveedorNombre(nombre, paginable);
        return new Paginacion<>(page);
    }

    @Override
    @Transactional
    public EvaluacionProveedor crear(EvaluacionProveedor eval) {
        // Ejecutamos el cálculo antes de guardar
        calcularYSetearResultados(eval);
        // El guardado final lo hace el repositorio a través de super.crear o directo
        return evalProveedorRepo.save(eval);
    }

    @Override
    @Transactional
    public EvaluacionProveedor modificar(Integer id, EvaluacionProveedor datosNuevos) {
        // 1. Buscamos la evaluación existente, que usamos como BASE de la corrección.
        //    IMPORTANTE: ya no la pisamos. La dejamos intacta en la base de datos
        //    para preservar el historial (así los expedientes ya cerrados siguen
        //    mostrando la evaluación que estaba vigente en su momento, sin verse
        //    afectados por correcciones posteriores hechas sobre el mismo proveedor).
        EvaluacionProveedor entidadExistente = findById(id);

        // 2. Armamos una evaluación NUEVA partiendo de los datos actuales...
        EvaluacionProveedor nueva = new EvaluacionProveedor();
        copyNonNullProperties(entidadExistente, nueva);
        nueva.setIdEvalProveedor(null); // forzamos que sea un INSERT, no un UPDATE

        // ...y le aplicamos encima los cambios pedidos (incluye la nueva fecha
        // y firma seteadas por el controller antes de llamar a este método).
        copyNonNullProperties(datosNuevos, nueva);

        // 3. RE-CALCULAMOS (Esto garantiza que el resultado sea el oficial del sistema)
        calcularYSetearResultados(nueva);

        System.out.println(nueva.getResultado());

        return getRepository().save(nueva);
    }

    // Centralizamos la lógica para que crear y modificar usen la misma cuenta
    private void calcularYSetearResultados(EvaluacionProveedor eval) {
        int suma = eval.getCalidadproducto().getValor()
                + eval.getCumplimientoplazos().getValor()
                + eval.getAtencioncliente().getValor()
                + eval.getRespuestareclamos().getValor()
                + eval.getPrecioservicio().getValor()
                + eval.getGestionadministrativa().getValor();

        double total = (suma / 24.0) * 100;
        eval.setResultado(BigDecimal.valueOf(total));

        BigDecimal minimo = (eval.getNivelaprobacion() != null) ? eval.getNivelaprobacion() : new BigDecimal("70.00");
        eval.setAprobado(eval.getResultado().compareTo(minimo) >= 0);
    }

    public boolean tieneEvaluaciones(Integer idProveedor) {
        return evalProveedorRepo.existsByProveedor_IdProveedor(idProveedor);
    }

    public boolean requiereAlertaEventual(Integer idProveedor) {
        // 1. Verificar si el proveedor existe
        Proveedor proveedor = proveedorRepo.findById(idProveedor)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));

        // 2. Determinar si es "eventual" por su historial.
        // Al no tener un campo de tipo en la base de datos, consideramos que es 
        // "eventual" si NO tiene evaluaciones previas en el sistema.
        boolean yaTieneEvaluaciones = tieneEvaluaciones(idProveedor);
        
        // Si ya tiene evaluaciones, lo consideramos "histórico" y no requiere alerta
        if (yaTieneEvaluaciones) { 
            return false; 
        }
        
        // 3. Verificar si tiene compras pendientes (Ajusta llamando a tu CompraRepo)
        // Buscamos si existe alguna compra de este proveedor que tenga evaluada = false
        boolean tieneComprasPendientes = compraRepo.tieneComprasPendientesDeEvaluar(idProveedor);
        
        return tieneComprasPendientes; 
    }

}
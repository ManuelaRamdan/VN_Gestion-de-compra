/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestionCompra.gestion_compras.service;

import com.gestionCompra.gestion_compras.domain.entidades.EvaluacionProveedor;
import com.gestionCompra.gestion_compras.domain.entidades.Solicitud;
import com.gestionCompra.gestion_compras.dto.Paginacion;
import com.gestionCompra.gestion_compras.repository.AprobacionSolicitudRepo;
import com.gestionCompra.gestion_compras.repository.EvalProveedorRepo;
import com.gestionCompra.gestion_compras.repository.SolicitudRepo;
import com.gestionCompra.gestion_compras.util.ABMGenerico;
import java.math.BigDecimal;
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
        Page<EvaluacionProveedor> page = evalProveedorRepo.findAll(paginable);
        return new Paginacion<>(page);
    }

    public Paginacion<EvaluacionProveedor> buscarPorNombreProveedor(Pageable paginable, String nombre) {
        Page<EvaluacionProveedor> page = evalProveedorRepo.findByProveedor_NombreEmpresaContainingIgnoreCaseOrderByIdEvalProveedorDesc(nombre, paginable);
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
        // 1. Buscamos la evaluación existente
        EvaluacionProveedor entidadExistente = findById(id);

        // 2. Copiamos los campos permitidos (tu ABMGenerico usa copyNonNullProperties)
        // Aunque datosNuevos traiga un "resultado", lo ignoraremos en el siguiente paso
        copyNonNullProperties(datosNuevos, entidadExistente);

        // 3. RE-CALCULAMOS (Esto garantiza que el resultado sea el oficial del sistema)
        calcularYSetearResultados(entidadExistente);
        
        System.out.println(entidadExistente.getResultado());
        
        

        return getRepository().save(entidadExistente);
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
    
    
   
}

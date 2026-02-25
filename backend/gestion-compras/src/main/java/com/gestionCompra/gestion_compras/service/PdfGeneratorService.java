package com.gestionCompra.gestion_compras.service;

import com.gestionCompra.gestion_compras.domain.entidades.*;
import com.gestionCompra.gestion_compras.dto.ManejoErrores;
import com.gestionCompra.gestion_compras.repository.*;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.core.io.ResourceLoader;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.http.HttpStatus;

@Service
public class PdfGeneratorService {

    @Autowired
    private SolicitudRepo solicitudRepo;
    @Autowired
    private AprobacionSolicitudRepo aprobacionSolicitudRepo;
    @Autowired
    private PresupuestoRepo presupuestoRepo;
    @Autowired
    private AprobacionPresuRepo aprobacionPresuRepo;
    @Autowired
    private CompraRepo compraRepo;
    @Autowired
    private EvaluacionEntregaRepo evaluacionRepo;
    @Autowired
    private CierreRepo cierreRepo;

    @Autowired
    private ReclamoRepo reclamoRepo;
    @Autowired
    private ResourceLoader resourceLoader;

    @Autowired
    private EvalProveedorRepo evalProveedorRepo;

    private final DateTimeFormatter formateo = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    // --- PALETA DE COLORES ---
    private static final Color COL_PRIMARY_DARK = Color.decode("#063940");
    private static final Color COL_SECONDARY = Color.decode("#3e838c");
    private static final Color COL_TABLE_HEADER = Color.decode("#8ebdb6");
    private static final Color COL_TEXT_BODY = Color.decode("#1f2937");
    private static final Color COL_WHITE = Color.WHITE;
    private static final Color COL_LINK = Color.BLUE; // Color para los links

    // --- FUENTES ---
    private static final String FONT_REGULAR_PATH = "/fonts/AsapCondensed-Regular.ttf";
    private static final String FONT_BOLD_PATH = "/fonts/AsapCondensed-Bold.ttf";

    public byte[] generarExpedienteCompleto(Integer idCierre) throws Exception {
        Cierre cierre = cierreRepo.findById(idCierre).orElseThrow(() -> new ManejoErrores(HttpStatus.NOT_FOUND, "Cierre no encontrado"));

        if (cierre.getEvaluacionEntrega() == null || cierre.getEvaluacionEntrega().getCompra() == null) {
            throw new ManejoErrores(HttpStatus.UNPROCESSABLE_ENTITY, "Expediente incompleto");
        }

        Solicitud solicitud = cierre.getEvaluacionEntrega().getCompra()
                .getAprobacionPresupuesto().getPresupuesto()
                .getAprobacionSolicitud().getSolicitud();

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate());
            // CAPTURAMOS EL WRITER PARA PODER IMPORTAR PÁGINAS LUEGO
            PdfWriter writer = PdfWriter.getInstance(document, out);

            document.open();

            // ==========================================
            //       SECCIÓN 1: REPORTE PRINCIPAL
            // ==========================================
            // ... (Fuentes y Header igual que antes) ...
            Font titleFont = getBrandFont(true, 16, COL_PRIMARY_DARK);
            Font sectionFont = getBrandFont(true, 12, COL_SECONDARY);
            Font headerTableFont = getBrandFont(true, 10, COL_PRIMARY_DARK);
            Font normalFont = getBrandFont(false, 10, COL_TEXT_BODY);
            Font boldValueFont = getBrandFont(true, 10, COL_TEXT_BODY);
            Font whiteLabelFont = getBrandFont(true, 10, COL_WHITE);
            Font whiteValueFont = getBrandFont(false, 10, COL_WHITE);

            // 1. HEADER (Logos y Títulos)
            generarHeader(document, titleFont, whiteLabelFont, whiteValueFont, normalFont);

            // 2. DATOS SOLICITUD
            addSectionTitle(document, "1. DATOS DE LA SOLICITUD", sectionFont);
            PdfPTable solTable = new PdfPTable(2);
            solTable.setWidthPercentage(100);
            solTable.addCell(createFieldCell("Solicitante", solicitud.getUsuario().getUsername(), normalFont, boldValueFont));
            solTable.addCell(createFieldCell("Sector", solicitud.getUsuario().getSector().getNombre(), normalFont, boldValueFont));
            solTable.addCell(createFieldCell("Fecha", solicitud.getFecha().format(formateo), normalFont, boldValueFont));
            solTable.addCell(createFieldCell("Estado", "FINALIZADO", normalFont, boldValueFont));
            document.add(solTable);
            document.add(new Paragraph("\n"));

            // 3. PRODUCTOS
            addSectionTitle(document, "2. DETALLE DE PRODUCTOS", sectionFont);
            PdfPTable soliTable = new PdfPTable(4);
            soliTable.setWidthPercentage(100);
            String[] headers = {"Producto", "Cantidad", "Prioridad", "Fecha Admisible"};
            for (String h : headers) {
                PdfPCell c = new PdfPCell(new Phrase(h, headerTableFont));
                c.setBackgroundColor(COL_TABLE_HEADER);
                c.setHorizontalAlignment(Element.ALIGN_CENTER);
                c.setPadding(6);
                soliTable.addCell(c);
            }
            soliTable.addCell(new Phrase(solicitud.getProducto().getNombre(), normalFont));
            soliTable.addCell(new Phrase(solicitud.getCantidad().toString(), normalFont));
            soliTable.addCell(new Phrase(solicitud.getNivelPrioridad().getCategoria(), normalFont));
            soliTable.addCell(new Phrase(solicitud.getFechaAdmisible().format(formateo), normalFont));
            document.add(soliTable);
            document.add(new Paragraph("\n"));

            // 4. APROBACIÓN SOLICITUD
            addSectionTitle(document, "3. APROBACIÓN DE LA SOLICITUD", sectionFont);
            PdfPTable firmaSolTable = new PdfPTable(3);
            firmaSolTable.setWidthPercentage(100);
            AprobacionSolicitud as = aprobacionSolicitudRepo.findBySolicitud_IdSolicitud(solicitud.getIdSolicitud()).orElse(null);
            if (as != null) {
                firmaSolTable.addCell(createFieldCell("Aprobado por", as.getUsuario().getUsername(), normalFont, boldValueFont));
                firmaSolTable.addCell(createFieldCell("Sector", as.getUsuario().getSector().getNombre(), normalFont, boldValueFont));
                firmaSolTable.addCell(createFieldCell("Fecha", as.getFecha().format(formateo), normalFont, boldValueFont));
            } else {
                firmaSolTable.addCell(new Phrase("PENDIENTE", normalFont));
            }
            document.add(firmaSolTable);
            document.add(new Paragraph("\n"));

            // --- 5. PRESUPUESTOS (CON LINK INTERNO) ---
            addSectionTitle(document, "4. TABLA DE PRESUPUESTOS", sectionFont);
            PdfPTable presuTable = new PdfPTable(8); // 8 columnas
            presuTable.setWidthPercentage(100);
            presuTable.setWidths(new float[]{2f, 2f, 1.5f, 1.5f, 1f, 2f, 1.5f, 1.5f});

            String[] headersP = {"Proveedor", "Cargado por", "F. Solicitud", "F. Recep", "Cot. OK", "Observaciones", "Estado", "Anexo"};
            for (String h : headersP) {
                PdfPCell c = new PdfPCell(new Phrase(h, headerTableFont));
                c.setBackgroundColor(COL_TABLE_HEADER);
                c.setPadding(5);
                presuTable.addCell(c);
            }

            List<Presupuesto> listaPresupuestos = null;
            if (as != null) {
                listaPresupuestos = presupuestoRepo.findByAprobacionSolicitud_Id(as.getId());
                if (listaPresupuestos != null && !listaPresupuestos.isEmpty()) {
                    for (Presupuesto p : listaPresupuestos) {
                        presuTable.addCell(new Phrase(p.getProveedor().getNombreContacto(), normalFont));
                        presuTable.addCell(new Phrase(p.getUsuario().getUsername(), normalFont));
                        presuTable.addCell(new Phrase(p.getFechaSolicitud() != null ? p.getFechaSolicitud().toString() : "-", normalFont));
                        presuTable.addCell(new Phrase(p.getFechaRecepcion() != null ? p.getFechaRecepcion().toString() : "-", normalFont));
                        presuTable.addCell(new Phrase(p.getCotizacionSatisfactoria() ? "SI" : "NO", normalFont));
                        presuTable.addCell(new Phrase(p.getObservaciones() != null ? p.getObservaciones() : "", normalFont));

                        AprobacionPresupuesto ap = aprobacionPresuRepo.findByPresupuesto_IdPresupuesto(p.getIdPresupuesto()).orElse(null);
                        presuTable.addCell(new Phrase(ap != null ? ap.getEstado() : "PENDIENTE", normalFont));

                        // ---> LINK INTERNO (GOTO) <---
                        // Creamos un identificador único para el destino: "PRESU_123"
                        String destino = "PRESU_" + p.getIdPresupuesto();
                        presuTable.addCell(createLocalLinkCell("Ver PDF", destino, normalFont));
                    }
                } else {
                    PdfPCell emptyCell = new PdfPCell(new Phrase("Sin registros", normalFont));
                    emptyCell.setColspan(8);
                    presuTable.addCell(emptyCell);
                }
            }
            document.add(presuTable);

            // 6. ADJUDICACIÓN
            addSectionTitle(document, "5. APROBACIÓN DEL PRESUPUESTO", sectionFont);
            PdfPTable firmaPresuTable = new PdfPTable(3);
            firmaPresuTable.setWidthPercentage(100);
            AprobacionPresupuesto apFinal = null;
            // ... (Lógica de búsqueda apFinal igual) ...
            if (as != null) {
                List<Presupuesto> presupuestos = presupuestoRepo.findByAprobacionSolicitud_Id(as.getId());
                int i = 0;
                while (i < presupuestos.size() && apFinal == null) {
                    if (presupuestos.get(i) != null) {
                        AprobacionPresupuesto temp = aprobacionPresuRepo.findByPresupuesto_IdPresupuesto(presupuestos.get(i).getIdPresupuesto()).orElse(null);
                        if (temp != null && "APROBADA".equalsIgnoreCase(temp.getEstado())) {
                            apFinal = temp;
                        }
                    }
                    i++;
                }
            }

            if (apFinal != null) {
                firmaPresuTable.addCell(createFieldCell("Adjudicado por", apFinal.getUsuario().getUsername(), normalFont, boldValueFont));
                firmaPresuTable.addCell(createFieldCell("Sector", apFinal.getUsuario().getSector().getNombre(), normalFont, boldValueFont));
                firmaPresuTable.addCell(createFieldCell("Fecha", apFinal.getFecha().format(formateo), normalFont, boldValueFont));
            } else {
                firmaPresuTable.addCell(new Phrase("NO ADJUDICADO", normalFont));
            }
            document.add(firmaPresuTable);

            // 7. COMPRA (CON LINK INTERNO)
            addSectionTitle(document, "6. EJECUCIÓN DE COMPRA", sectionFont);
            Compra compra = null;
            if (apFinal != null) {
                compra = compraRepo.findByAprobacionPresupuesto_Id(apFinal.getId()).orElse(null);
            }

            if (compra != null) {
                PdfPTable compraTable = new PdfPTable(2);
                compraTable.setWidthPercentage(100);
                compraTable.addCell(createFieldCell("Gestionado por", compra.getUsuario().getUsername(), normalFont, boldValueFont));
                compraTable.addCell(createFieldCell("Fecha Solicitud Prov.", compra.getFechaSolicitud().toString(), normalFont, boldValueFont));
                compraTable.addCell(createFieldCell("Recepción Real", compra.getFechaRecepcion() != null ? compra.getFechaRecepcion().toString() : "-", normalFont, boldValueFont));

                String pathFactura = compra.getFacturaPdfPath();
                File facturaFile = null;

                if (pathFactura != null && !pathFactura.trim().isEmpty()) {
                    facturaFile = new File("uploads/" + pathFactura.trim());
                }

                if (facturaFile != null && facturaFile.exists()) {
                    // Creamos UNA sola frase que contenga tanto el título como el link
                    Phrase phrase = new Phrase();
                    phrase.add(new Chunk("Factura: ", normalFont));

                    String destinoCompra = "COMPRA_" + compra.getIdCompra();
                    Chunk linkChunk = new Chunk("Ver Factura Adjunta (Abajo)", boldValueFont);
                    linkChunk.setLocalGoto(destinoCompra);

                    // Estilo del link
                    Font linkFont = new Font(boldValueFont);
                    linkFont.setColor(COL_LINK); 
                    linkFont.setStyle(Font.UNDERLINE);
                    linkChunk.setFont(linkFont);

                    phrase.add(linkChunk);

                    PdfPCell cell = new PdfPCell(phrase);
                    cell.setPaddingBottom(5);
                    compraTable.addCell(cell); // Agregamos la celda número 4 (fila completada)
                } else {
                    compraTable.addCell(createFieldCell("Factura", "NO ADJUNTA", normalFont, boldValueFont));
                }
                document.add(compraTable);

                // 8 y 9 (Evaluación y Cierre - Igual que antes)
                EvaluacionEntrega eval = evaluacionRepo.findByCompra_IdCompra(compra.getIdCompra()).orElse(null);
                if (eval != null) {
                    document.add(new Paragraph("\n"));
                    addSectionTitle(document, "7. EVALUACIÓN ENTREGA", sectionFont);
                    PdfPTable evalTable = new PdfPTable(1);
                    evalTable.setWidthPercentage(100);
                    evalTable.addCell(createFieldCell("Resultado", eval.getCumpleCondiciones() ? "CUMPLE" : "NO CUMPLE", normalFont, boldValueFont));
                    evalTable.addCell(createFieldCell("Obs", eval.getObservaciones(), normalFont, boldValueFont));
                    document.add(evalTable);

                    Reclamo reclamo = reclamoRepo.findByEvaluacionEntrega_IdEvaluacionEntrega(eval.getIdEvaluacionEntrega()).orElse(null);

                    if (reclamo != null && !eval.getCumpleCondiciones()) {
                        document.add(new Paragraph("\n"));
                        addSectionTitle(document, "5. GESTIÓN DE RECLAMOS", sectionFont);

                        PdfPTable recTable = new PdfPTable(2);
                        recTable.setWidthPercentage(100);

                        // 1. Motivo del Reclamo
                        recTable.addCell(createFieldCell("Motivo Reclamo", reclamo.getDetalleReclamo(), normalFont, boldValueFont));

                        // 2. Fecha del Reclamo
                        recTable.addCell(createFieldCell("Fecha Reclamo", reclamo.getFechaReclamo().toString(), normalFont, boldValueFont));

                        // 3. Respuesta del Proveedor (CONVERSION DE ENUM A STRING)
                        String respuestaStr = (reclamo.getRespuestaProveedor() != null)
                                ? reclamo.getRespuestaProveedor().name()
                                : "PENDIENTE";
                        recTable.addCell(createFieldCell("Respuesta Proveedor", respuestaStr, normalFont, boldValueFont));

                        // 4. ¿Nueva Entrega?
                        recTable.addCell(createFieldCell("¿Nueva Entrega?", (reclamo.getEntregaNueva() != null && reclamo.getEntregaNueva()) ? "SI" : "NO", normalFont, boldValueFont));

                        document.add(recTable);
                    }

                    if (cierre != null) {
                        document.add(new Paragraph("\n"));
                        addSectionTitle(document, "8. CIERRE FINAL", sectionFont);
                        PdfPTable cierreTable = new PdfPTable(3);
                        cierreTable.setWidthPercentage(100);
                        cierreTable.addCell(createFieldCell("Cerrado por", cierre.getUsuario().getUsername(), normalFont, boldValueFont));
                        cierreTable.addCell(createFieldCell("Fecha", cierre.getFechaCierre().toString(), normalFont, boldValueFont));
                        cierreTable.addCell(new Phrase("EXPEDIENTE ARCHIVADO", boldValueFont));
                        document.add(cierreTable);
                    }
                }
            } else {
                document.add(new Paragraph("Proceso incompleto", normalFont));
            }

            // ==========================================
            //       SECCIÓN 2: FUSIÓN DE ANEXOS
            // ==========================================
            // A. Adjuntar PDFs de Presupuestos
            if (listaPresupuestos != null) {
                for (Presupuesto p : listaPresupuestos) {
                    if (p.getArchivoPdfPath() != null && !p.getArchivoPdfPath().isEmpty()) {
                        String destino = "PRESU_" + p.getIdPresupuesto();
                        String titulo = "ANEXO: PRESUPUESTO - " + p.getProveedor().getNombreEmpresa();
                        // LLAMAMOS AL HELPER DE FUSIÓN
                        fusionarPdfExterno(document, writer, p.getArchivoPdfPath(), destino, titulo);
                    }
                }
            }

            // B. Adjuntar PDF de Factura
            if (compra != null && compra.getFacturaPdfPath() != null && !compra.getFacturaPdfPath().isEmpty()) {
                String destino = "COMPRA_" + compra.getIdCompra();
                String titulo = "ANEXO: FACTURA DE COMPRA";
                fusionarPdfExterno(document, writer, compra.getFacturaPdfPath(), destino, titulo);
            }

            document.close();
            return out.toByteArray();
        }
    }

    // --- HELPER 1: CREAR LINK INTERNO (En la tabla) ---
    private PdfPCell createLocalLinkCell(String text, String destinationName, Font font) {
        // Creamos una "Frase" que actúa como botón
        Chunk chunk = new Chunk(text, font);
        chunk.setLocalGoto(destinationName); // <-- MAGIA: Apunta al nombre del destino

        // Estilo de link
        Font linkFont = new Font(font);
        linkFont.setColor(COL_LINK);
        linkFont.setStyle(Font.UNDERLINE);
        chunk.setFont(linkFont);

        PdfPCell cell = new PdfPCell(new Phrase(chunk));
        cell.setPaddingBottom(5);
        return cell;
    }

    // --- HELPER 2: FUSIONAR PDF EXTERNO Y PONER EL ANCLA ---
   private void fusionarPdfExterno(Document document, PdfWriter writer,
                                String fileName, String destinationName, String title) {
    try {
        String filePath = "uploads/" + fileName.trim();
        File file = new File(filePath);

        if (!file.exists()) {
            return;
        }

        PdfReader reader = new PdfReader(filePath);
        int n = reader.getNumberOfPages();

        for (int i = 1; i <= n; i++) {
            // 1. ADAPTAR EL TAMAÑO: Lee el tamaño y rotación original del PDF adjunto
            Rectangle pageSize = reader.getPageSizeWithRotation(i);
            document.setPageSize(pageSize);
            document.newPage(); // Crea la hoja con el tamaño correcto

            // 2. CREAR EL ANCLA: Solo en la primera página del anexo
            if (i == 1) {
                PdfContentByte cb = writer.getDirectContent();
                cb.localDestination(destinationName, new PdfDestination(PdfDestination.FIT));
            }

            // 3. INSERTAR COMO IMAGEN: Esto soluciona las deformaciones y respeta la rotación
            PdfImportedPage page = writer.getImportedPage(reader, i);
            Image image = Image.getInstance(page);
            image.setAbsolutePosition(0, 0);
            document.add(image);
        }

        reader.close();

        // 4. RESTAURAR TAMAÑO ORIGINAL: Volvemos al A4 Horizontal por si agregas más cosas después
        document.setPageSize(PageSize.A4.rotate());

    } catch (Exception e) {
        System.err.println("Error fusionando PDF: " + fileName + " - " + e.getMessage());
    }
}
    // --- MÉTODOS AUXILIARES EXISTENTES (Resumidos para no ocupar espacio) ---
    private void generarHeader(Document doc, Font titleFont, Font wl, Font wv, Font nf) throws Exception {
        PdfPTable headerTable = new PdfPTable(3);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{2f, 5f, 3f});

        // Logo
        try {
            var resource = resourceLoader.getResource("classpath:static/logo2.png");
            Image logo = Image.getInstance(resource.getURL());
            logo.scaleToFit(80, 80);
            PdfPCell logoCell = new PdfPCell(logo);
            logoCell.setBorder(Rectangle.NO_BORDER);
            headerTable.addCell(logoCell);
        } catch (Exception e) {
            headerTable.addCell(createCell("", nf, Color.WHITE));
        }

        // Título
        PdfPCell titleCell = new PdfPCell(new Phrase("EXPEDIENTE DE COMPRA FINALIZADO", titleFont));
        titleCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        titleCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        titleCell.setBorder(Rectangle.NO_BORDER);
        headerTable.addCell(titleCell);

        // Info Derecha
        PdfPTable infoTable = new PdfPTable(2);
        infoTable.addCell(createCell("Identificación", wl, COL_SECONDARY));
        infoTable.addCell(createCell("Form. 8.02", wv, COL_PRIMARY_DARK));
        infoTable.addCell(createCell("Revisión N°:", wl, COL_SECONDARY));
        infoTable.addCell(createCell("5", wv, COL_PRIMARY_DARK));

        infoTable.addCell(createCell("Fecha:", wl, COL_SECONDARY));
        infoTable.addCell(createCell("15/03/2025", wv, COL_PRIMARY_DARK));
        PdfPCell infoWrapper = new PdfPCell(infoTable);
        infoWrapper.setBorder(Rectangle.NO_BORDER);
        headerTable.addCell(infoWrapper);

        doc.add(headerTable);
        doc.add(new Paragraph("\n"));
    }

    private Font getBrandFont(boolean isBold, float size, Color color) {
        try {
            String fontPath = isBold ? FONT_BOLD_PATH : FONT_REGULAR_PATH;
            return new Font(BaseFont.createFont(fontPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED), size, Font.NORMAL, color);
        } catch (Exception e) {
            return FontFactory.getFont(FontFactory.HELVETICA, size, isBold ? Font.BOLD : Font.NORMAL, color);
        }
    }

    public byte[] generarEvaluacionProveedorPdf(Integer idEval) throws Exception {
        EvaluacionProveedor eval = evalProveedorRepo.findById(idEval)
                .orElseThrow(() -> new ManejoErrores(HttpStatus.NOT_FOUND, "Evaluación no encontrada"));

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            // Fuentes institucionales
            Font titleFont = getBrandFont(true, 16, COL_PRIMARY_DARK);
            Font sectionFont = getBrandFont(true, 12, COL_SECONDARY);
            Font headerTableFont = getBrandFont(true, 10, COL_PRIMARY_DARK);
            Font normalFont = getBrandFont(false, 10, COL_TEXT_BODY);
            Font boldFont = getBrandFont(true, 10, COL_TEXT_BODY);
            Font whiteLabelFont = getBrandFont(true, 10, COL_WHITE);

            // 1. Header (Logos y Títulos)
            generarHeaderEvaluacion(document, titleFont);

            // 2. Información General (Diseño idéntico al Excel)
            PdfPTable infoTable = new PdfPTable(4);
            infoTable.setWidthPercentage(100);
            infoTable.setWidths(new float[]{2f, 4f, 2f, 1f});

            // Fila 1: Proveedor y Período
            infoTable.addCell(createCell("Proveedor", whiteLabelFont, COL_SECONDARY));
            infoTable.addCell(new Phrase(eval.getProveedor().getNombreEmpresa(), boldFont));
            infoTable.addCell(createCell("Período Evaluado", whiteLabelFont, COL_SECONDARY));
            PdfPCell periodoCell = new PdfPCell(new Phrase(eval.getPeriodoEvaluado().toString(), boldFont));
            periodoCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            periodoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            infoTable.addCell(periodoCell);

            // Fila 2: Servicio o Producto
            infoTable.addCell(createCell("Servicio o Producto", whiteLabelFont, COL_SECONDARY));
            PdfPCell servicioCell = new PdfPCell(new Phrase(eval.getServicioProducto(), boldFont));
            servicioCell.setColspan(3);
            servicioCell.setPadding(5);
            infoTable.addCell(servicioCell);

            // Fila 3: Persona / Contacto
            infoTable.addCell(createCell("Persona / Contacto", whiteLabelFont, COL_SECONDARY));
            PdfPCell contactoCell = new PdfPCell(new Phrase(eval.getProveedor().getNombreContacto(), boldFont));
            contactoCell.setColspan(3);
            contactoCell.setPadding(5);
            infoTable.addCell(contactoCell);

            document.add(infoTable);

            // 3. Tabla de Calificaciones
            document.add(new Paragraph("\n"));
            addSectionTitle(document, "CALIFICACIÓN DEL PRODUCTO O SERVICIO", sectionFont);
            PdfPTable calTable = new PdfPTable(2);
            calTable.setWidthPercentage(100);
            calTable.setWidths(new float[]{3f, 1f});

            String[] headers = {"Criterios de Evaluación", "Puntaje Obtenido"};
            for (String h : headers) {
                PdfPCell c = new PdfPCell(new Phrase(h, headerTableFont));
                c.setBackgroundColor(COL_TABLE_HEADER);
                c.setHorizontalAlignment(Element.ALIGN_CENTER);
                c.setPadding(6);
                calTable.addCell(c);
            }

            agregarFilaCalificacion(calTable, "Calidad del Producto o Servicio", eval.getCalidadproducto().toString(), normalFont, boldFont);
            agregarFilaCalificacion(calTable, "Cumplimiento de los Plazos de Entrega", eval.getCumplimientoplazos().toString(), normalFont, boldFont);
            agregarFilaCalificacion(calTable, "Atención al Cliente", eval.getAtencioncliente().toString(), normalFont, boldFont);
            agregarFilaCalificacion(calTable, "Respuesta a Reclamos", eval.getRespuestareclamos().toString(), normalFont, boldFont);
            agregarFilaCalificacion(calTable, "Precios de Productos o Servicios", eval.getPrecioservicio().toString(), normalFont, boldFont);
            agregarFilaCalificacion(calTable, "Gestión Administrativa del Proveedor", eval.getGestionadministrativa().toString(), normalFont, boldFont);

            document.add(calTable);

            // 4. Resultados Finales y SGC
            document.add(new Paragraph("\n"));
            PdfPTable resTable = new PdfPTable(3);
            resTable.setWidthPercentage(100);

            resTable.addCell(createCell("Nivel de Aprobación", whiteLabelFont, COL_SECONDARY));
            resTable.addCell(createCell("Proveedor con SGC (SI/NO)", whiteLabelFont, COL_SECONDARY));
            resTable.addCell(createCell("Resultado Final", whiteLabelFont, COL_SECONDARY));

            resTable.addCell(createAlignCenterCell(eval.getNivelaprobacion().toString() + "%", normalFont));
            resTable.addCell(createAlignCenterCell(eval.getProveedorSgc() ? "SI" : "NO", boldFont));

            String statusText = eval.getAprobado() ? "APROBADO" : "NO APROBADO";
            PdfPCell resultCell = createAlignCenterCell(statusText + " (" + eval.getResultado() + "%)", titleFont);
            resultCell.setBackgroundColor(eval.getAprobado() ? Color.decode("#dcfce7") : Color.decode("#fee2e2"));
            resTable.addCell(resultCell);

            document.add(resTable);

            // 5. Bloque de Comentarios Varios
            document.add(new Paragraph("\n"));
            PdfPTable commentTable = new PdfPTable(2);
            commentTable.setWidthPercentage(100);
            commentTable.setWidths(new float[]{1f, 4f});

            PdfPCell labelComm = createCell("Comentarios Varios", whiteLabelFont, COL_SECONDARY);
            labelComm.setMinimumHeight(60);
            labelComm.setVerticalAlignment(Element.ALIGN_MIDDLE);
            commentTable.addCell(labelComm);

            PdfPCell valComm = new PdfPCell(new Phrase(eval.getComentarios() != null ? eval.getComentarios() : "", normalFont));
            valComm.setPadding(8);
            commentTable.addCell(valComm);

            document.add(commentTable);

            // 6. Pie de página: Fecha y Firma
            document.add(new Paragraph("\n"));
            PdfPTable footerTable = new PdfPTable(2);
            footerTable.setWidthPercentage(100);

            footerTable.addCell(createFieldCell("Fecha Evaluación", eval.getFecha().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), normalFont, boldFont));
            footerTable.addCell(createFieldCell("Firma Responsable", eval.getFirmaResponsable(), normalFont, boldFont));

            document.add(footerTable);

            document.close();
            return out.toByteArray();
        }
    }

    private PdfPCell createAlignCenterCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(6);
        return cell;
    }

    private void agregarFilaCalificacion(PdfPTable table, String criterio, String valor, Font nf, Font bf) {
        table.addCell(new Phrase(criterio, nf));
        PdfPCell c = new PdfPCell(new Phrase(valor, bf));
        c.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(c);
    }

    private void generarHeaderEvaluacion(Document doc, Font titleFont) throws Exception {
        // Obtenemos fuentes para el mini-cuadro de la derecha
        Font wl = getBrandFont(true, 10, COL_WHITE);
        Font wv = getBrandFont(false, 10, COL_WHITE);
        Font nf = getBrandFont(false, 10, COL_TEXT_BODY);

        PdfPTable headerTable = new PdfPTable(3);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{2f, 5f, 3f});

        // Logo
        try {
            var resource = resourceLoader.getResource("classpath:static/logo2.png");
            Image logo = Image.getInstance(resource.getURL());
            logo.scaleToFit(80, 80);
            PdfPCell logoCell = new PdfPCell(logo);
            logoCell.setBorder(Rectangle.NO_BORDER);
            headerTable.addCell(logoCell);
        } catch (Exception e) {
            headerTable.addCell(new PdfPCell(new Phrase("")));
        }

        // Título central
        PdfPCell titleCell = new PdfPCell(new Phrase("EVALUACIÓN DE PROVEEDORES", titleFont));
        titleCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        titleCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        titleCell.setBorder(Rectangle.NO_BORDER);
        headerTable.addCell(titleCell);

        // Cuadro de control de calidad (Derecha)
        PdfPTable infoTable = new PdfPTable(2);
        infoTable.addCell(createCell("Identificación", wl, COL_SECONDARY));
        infoTable.addCell(createCell("Form. 8.01", wv, COL_PRIMARY_DARK));
        infoTable.addCell(createCell("Revisión N°:", wl, COL_SECONDARY));
        infoTable.addCell(createCell("1", wv, COL_PRIMARY_DARK));
        infoTable.addCell(createCell("Fecha Vigencia:", wl, COL_SECONDARY));
        infoTable.addCell(createCell("18/05/2019", wv, COL_PRIMARY_DARK));

        PdfPCell infoWrapper = new PdfPCell(infoTable);
        infoWrapper.setBorder(Rectangle.NO_BORDER);
        headerTable.addCell(infoWrapper);

        doc.add(headerTable);
        doc.add(new Paragraph("\n"));
    }

    private PdfPCell createFieldCell(String label, String value, Font labelFont, Font valueFont) {
        Phrase p = new Phrase();
        p.add(new Chunk(label + ": ", labelFont));
        p.add(new Chunk(value != null ? value : "---", valueFont));
        PdfPCell cell = new PdfPCell(p);
        cell.setPaddingBottom(5);
        return cell;
    }

    private void addSectionTitle(Document doc, String title, Font font) throws DocumentException {
        Paragraph p = new Paragraph(title, font);
        p.setSpacingBefore(10);
        p.setSpacingAfter(5);
        doc.add(p);
    }

    private PdfPCell createCell(String text, Font font, Color bgColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bgColor);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(6);
        cell.setBorderColor(Color.WHITE);
        return cell;
    }

}

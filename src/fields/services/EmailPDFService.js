'use strict';

import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';

/**
 * Servicio reutilizable para generar un PDF con datos de cualquier entidad
 * del sistema de Gestión de Restaurante y enviarlo por correo con Nodemailer + Gmail.
 *
 * USO:
 *   const service = new EmailPDFService();
 *   await service.sendEntityPDF({
 *       toEmail: 'destino@gmail.com',
 *       subject: 'Reporte de Eventos',
 *       title: 'Listado de Eventos Gastronómicos',
 *       entityName: 'Evento',
 *       data: [...],
 *       fields: [
 *           { label: 'Nombre', key: 'name' },
 *           { label: 'Fecha',  key: 'date' },
 *       ]
 *   });
 */
export class EmailPDFService {

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: { rejectUnauthorized: false }
        });
    }

    /**
     * Genera el PDF en memoria como Buffer
     */
    generatePDF({ title, entityName, data, fields }) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50, bufferPages: true });
            const buffers = [];

            doc.on('data', chunk => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            const records = Array.isArray(data) ? data : [data];
            const generatedAt = new Date().toLocaleString('es-GT', { timeZone: 'America/Guatemala' });

            /* ── HEADER CORPORATIVO ─────────────────────────── */
            doc.rect(0, 0, doc.page.width, 80).fill('#1B4332');

            doc.fillColor('#FFFFFF')
                .fontSize(22)
                .font('Helvetica-Bold')
                .text('🍽  GESTIÓN RESTAURANTE', 50, 25);

            doc.fontSize(11)
                .font('Helvetica')
                .fillColor('#B7E4C7')
                .text('Sistema de Reportes Gastronómicos', 50, 52);

            doc.moveDown(3);

            /* ── TÍTULO DEL REPORTE ──────────────────────────── */
            doc.fillColor('#1B4332')
                .fontSize(18)
                .font('Helvetica-Bold')
                .text(title, { align: 'center' });

            doc.moveDown(0.5);

            doc.fillColor('#6C757D')
                .fontSize(10)
                .font('Helvetica')
                .text(`Generado el ${generatedAt}`, { align: 'center' });

            doc.moveDown(1.5);

            /* ── TARJETA RESUMEN ─────────────────────────────── */
            const summaryTop = doc.y;
            doc.roundedRect(50, summaryTop, 495, 60, 8).fill('#F1F8F4');

            doc.fillColor('#1B4332')
                .fontSize(11)
                .font('Helvetica-Bold')
                .text('Entidad:', 70, summaryTop + 12);
            doc.font('Helvetica').fillColor('#333333')
                .text(entityName, 155, summaryTop + 12);

            doc.font('Helvetica-Bold').fillColor('#1B4332')
                .text('Total de registros:', 70, summaryTop + 35);
            doc.font('Helvetica').fillColor('#333333')
                .text(String(records.length), 200, summaryTop + 35);

            doc.moveDown(4);

            /* ── REGISTROS ───────────────────────────────────── */
            records.forEach((record, index) => {
                const obj = record.toObject ? record.toObject() : record;

                // Encabezado del registro
                const boxTop = doc.y;
                doc.roundedRect(50, boxTop, 495, 25, 6).fill('#1B4332');
                doc.fillColor('#FFFFFF')
                    .fontSize(11)
                    .font('Helvetica-Bold')
                    .text(`Registro #${index + 1}`, 65, boxTop + 7);

                doc.moveDown(1.5);

                // Filas de campos
                fields.forEach((field, fi) => {
                    const value = this._resolveValue(obj, field.key);
                    const rowY = doc.y;
                    const bgColor = fi % 2 === 0 ? '#F9FBF9' : '#FFFFFF';

                    doc.rect(50, rowY, 495, 22).fill(bgColor);

                    doc.fillColor('#1B4332')
                        .fontSize(10)
                        .font('Helvetica-Bold')
                        .text(field.label, 65, rowY + 6, { width: 180 });

                    doc.fillColor('#212529')
                        .font('Helvetica')
                        .text(String(value ?? 'N/A'), 250, rowY + 6, { width: 285 });

                    doc.moveDown(0.55);
                });

                doc.moveDown(1.2);

                if (doc.y > 700 && index < records.length - 1) {
                    doc.addPage();
                }
            });

            /* ── FOOTER ──────────────────────────────────────── */
            const pageCount = doc.bufferedPageRange().count;
            for (let i = 0; i < pageCount; i++) {
                doc.switchToPage(i);
                doc.fontSize(8)
                    .fillColor('#ADB5BD')
                    .text(
                        `Documento generado automáticamente por Gestión Restaurante | Página ${i + 1} de ${pageCount}`,
                        50,
                        doc.page.height - 40,
                        { align: 'center' }
                    );
            }

            doc.end();
        });
    }

    /**
     * Genera el PDF y lo envía por correo como adjunto
     */
    async sendEntityPDF({ toEmail, subject, title, entityName, data, fields, filename }) {
        const pdfBuffer = await this.generatePDF({ title, entityName, data, fields });
        const pdfFilename = filename || `${entityName.toLowerCase()}_reporte.pdf`;

        await this.transporter.sendMail({
            from: `"Gestión Restaurante" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject,
            html: `
<div style="background-color:#f4f6f9; padding:40px 0; font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">

    <div style="background-color:#1B4332; padding:20px 30px;">
      <h1 style="margin:0; color:#fff; font-size:20px;">🍽 Gestión Restaurante</h1>
      <p style="margin:5px 0 0; color:#B7E4C7; font-size:13px;">Sistema de Reportes Gastronómicos</p>
    </div>

    <div style="padding:30px; color:#333;">
      <h2 style="margin-top:0; font-size:18px; color:#1B4332;">${subject}</h2>
      <p style="font-size:14px; line-height:1.6;">Estimado usuario,</p>
      <p style="font-size:14px; line-height:1.6;">
        Se ha generado el reporte correspondiente a la entidad <strong>${entityName}</strong>.
      </p>
      <div style="background:#f1f8f4; padding:15px; border-left:4px solid #1B4332; margin:20px 0;">
        <p style="margin:0; font-size:13px;"><strong>Fecha de generación:</strong><br>${new Date().toLocaleString('es-GT')}</p>
        <p style="margin:8px 0 0; font-size:13px;"><strong>Total de registros incluidos:</strong><br>${Array.isArray(data) ? data.length : 1}</p>
      </div>
      <p style="font-size:14px; line-height:1.6;">El documento PDF se encuentra adjunto a este correo.</p>
    </div>

    <div style="background:#f1f1f1; padding:15px 30px; text-align:center;">
      <p style="margin:0; font-size:12px; color:#777;">Mensaje generado automáticamente por Gestión Restaurante.</p>
      <p style="margin:5px 0 0; font-size:11px; color:#999;">© ${new Date().getFullYear()} Gestión Restaurante. Todos los derechos reservados.</p>
    </div>
  </div>
</div>`,
            attachments: [{ filename: pdfFilename, content: pdfBuffer, contentType: 'application/pdf' }]
        });

        return { toEmail, filename: pdfFilename, records: Array.isArray(data) ? data.length : 1 };
    }

    /** Resuelve valores con dot-notation: "additionalServices.music" */
    _resolveValue(obj, key) {
        return key.split('.').reduce((acc, k) => (acc != null ? acc[k] : null), obj);
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// REPORTES EXCEL → DESCARGA DIRECTA
// ══════════════════════════════════════════════════════════════════════════════

// GET /reports/download-excel/general
export const downloadGeneralStatsExcel = async (req, res) => {
    try {
        const [restaurants, ordersAgg, reservationsAgg, eventsAgg, reviewsAgg] = await Promise.all([
            Restaurant.find({ isActive: true }).select('name averageRating totalReviews category'),
            Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, ingresos: { $sum: '$total' } } }]),
            Reservation.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            Event.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            Review.aggregate([{ $group: { _id: null, promedio: { $avg: '$rating' }, total: { $sum: 1 } } }])
        ]);

        const data = [
            ...restaurants.map(r => ({ concepto: 'Restaurante Activo', nombre: r.name, categoria: r.category, valor: r.averageRating, detalle: `${r.totalReviews} reseñas` })),
            ...ordersAgg.map(o => ({ concepto: `Órdenes (${o._id})`, nombre: '-', categoria: 'Órdenes', valor: o.count, detalle: `Q${o.ingresos?.toFixed(2) ?? 0}` })),
            ...reservationsAgg.map(r => ({ concepto: `Reservaciones (${r._id})`, nombre: '-', categoria: 'Reservaciones', valor: r.count, detalle: '-' })),
            ...eventsAgg.map(e => ({ concepto: `Eventos (${e._id})`, nombre: '-', categoria: 'Eventos', valor: e.count, detalle: '-' })),
            { concepto: 'Calificación Promedio', nombre: 'Sistema completo', categoria: 'Reviews', valor: reviewsAgg[0]?.promedio?.toFixed(2) ?? 'N/A', detalle: `${reviewsAgg[0]?.total ?? 0} reseñas` }
        ];

        const service = new ExcelReportService();
        const buffer  = await service.generateExcel({
            title: 'Estadísticas Generales', sheetName: 'Estadísticas', data,
            columns: [
                { header: 'Concepto',  key: 'concepto',  width: 30 },
                { header: 'Nombre',    key: 'nombre',    width: 25 },
                { header: 'Categoría', key: 'categoria', width: 18 },
                { header: 'Valor',     key: 'valor',     width: 15 },
                { header: 'Detalle',   key: 'detalle',   width: 25 },
            ]
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="estadisticas_generales.xlsx"');
        return res.send(buffer);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al generar Excel', error: error.message });
    }
};

// GET /reports/download-excel/top-dishes?limit=10&restaurantId=xxx
export const downloadTopDishesExcel = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const { restaurantId } = req.query;
        const mongoose = await getMongoose();

        const topDishes = await OrderDetail.aggregate([
            { $lookup: { from: 'dishes', localField: 'dish', foreignField: '_id', as: 'dishInfo' } },
            { $unwind: '$dishInfo' },
            ...(restaurantId ? [{ $match: { 'dishInfo.restaurant': new mongoose.Types.ObjectId(restaurantId) } }] : []),
            { $group: { _id: '$dish', nombre: { $first: '$dishInfo.name' }, precio: { $first: '$dishInfo.price' }, totalVendido: { $sum: '$quantity' }, ingresoGenerado: { $sum: '$subtotal' } } },
            { $sort: { totalVendido: -1 } }, { $limit: limit }
        ]);

        if (!topDishes.length) return res.status(404).json({ success: false, message: 'No hay datos de ventas de platos' });

        const data    = topDishes.map((d, i) => ({ ranking: i + 1, ...d }));
        const service = new ExcelReportService();
        const buffer  = await service.generateExcel({
            title: `Top ${limit} Platillos Más Vendidos`, sheetName: 'Top Platillos', data,
            columns: [
                { header: '#',                 key: 'ranking',         width: 8  },
                { header: 'Platillo',          key: 'nombre',          width: 30 },
                { header: 'Precio Unitario',   key: 'precio',          width: 18 },
                { header: 'Unidades Vendidas', key: 'totalVendido',    width: 20 },
                { header: 'Ingreso Generado',  key: 'ingresoGenerado', width: 20 },
            ]
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="top_platillos.xlsx"');
        return res.send(buffer);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al generar Excel', error: error.message });
    }
};

// GET /reports/download-excel/orders?restaurantId=xxx&status=paid
export const downloadOrdersExcel = async (req, res) => {
    try {
        const { restaurantId, status } = req.query;
        const mongoose = await getMongoose();
        const filter   = {};
        if (restaurantId) filter.restaurant = new mongoose.Types.ObjectId(restaurantId);
        if (status)       filter.status = status;

        const orders = await Order.find(filter).populate('restaurant', 'name').populate('table', 'number').sort({ createdAt: -1 });
        if (!orders.length) return res.status(404).json({ success: false, message: 'No hay órdenes con los filtros indicados' });

        const data    = orders.map(o => ({ id: o._id.toString(), restaurante: o.restaurant?.name ?? 'N/A', mesa: o.table?.number ?? 'N/A', tipo: o.type, estado: o.status, subtotal: o.subtotal, impuesto: o.tax, total: o.total, fecha: o.createdAt }));
        const service = new ExcelReportService();
        const buffer  = await service.generateExcel({
            title: 'Reporte de Órdenes', sheetName: 'Órdenes', data,
            columns: [
                { header: 'ID',          key: 'id',          width: 28 },
                { header: 'Restaurante', key: 'restaurante', width: 25 },
                { header: 'Mesa',        key: 'mesa',        width: 10 },
                { header: 'Tipo',        key: 'tipo',        width: 14 },
                { header: 'Estado',      key: 'estado',      width: 14 },
                { header: 'Subtotal',    key: 'subtotal',    width: 14 },
                { header: 'Impuesto',    key: 'impuesto',    width: 14 },
                { header: 'Total',       key: 'total',       width: 14 },
                { header: 'Fecha',       key: 'fecha',       width: 22 },
            ]
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="ordenes_reporte.xlsx"');
        return res.send(buffer);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al generar Excel', error: error.message });
    }
};

// GET /reports/download-excel/reservations?from=YYYY-MM-DD&to=YYYY-MM-DD
export const downloadReservationsExcel = async (req, res) => {
    try {
        const { from, to } = req.query;
        const filter = {};
        if (from || to) {
            filter.date = {};
            if (from) filter.date.$gte = new Date(from);
            if (to)   filter.date.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));
        }

        const reservations = await Reservation.find(filter).populate('table', 'number capacity').sort({ date: -1 });
        if (!reservations.length) return res.status(404).json({ success: false, message: 'No hay reservaciones con los filtros indicados' });

        const data    = reservations.map(r => ({ id: r._id.toString(), cliente: r.customerName, telefono: r.customerPhone, mesa: r.table?.number ?? 'N/A', fecha: r.date, personas: r.numberOfPeople, estado: r.status, notas: r.notes ?? '-', creado: r.createdAt }));
        const service = new ExcelReportService();
        const buffer  = await service.generateExcel({
            title: 'Reporte de Reservaciones', sheetName: 'Reservaciones', data,
            columns: [
                { header: 'ID',       key: 'id',       width: 28 },
                { header: 'Cliente',  key: 'cliente',  width: 25 },
                { header: 'Teléfono', key: 'telefono', width: 14 },
                { header: 'Mesa',     key: 'mesa',     width: 10 },
                { header: 'Fecha',    key: 'fecha',    width: 22 },
                { header: 'Personas', key: 'personas', width: 12 },
                { header: 'Estado',   key: 'estado',   width: 14 },
                { header: 'Notas',    key: 'notas',    width: 30 },
                { header: 'Creado',   key: 'creado',   width: 22 },
            ]
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="reservaciones_reporte.xlsx"');
        return res.send(buffer);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al generar Excel', error: error.message });
    }
};

// GET /reports/download-excel/events?restaurantId=xxx&status=active
export const downloadEventsExcel = async (req, res) => {
    try {
        const { restaurantId, status } = req.query;
        const mongoose = await getMongoose();
        const filter   = {};
        if (restaurantId) filter.restaurant = new mongoose.Types.ObjectId(restaurantId);
        if (status)       filter.status = status;

        const events = await Event.find(filter).populate('restaurant', 'name').sort({ date: 1 });
        if (!events.length) return res.status(404).json({ success: false, message: 'No hay eventos con los filtros indicados' });

        const data    = events.map(e => ({ id: e._id.toString(), nombre: e.name, restaurante: e.restaurant?.name ?? 'N/A', fecha: e.date, horaInicio: e.startTime, horaFin: e.endTime, capacidad: e.maxCapacity, precio: e.price, musica: e.additionalServices?.music ? 'Sí' : 'No', decoracion: e.additionalServices?.decoration ? 'Sí' : 'No', personal: e.additionalServices?.extraStaff ?? 0, estado: e.status }));
        const service = new ExcelReportService();
        const buffer  = await service.generateExcel({
            title: 'Reporte de Eventos Gastronómicos', sheetName: 'Eventos', data,
            columns: [
                { header: 'ID',          key: 'id',          width: 28 },
                { header: 'Nombre',      key: 'nombre',      width: 28 },
                { header: 'Restaurante', key: 'restaurante', width: 22 },
                { header: 'Fecha',       key: 'fecha',       width: 18 },
                { header: 'Hora Inicio', key: 'horaInicio',  width: 14 },
                { header: 'Hora Fin',    key: 'horaFin',     width: 14 },
                { header: 'Capacidad',   key: 'capacidad',   width: 12 },
                { header: 'Precio',      key: 'precio',      width: 12 },
                { header: 'Música',      key: 'musica',      width: 10 },
                { header: 'Decoración',  key: 'decoracion',  width: 13 },
                { header: 'Personal +',  key: 'personal',    width: 12 },
                { header: 'Estado',      key: 'estado',      width: 14 },
            ]
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="eventos_reporte.xlsx"');
        return res.send(buffer);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al generar Excel', error: error.message });
    }
};

// GET /reports/download-excel/restaurant/:restaurantId
// Genera un Excel con 3 hojas: Órdenes por día, Top platillos, Reviews
export const downloadRestaurantStatsExcel = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurante no encontrado' });

        const mongoose = await getMongoose();
        const rId      = new mongoose.Types.ObjectId(restaurantId);

        const [ordersPerDay, topDishes, reviewsDist] = await Promise.all([
            Order.aggregate([{ $match: { restaurant: rId } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, ordenes: { $sum: 1 }, ingresos: { $sum: '$total' } } }, { $sort: { _id: -1 } }, { $limit: 30 }]),
            OrderDetail.aggregate([{ $lookup: { from: 'dishes', localField: 'dish', foreignField: '_id', as: 'dishInfo' } }, { $unwind: '$dishInfo' }, { $match: { 'dishInfo.restaurant': rId } }, { $group: { _id: '$dish', nombre: { $first: '$dishInfo.name' }, vendidos: { $sum: '$quantity' }, ingresos: { $sum: '$subtotal' } } }, { $sort: { vendidos: -1 } }, { $limit: 10 }]),
            Review.aggregate([{ $match: { restaurant: rId } }, { $group: { _id: '$rating', count: { $sum: 1 } } }, { $sort: { _id: -1 } }])
        ]);

        const GREEN_HEADER = 'FF2D6A4F';
        const GREEN_TITLE  = 'FF1B4332';
        const GREEN_EVEN   = 'FFF1F8F4';

        const applyTitle = (sheet, title, cols) => {
            sheet.mergeCells(1, 1, 1, cols);
            const cell     = sheet.getCell('A1');
            cell.value     = `🍽  ${title}`;
            cell.font      = { name: 'Arial', bold: true, size: 13, color: { argb: 'FFFFFFFF' } };
            cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN_TITLE } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            sheet.getRow(1).height = 30;
        };

        const applyHeaders = (sheet, headers, cols) => {
            const row = sheet.getRow(2);
            headers.forEach((h, i) => {
                const c     = row.getCell(i + 1);
                c.value     = h;
                c.font      = { name: 'Arial', bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
                c.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN_HEADER } };
                c.alignment = { horizontal: 'center', vertical: 'middle' };
            });
            row.height = 26;
        };

        const applyDataRow = (row, index) => {
            row.eachCell(c => {
                c.font = { name: 'Arial', size: 10 };
                c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: index % 2 === 0 ? GREEN_EVEN : 'FFFFFFFF' } };
                c.alignment = { vertical: 'middle' };
            });
            row.height = 20;
        };

        const workbook = new ExcelJS.Workbook();

        // Hoja 1: Órdenes por día
        const s1 = workbook.addWorksheet('Órdenes por Día');
        s1.columns = [{ key: 'fecha', width: 18 }, { key: 'ordenes', width: 14 }, { key: 'ingresos', width: 20 }];
        applyTitle(s1, `${restaurant.name} — Órdenes por Día`, 3);
        applyHeaders(s1, ['Fecha', 'Órdenes', 'Ingresos (Q)'], 3);
        ordersPerDay.forEach((r, i) => applyDataRow(s1.addRow([r._id, r.ordenes, r.ingresos]), i));

        // Hoja 2: Top Platillos
        const s2 = workbook.addWorksheet('Top Platillos');
        s2.columns = [{ key: 'rank', width: 8 }, { key: 'nombre', width: 30 }, { key: 'vendidos', width: 16 }, { key: 'ingresos', width: 20 }];
        applyTitle(s2, `${restaurant.name} — Top 10 Platillos`, 4);
        applyHeaders(s2, ['#', 'Platillo', 'Vendidos', 'Ingresos (Q)'], 4);
        topDishes.forEach((d, i) => applyDataRow(s2.addRow([i + 1, d.nombre, d.vendidos, d.ingresos]), i));

        // Hoja 3: Distribución de Reviews
        const s3 = workbook.addWorksheet('Reviews');
        s3.columns = [{ key: 'estrellas', width: 16 }, { key: 'cantidad', width: 14 }];
        applyTitle(s3, `${restaurant.name} — Distribución de Reviews`, 2);
        applyHeaders(s3, ['Estrellas', 'Cantidad'], 2);
        reviewsDist.forEach((rv, i) => applyDataRow(s3.addRow([`${rv._id} ⭐`, rv.count]), i));

        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="desempeno_${restaurant.name.replace(/\s+/g, '_')}.xlsx"`);
        return res.send(buffer);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al generar Excel', error: error.message });
    }
};

// ══════════════════════════════════════════════════════════════════════════════
// EXCEL: ESTADÍSTICAS GENERALES → CORREO
// GET /reports/send-excel/general/:email
// ══════════════════════════════════════════════════════════════════════════════
export const sendGeneralStatsExcel = async (req, res) => {
    try {
        const { email } = req.params;
        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, message: 'El correo proporcionado no es válido' });
        }

        const [restaurants, ordersAgg, reservationsAgg, eventsAgg, reviewsAgg] = await Promise.all([
            Restaurant.find({ isActive: true }).select('name averageRating totalReviews address category'),
            Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, ingresos: { $sum: '$total' } } }]),
            Reservation.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            Event.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            Review.aggregate([{ $group: { _id: null, promedio: { $avg: '$rating' }, total: { $sum: 1 } } }])
        ]);

        const data = [
            { concepto: 'Restaurantes Activos', valor: restaurants.length, detalle: restaurants.map(r => r.name).join(', '), categoria: 'General' },
            ...ordersAgg.map(o => ({ concepto: `Órdenes`, valor: o.count, detalle: `Q${o.ingresos?.toFixed(2) ?? 0}`, categoria: `Estado: ${o._id}` })),
            ...reservationsAgg.map(r => ({ concepto: `Reservaciones`, valor: r.count, detalle: '-', categoria: `Estado: ${r._id}` })),
            ...eventsAgg.map(e => ({ concepto: `Eventos`, valor: e.count, detalle: '-', categoria: `Estado: ${e._id}` })),
            {
                concepto: 'Calificación Promedio',
                valor: reviewsAgg[0]?.promedio?.toFixed(2) ?? 'N/A',
                detalle: `${reviewsAgg[0]?.total ?? 0} reseñas`,
                categoria: 'Satisfacción'
            }
        ];

        const columns = [
            { header: 'Concepto',   key: 'concepto',  width: 28 },
            { header: 'Categoría',  key: 'categoria', width: 22 },
            { header: 'Valor',      key: 'valor',     width: 15 },
            { header: 'Detalle',    key: 'detalle',   width: 40 },
        ];

        const service = new EmailExcelService();
        const result = await service.sendEntityExcel({
            toEmail: email,
            subject: 'Reporte General del Sistema – Excel',
            title: 'Estadísticas Generales del Sistema',
            sheetName: 'Estadísticas Generales',
            entityName: 'Estadísticas',
            data,
            columns,
            filename: 'estadisticas_generales.xlsx'
        });

        return res.status(200).json({
            success: true,
            message: `Excel enviado correctamente a ${result.toEmail}`,
            data: { correoDestino: result.toEmail, archivoEnviado: result.filename, totalConceptos: result.records }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al enviar el Excel', error: error.message });
    }
};

// ══════════════════════════════════════════════════════════════════════════════
// EXCEL: ESTADÍSTICAS DE UN RESTAURANTE → CORREO
// GET /reports/send-excel/restaurant/:restaurantId/:email
// ══════════════════════════════════════════════════════════════════════════════
export const sendRestaurantStatsExcel = async (req, res) => {
    try {
        const { restaurantId, email } = req.params;
        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, message: 'El correo proporcionado no es válido' });
        }

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurante no encontrado' });
        }

        const mongoose = (await import('mongoose')).default;
        const rId = new mongoose.Types.ObjectId(restaurantId);

        const [ordersStats, reviewsStats, topDishesRaw, ordersPerDay] = await Promise.all([
            Order.aggregate([
                { $match: { restaurant: rId } },
                { $group: { _id: '$status', count: { $sum: 1 }, ingresos: { $sum: '$total' } } }
            ]),
            Review.aggregate([
                { $match: { restaurant: rId } },
                { $group: { _id: null, promedio: { $avg: '$rating' }, total: { $sum: 1 } } }
            ]),
            OrderDetail.aggregate([
                { $lookup: { from: 'dishes', localField: 'dish', foreignField: '_id', as: 'dishInfo' } },
                { $unwind: '$dishInfo' },
                { $match: { 'dishInfo.restaurant': rId } },
                { $group: { _id: '$dish', nombre: { $first: '$dishInfo.name' }, totalVendido: { $sum: '$quantity' }, ingresos: { $sum: '$subtotal' } } },
                { $sort: { totalVendido: -1 } },
                { $limit: 10 }
            ]),
            Order.aggregate([
                { $match: { restaurant: rId } },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, ordenes: { $sum: 1 }, ingresos: { $sum: '$total' } } },
                { $sort: { _id: -1 } },
                { $limit: 30 }
            ])
        ]);

        // Hoja 1 – Resumen general
        const workbook = new (await import('exceljs')).default.Workbook();

        // ── Hoja 1: Resumen ───────────────────────────────────────────────────
        const sheetResumen = workbook.addWorksheet('Resumen');
        _styleSheet(sheetResumen, `Resumen – ${restaurant.name}`, [
            { header: 'Concepto',  key: 'concepto', width: 30 },
            { header: 'Valor',     key: 'valor',    width: 20 },
            { header: 'Detalle',   key: 'detalle',  width: 35 },
        ], [
            { concepto: 'Restaurante',          valor: restaurant.name,                                   detalle: restaurant.address },
            { concepto: 'Categoría',            valor: restaurant.category,                               detalle: '' },
            { concepto: 'Calificación Promedio',valor: reviewsStats[0]?.promedio?.toFixed(2) ?? 'N/A',   detalle: `${reviewsStats[0]?.total ?? 0} reseñas` },
            ...ordersStats.map(o => ({ concepto: `Órdenes (${o._id})`, valor: o.count, detalle: `Q${o.ingresos?.toFixed(2)}` }))
        ]);

        // ── Hoja 2: Top Platillos ─────────────────────────────────────────────
        const sheetDishes = workbook.addWorksheet('Top Platillos');
        _styleSheet(sheetDishes, `Top Platillos – ${restaurant.name}`, [
            { header: 'Platillo',          key: 'nombre',       width: 30 },
            { header: 'Unidades Vendidas', key: 'totalVendido', width: 20 },
            { header: 'Ingresos (Q)',      key: 'ingresos',     width: 18 },
        ], topDishesRaw.map(d => ({ nombre: d.nombre, totalVendido: d.totalVendido, ingresos: `Q${d.ingresos?.toFixed(2)}` })));

        // ── Hoja 3: Órdenes por día ───────────────────────────────────────────
        const sheetDays = workbook.addWorksheet('Órdenes por Día');
        _styleSheet(sheetDays, `Órdenes por Día – ${restaurant.name}`, [
            { header: 'Fecha',         key: '_id',     width: 18 },
            { header: 'Total Órdenes', key: 'ordenes', width: 18 },
            { header: 'Ingresos (Q)',  key: 'ingresos',width: 18 },
        ], ordersPerDay.map(d => ({ _id: d._id, ordenes: d.ordenes, ingresos: `Q${d.ingresos?.toFixed(2)}` })));

        const excelBuffer = await workbook.xlsx.writeBuffer();
        const filename = `reporte_${restaurant.name.replace(/\s+/g, '_')}.xlsx`;

        // Enviar por correo
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        await transporter.sendMail({
            from: `"Gestión Restaurante" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Reporte Excel – ${restaurant.name}`,
            html: `<p>Adjunto encontrará el reporte Excel del restaurante <strong>${restaurant.name}</strong> con ${ordersPerDay.length} días de datos y top ${topDishesRaw.length} platillos.</p>`,
            attachments: [{ filename, content: excelBuffer, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }]
        });

        return res.status(200).json({
            success: true,
            message: `Excel enviado correctamente a ${email}`,
            data: { correoDestino: email, archivoEnviado: filename, restaurante: restaurant.name, hojas: ['Resumen', 'Top Platillos', 'Órdenes por Día'] }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al enviar el Excel', error: error.message });
    }
};

// ══════════════════════════════════════════════════════════════════════════════
// EXCEL: TOP PLATILLOS → CORREO
// GET /reports/send-excel/top-dishes/:email?limit=10&restaurantId=xxx
// ══════════════════════════════════════════════════════════════════════════════
export const sendTopDishesExcel = async (req, res) => {
    try {
        const { email } = req.params;
        const limit = parseInt(req.query.limit) || 10;
        const { restaurantId } = req.query;

        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, message: 'El correo proporcionado no es válido' });
        }

        const mongoose = (await import('mongoose')).default;
        const pipeline = [
            { $lookup: { from: 'dishes', localField: 'dish', foreignField: '_id', as: 'dishInfo' } },
            { $unwind: '$dishInfo' },
            ...(restaurantId ? [{ $match: { 'dishInfo.restaurant': new mongoose.Types.ObjectId(restaurantId) } }] : []),
            { $group: { _id: '$dish', nombre: { $first: '$dishInfo.name' }, precio: { $first: '$dishInfo.price' }, totalVendido: { $sum: '$quantity' }, ingresoGenerado: { $sum: '$subtotal' } } },
            { $sort: { totalVendido: -1 } },
            { $limit: limit }
        ];

        const topDishes = await OrderDetail.aggregate(pipeline);
        if (!topDishes.length) {
            return res.status(404).json({ success: false, message: 'No hay datos de ventas de platillos' });
        }

        const columns = [
            { header: '#',                 key: 'ranking',       width: 6  },
            { header: 'Platillo',          key: 'nombre',        width: 30 },
            { header: 'Precio Unit. (Q)',  key: 'precio',        width: 18 },
            { header: 'Unidades Vendidas', key: 'totalVendido',  width: 20 },
            { header: 'Ingreso Total (Q)', key: 'ingresoGenerado', width: 20 },
        ];

        const dataWithRanking = topDishes.map((d, i) => ({
            ranking: i + 1,
            nombre: d.nombre,
            precio: `Q${d.precio?.toFixed(2)}`,
            totalVendido: d.totalVendido,
            ingresoGenerado: `Q${d.ingresoGenerado?.toFixed(2)}`
        }));

        const service = new EmailExcelService();
        const result = await service.sendEntityExcel({
            toEmail: email,
            subject: `Top ${limit} Platillos Más Vendidos – Excel`,
            title: `Top ${limit} Platillos Más Vendidos`,
            sheetName: 'Top Platillos',
            entityName: 'Platillo',
            data: dataWithRanking,
            columns,
            filename: 'top_platillos.xlsx'
        });

        return res.status(200).json({
            success: true,
            message: `Excel enviado correctamente a ${result.toEmail}`,
            data: { correoDestino: result.toEmail, archivoEnviado: result.filename, platillosIncluidos: result.records }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al enviar el Excel', error: error.message });
    }
};

// ══════════════════════════════════════════════════════════════════════════════
// EXCEL: DEMANDA POR FECHAS → CORREO
// GET /reports/send-excel/demand/:email?from=YYYY-MM-DD&to=YYYY-MM-DD
// ══════════════════════════════════════════════════════════════════════════════
export const sendDemandExcel = async (req, res) => {
    try {
        const { email } = req.params;
        const { from, to, restaurantId } = req.query;

        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, message: 'El correo proporcionado no es válido' });
        }

        const dateFilter = buildDateFilter(from, to);
        const mongoose = (await import('mongoose')).default;
        const matchOrder = { ...dateFilter };
        if (restaurantId) matchOrder.restaurant = new mongoose.Types.ObjectId(restaurantId);

        const [ordersPerDay, reservationsPerDay, revenuePerDay] = await Promise.all([
            Order.aggregate([
                { $match: matchOrder },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, ordenes: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]),
            Reservation.aggregate([
                { $match: dateFilter },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, reservaciones: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]),
            Order.aggregate([
                { $match: { ...matchOrder, status: 'paid' } },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, ingresos: { $sum: '$total' } } },
                { $sort: { _id: 1 } }
            ])
        ]);

        // Combinar los tres en una sola tabla por fecha
        const fechaMap = {};
        ordersPerDay.forEach(d => { fechaMap[d._id] = { fecha: d._id, ordenes: d.ordenes, reservaciones: 0, ingresos: 0 }; });
        reservationsPerDay.forEach(d => { if (fechaMap[d._id]) fechaMap[d._id].reservaciones = d.reservaciones; else fechaMap[d._id] = { fecha: d._id, ordenes: 0, reservaciones: d.reservaciones, ingresos: 0 }; });
        revenuePerDay.forEach(d => { if (fechaMap[d._id]) fechaMap[d._id].ingresos = d.ingresos; });

        const data = Object.values(fechaMap).sort((a, b) => a.fecha.localeCompare(b.fecha));

        if (!data.length) {
            return res.status(404).json({ success: false, message: 'No hay datos para el rango indicado' });
        }

        const columns = [
            { header: 'Fecha',           key: 'fecha',          width: 18 },
            { header: 'Órdenes',         key: 'ordenes',        width: 14 },
            { header: 'Reservaciones',   key: 'reservaciones',  width: 18 },
            { header: 'Ingresos (Q)',    key: 'ingresos',       width: 18 },
        ];

        const service = new EmailExcelService();
        const result = await service.sendEntityExcel({
            toEmail: email,
            subject: `Reporte de Demanda – Excel ${from ?? ''} ${to ? '→ ' + to : ''}`.trim(),
            title: 'Reporte de Demanda por Fecha',
            sheetName: 'Demanda',
            entityName: 'Demanda',
            data,
            columns,
            filename: `demanda_${from ?? 'todo'}_${to ?? 'hoy'}.xlsx`
        });

        return res.status(200).json({
            success: true,
            message: `Excel enviado correctamente a ${result.toEmail}`,
            data: { correoDestino: result.toEmail, archivoEnviado: result.filename, diasIncluidos: result.records }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al enviar el Excel', error: error.message });
    }
};

// ── Helper interno para hojas con múltiples sheets ────────────────────────────
function _styleSheet(sheet, title, columns, rows) {
    const totalCols = columns.length;
    const HEADER_COLOR = '1B4332';
    const EVEN_COLOR   = 'F1F8F4';

    sheet.mergeCells(1, 1, 1, totalCols);
    const t = sheet.getCell('A1');
    t.value     = `🍽  ${title}`;
    t.font      = { bold: true, size: 13, color: { argb: HEADER_COLOR } };
    t.alignment = { horizontal: 'center', vertical: 'middle' };
    t.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D8F3DC' } };
    sheet.getRow(1).height = 28;

    const headerRow = sheet.getRow(2);
    columns.forEach((col, i) => {
        const c = headerRow.getCell(i + 1);
        c.value     = col.header;
        c.font      = { bold: true, color: { argb: 'FFFFFF' }, size: 10 };
        c.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_COLOR } };
        c.alignment = { horizontal: 'center', vertical: 'middle' };
        sheet.getColumn(i + 1).width = col.width || 20;
    });
    headerRow.height = 20;

    rows.forEach((row, ri) => {
        const dataRow = sheet.getRow(3 + ri);
        columns.forEach((col, ci) => {
            const c   = dataRow.getCell(ci + 1);
            c.value   = String(row[col.key] ?? 'N/A');
            c.font    = { size: 9 };
            c.fill    = { type: 'pattern', pattern: 'solid', fgColor: { argb: ri % 2 === 0 ? EVEN_COLOR : 'FFFFFF' } };
            c.alignment = { vertical: 'middle' };
        });
        dataRow.height = 17;
    });

    sheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 2 }];
    sheet.autoFilter = { from: { row: 2, column: 1 }, to: { row: 2 + rows.length, column: totalCols } };
}
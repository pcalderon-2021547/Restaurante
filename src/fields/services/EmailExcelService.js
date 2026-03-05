'use strict';

import nodemailer from 'nodemailer';
import ExcelJS from 'exceljs';

export class EmailExcelService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async generateExcel({ title, sheetName = 'Reporte', data, columns }) {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet(sheetName);

        const records = Array.isArray(data) ? data : (data ? [data] : []);
        const safeColumns = Array.isArray(columns) ? columns : [];
        const totalCols = Math.max(1, safeColumns.length);

        sheet.mergeCells(1, 1, 1, totalCols);
        const titleCell = sheet.getCell(1, 1);
        titleCell.value = title || 'Reporte';
        titleCell.font = { bold: true, size: 14 };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        sheet.getRow(1).height = 24;

        sheet.columns = safeColumns.map((col) => ({
            header: col.header || col.label || col.key || 'Campo',
            key: col.key,
            width: col.width || 20
        }));

        records.forEach((record) => {
            sheet.addRow(record);
        });

        if (safeColumns.length > 0) {
            const headerRow = sheet.getRow(2);
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1F4E78' } };
            headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
            sheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 2 }];
            sheet.autoFilter = {
                from: { row: 2, column: 1 },
                to: { row: Math.max(2, records.length + 2), column: safeColumns.length }
            };
        }

        return workbook.xlsx.writeBuffer();
    }

    async sendEntityExcel({
        toEmail,
        subject,
        title,
        sheetName = 'Reporte',
        entityName = 'registro',
        data,
        columns,
        filename = 'reporte.xlsx'
    }) {
        if (!toEmail || !toEmail.includes('@')) {
            throw new Error('El correo de destino no es válido');
        }

        const records = Array.isArray(data) ? data.length : (data ? 1 : 0);
        const excelBuffer = await this.generateExcel({ title, sheetName, data, columns });

        await this.transporter.sendMail({
            from: `"Gestión Restaurante" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: subject || `Reporte Excel de ${entityName}`,
            html: `<p>Adjunto encontrarás el reporte de <strong>${entityName}</strong>.</p>`,
            attachments: [
                {
                    filename,
                    content: excelBuffer,
                    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                }
            ]
        });

        return { toEmail, filename, records };
    }
}

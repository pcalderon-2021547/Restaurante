'use strict';
import {
    createReservationService,
    getReservationsService,
    getReservationByIdService,
    updateReservationService,
    cancelReservationService,
    getReservationsByDateService,
    getMyReservationsService
} from './reservation.service.js';

import { handleError } from '../../../utils/handle-error.js';
import { EmailPDFService } from '../services/EmailPDFService.js';
import Reservation from './reservation.js';

// ── CAMPOS PARA PDF ───────────────────────────────────────────────────────────
const RESERVATION_FIELDS = [
    { label: 'ID',               key: '_id' },
    { label: 'Usuario ID',       key: 'user' },
    { label: 'Nombre Cliente',   key: 'customerName' },
    { label: 'Teléfono',         key: 'customerPhone' },
    { label: 'Mesa',             key: 'table' },
    { label: 'Fecha',            key: 'date' },
    { label: 'Personas',         key: 'numberOfPeople' },
    { label: 'Estado',           key: 'status' },
    { label: 'Notas',            key: 'notes' },
    { label: 'Creado en',        key: 'createdAt' },
    { label: 'Actualizado en',   key: 'updatedAt' },
];

// ── CRUD ──────────────────────────────────────────────────────────────────────
export const createReservation = async (req, res) => {
    try {
        const reservation = await createReservationService(req.body, req.user.id);
        if (!reservation) {
            return res.status(404).json({ success: false, message: 'Mesa no encontrada' });
        }
        return res.status(201).json({ success: true, reservation });
    } catch (error) {
        return handleError(res, error, { validationMessage: 'Datos inválidos de la reservación', defaultMessage: 'Error al crear reservación' });
    }
};

export const getReservations = async (req, res) => {
    try {
        const reservations = await getReservationsService();
        return res.status(200).json({ success: true, reservations });
    } catch (error) {
        return handleError(res, error, 'Error al obtener reservaciones');
    }
};

export const getReservationById = async (req, res) => {
    try {
        const reservation = await getReservationByIdService(req.params.id);
        if (reservation === false) {
            return res.status(400).json({ success: false, message: 'ID de reservación inválido' });
        }
        if (!reservation) {
            return res.status(404).json({ success: false, message: 'Reservación no encontrada' });
        }
        return res.status(200).json({ success: true, reservation });
    } catch (error) {
        return handleError(res, error, 'Error al buscar reservación');
    }
};

export const updateReservation = async (req, res) => {
    try {
        const reservation = await updateReservationService(req.params.id, req.body);
        if (reservation === false) {
            return res.status(400).json({ success: false, message: 'ID de reservación inválido' });
        }
        if (!reservation) {
            return res.status(404).json({ success: false, message: 'Reservación no encontrada' });
        }
        return res.status(200).json({ success: true, reservation });
    } catch (error) {
        return handleError(res, error, 'Error al actualizar reservación');
    }
};

export const cancelReservation = async (req, res) => {
    try {
        const reservation = await cancelReservationService(req.params.id);
        if (reservation === false) {
            return res.status(400).json({ success: false, message: 'ID de reservación inválido' });
        }
        if (!reservation) {
            return res.status(404).json({ success: false, message: 'Reservación no encontrada' });
        }
        return res.status(200).json({ success: true, message: 'Reservación cancelada' });
    } catch (error) {
        return handleError(res, error, 'Error al cancelar reservación');
    }
};

export const getReservationsByDate = async (req, res) => {
    try {
        const reservations = await getReservationsByDateService(req.query.date);
        return res.status(200).json({ success: true, total: reservations.length, reservations });
    } catch (error) {
        return handleError(res, error, { validationMessage: error.message, defaultMessage: 'Error al buscar reservaciones por fecha' });
    }
};

export const getMyReservations = async (req, res) => {
    try {
        const reservations = await getMyReservationsService(req.user.id);
        return res.status(200).json({ success: true, total: reservations.length, reservations });
    } catch (error) {
        return handleError(res, error, 'Error al obtener historial');
    }
};

// ── PDF: TODAS LAS RESERVACIONES ──────────────────────────────────────────────
// GET /reservation/send-pdf/all/:email
export const sendAllReservationsPDF = async (req, res) => {
    try {
        const { email } = req.params;
        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, message: 'El correo proporcionado no es válido' });
        }
        const reservations = await Reservation.find().populate('table').sort({ date: -1 });
        if (!reservations.length) {
            return res.status(404).json({ success: false, message: 'No hay reservaciones registradas' });
        }
        const service = new EmailPDFService();
        const result = await service.sendEntityPDF({
            toEmail: email,
            subject: 'Reporte Completo – Reservaciones',
            title: 'Listado Completo de Reservaciones',
            entityName: 'Reservación',
            data: reservations,
            fields: RESERVATION_FIELDS,
            filename: 'reservaciones_reporte.pdf'
        });
        return res.status(200).json({
            success: true,
            message: `PDF enviado correctamente a ${result.toEmail}`,
            data: { correoDestino: result.toEmail, archivoEnviado: result.filename, totalRegistros: result.records }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al enviar el PDF', error: error.message });
    }
};

// ── PDF: RESERVACIONES POR FECHA ──────────────────────────────────────────────
// GET /reservation/send-pdf/by-date/:date/:email
export const sendReservationsByDatePDF = async (req, res) => {
    try {
        const { date, email } = req.params;
        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, message: 'El correo proporcionado no es válido' });
        }
        const parsedDate = new Date(date);
        if (isNaN(parsedDate)) {
            return res.status(400).json({ success: false, message: 'Formato de fecha inválido. Use YYYY-MM-DD' });
        }
        const start = new Date(parsedDate); start.setHours(0, 0, 0, 0);
        const end   = new Date(parsedDate); end.setHours(23, 59, 59, 999);

        const reservations = await Reservation.find({ date: { $gte: start, $lte: end } })
            .populate('table').sort({ date: 1 });
        if (!reservations.length) {
            return res.status(404).json({ success: false, message: `No hay reservaciones para la fecha: ${date}` });
        }
        const service = new EmailPDFService();
        const result = await service.sendEntityPDF({
            toEmail: email,
            subject: `Reservaciones del día ${date}`,
            title: `Reservaciones del día: ${date}`,
            entityName: 'Reservación',
            data: reservations,
            fields: RESERVATION_FIELDS,
            filename: `reservaciones_${date}.pdf`
        });
        return res.status(200).json({
            success: true,
            message: `PDF enviado correctamente a ${result.toEmail}`,
            data: { correoDestino: result.toEmail, archivoEnviado: result.filename, fecha: date, totalRegistros: result.records }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al enviar el PDF', error: error.message });
    }
};

// ── PDF: UNA RESERVACIÓN ESPECÍFICA ──────────────────────────────────────────
// GET /reservation/send-pdf/:id/:email
export const sendReservationByIdPDF = async (req, res) => {
    try {
        const { id, email } = req.params;
        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, message: 'El correo proporcionado no es válido' });
        }
        const reservation = await Reservation.findById(id).populate('table');
        if (!reservation) {
            return res.status(404).json({ success: false, message: 'Reservación no encontrada' });
        }
        const service = new EmailPDFService();
        const result = await service.sendEntityPDF({
            toEmail: email,
            subject: `Detalle de Reservación – ${reservation.customerName}`,
            title: `Detalle de Reservación: ${reservation.customerName}`,
            entityName: 'Reservación',
            data: reservation,
            fields: RESERVATION_FIELDS,
            filename: `reservacion_${reservation._id}.pdf`
        });
        return res.status(200).json({
            success: true,
            message: `PDF enviado correctamente a ${result.toEmail}`,
            data: { correoDestino: result.toEmail, archivoEnviado: result.filename, cliente: reservation.customerName }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al enviar el PDF', error: error.message });
    }
};
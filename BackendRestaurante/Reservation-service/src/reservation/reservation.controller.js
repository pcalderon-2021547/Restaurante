import Reservation from './reservation.model.js';

export const createReservation = async (req, res) => {
  try {
    const reservationDate = new Date(req.body.date);
    if (Number.isNaN(reservationDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Fecha invalida' });
    }
    if (reservationDate < new Date()) {
      return res.status(400).json({ success: false, message: 'No se puede reservar en fecha pasada' });
    }

    const existingReservation = await Reservation.findOne({
      table: req.body.table,
      date: reservationDate,
      status: { $ne: 'cancelled' },
    });
    if (existingReservation) {
      return res.status(400).json({ success: false, message: 'La mesa ya esta reservada en esa fecha' });
    }

    const reservation = await Reservation.create(req.body);
    res.status(201).json({ success: true, reservation });
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const getReservations = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.table) filters.table = req.query.table;
    if (req.query.user) filters.user = req.query.user;
    if (req.query.date) {
      const start = new Date(req.query.date);
      if (Number.isNaN(start.getTime())) {
        return res.status(400).json({ success: false, message: 'Fecha invalida' });
      }
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      filters.date = { $gte: start, $lte: end };
    }

    const reservations = await Reservation.find(filters).sort({ date: 1 });
    res.status(200).json({ success: true, total: reservations.length, reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservacion no encontrada' });
    res.status(200).json({ success: true, reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservacion no encontrada' });
    res.status(200).json({ success: true, message: 'Reservacion actualizada', reservation });
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservacion no encontrada' });
    res.status(200).json({ success: true, message: 'Reservacion eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true, runValidators: true }
    );
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservacion no encontrada' });
    res.status(200).json({ success: true, message: 'Reservacion cancelada', reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

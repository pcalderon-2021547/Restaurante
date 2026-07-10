import Table from './table.model.js';

export const createTable = async (req, res) => {
  try {
    const table = await Table.create(req.body);
    res.status(201).json({ success: true, table });
  } catch (error) {
    res.status(error.name === 'ValidationError' || error.code === 11000 ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const getTables = async (req, res) => {
  try {
    const filters = {};
    if (req.query.restaurant) filters.restaurant = req.query.restaurant;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.isActive !== undefined) filters.isActive = req.query.isActive === 'true';
    if (req.query.capacity) filters.capacity = { $gte: Number(req.query.capacity) };

    const tables = await Table.find(filters).sort({ number: 1 });
    res.status(200).json({ success: true, tables });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTableById = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ success: false, message: 'Mesa no encontrada' });
    res.status(200).json({ success: true, table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!table) return res.status(404).json({ success: false, message: 'Mesa no encontrada' });
    res.status(200).json({ success: true, message: 'Mesa actualizada', table });
  } catch (error) {
    res.status(error.name === 'ValidationError' || error.code === 11000 ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const deleteTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) return res.status(404).json({ success: false, message: 'Mesa no encontrada' });
    res.status(200).json({ success: true, message: 'Mesa eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTableStatus = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!table) return res.status(404).json({ success: false, message: 'Mesa no encontrada' });
    res.status(200).json({ success: true, message: 'Estado de mesa actualizado', table });
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const toggleTableStatus = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ success: false, message: 'Mesa no encontrada' });

    table.isActive = !table.isActive;
    await table.save();
    res.status(200).json({ success: true, message: 'Disponibilidad de mesa actualizada', table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

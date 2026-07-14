import Menu from './menu.model.js';

export const createMenu = async (req, res) => {
  try {
    const menu = await Menu.create(req.body);
    res.status(201).json({ success: true, menu });
  } catch (error) {
    res.status(error.name === 'ValidationError' || error.code === 11000 ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const getMenus = async (req, res) => {
  try {
    const filters = {};
    if (req.query.restaurant) filters.restaurant = req.query.restaurant;
    if (req.query.type) filters.type = req.query.type;
    if (req.query.isActive !== undefined) filters.isActive = req.query.isActive === 'true';

    const menus = await Menu.find(filters).populate('dishes').sort({ createdAt: -1 });
    res.status(200).json({ success: true, menus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMenuById = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id).populate('dishes');
    if (!menu) return res.status(404).json({ success: false, message: 'Menu no encontrado' });
    res.status(200).json({ success: true, menu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMenu = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!menu) return res.status(404).json({ success: false, message: 'Menu no encontrado' });
    res.status(200).json({ success: true, message: 'Menu actualizado', menu });
  } catch (error) {
    res.status(error.name === 'ValidationError' || error.code === 11000 ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const deleteMenu = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndDelete(req.params.id);
    if (!menu) return res.status(404).json({ success: false, message: 'Menu no encontrado' });
    res.status(200).json({ success: true, message: 'Menu eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleMenuStatus = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ success: false, message: 'Menu no encontrado' });
    menu.isActive = !menu.isActive;
    await menu.save();
    res.status(200).json({ success: true, message: 'Estado de menu actualizado', menu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

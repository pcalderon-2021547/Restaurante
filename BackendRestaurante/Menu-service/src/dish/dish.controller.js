import Dish from './dish.model.js';

export const createDish = async (req, res) => {
  try {
    const dish = await Dish.create(req.body);
    res.status(201).json({ success: true, dish });
  } catch (error) {
    res.status(error.name === 'ValidationError' || error.code === 11000 ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const getDishes = async (req, res) => {
  try {
    const filters = {};
    if (req.query.category) filters.category = req.query.category;
    if (req.query.restaurant) filters.restaurant = req.query.restaurant;
    if (req.query.isAvailable !== undefined) filters.isAvailable = req.query.isAvailable === 'true';
    if (req.query.name) filters.name = { $regex: req.query.name, $options: 'i' };

    const dishes = await Dish.find(filters).populate('category').sort({ name: 1 });
    res.status(200).json({ success: true, dishes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDishById = async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id).populate('category');
    if (!dish) return res.status(404).json({ success: false, message: 'Platillo no encontrado' });
    res.status(200).json({ success: true, dish });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDish = async (req, res) => {
  try {
    const dish = await Dish.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!dish) return res.status(404).json({ success: false, message: 'Platillo no encontrado' });
    res.status(200).json({ success: true, message: 'Platillo actualizado', dish });
  } catch (error) {
    res.status(error.name === 'ValidationError' || error.code === 11000 ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const deleteDish = async (req, res) => {
  try {
    const dish = await Dish.findByIdAndDelete(req.params.id);
    if (!dish) return res.status(404).json({ success: false, message: 'Platillo no encontrado' });
    res.status(200).json({ success: true, message: 'Platillo eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleDishAvailability = async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) return res.status(404).json({ success: false, message: 'Platillo no encontrado' });
    dish.isAvailable = !dish.isAvailable;
    await dish.save();
    res.status(200).json({ success: true, message: 'Disponibilidad actualizada', dish });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

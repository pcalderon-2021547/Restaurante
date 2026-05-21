import Category from './category.model.js';

export const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(error.name === 'ValidationError' || error.code === 11000 ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const filters = {};
    if (req.query.isActive !== undefined) filters.isActive = req.query.isActive === 'true';
    const categories = await Category.find(filters).sort({ name: 1 });
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Categoria no encontrada' });
    res.status(200).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: 'Categoria no encontrada' });
    res.status(200).json({ success: true, message: 'Categoria actualizada', category });
  } catch (error) {
    res.status(error.name === 'ValidationError' || error.code === 11000 ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Categoria no encontrada' });
    res.status(200).json({ success: true, message: 'Categoria eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleCategoryStatus = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Categoria no encontrada' });
    category.isActive = !category.isActive;
    await category.save();
    res.status(200).json({ success: true, message: 'Estado de categoria actualizado', category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

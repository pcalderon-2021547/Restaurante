import Product from './product.model.js';

export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(error.name === 'ValidationError' || error.code === 11000 ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const filters = {};
    if (req.query.category) filters.category = req.query.category;
    if (req.query.isActive !== undefined) filters.isActive = req.query.isActive === 'true';
    if (req.query.lowStock === 'true') {
      filters.$expr = { $lte: ['$stock', '$minStock'] };
    }
    if (req.query.name) {
      filters.name = { $regex: req.query.name, $options: 'i' };
    }

    const products = await Product.find(filters).sort({ name: 1 });
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    res.status(200).json({ success: true, message: 'Producto actualizado', product });
  } catch (error) {
    res.status(error.name === 'ValidationError' || error.code === 11000 ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    res.status(200).json({ success: true, message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const restockProduct = async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'La cantidad debe ser mayor a 0' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

    const previousStock = product.stock;
    product.stock += amount;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Stock actualizado',
      product,
      previousStock,
      addedStock: amount,
      currentStock: product.stock,
    });
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const consumeStock = async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'La cantidad debe ser mayor a 0' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    if (product.stock < amount) {
      return res.status(400).json({ success: false, message: 'Stock insuficiente' });
    }

    product.stock -= amount;
    await product.save();

    res.status(200).json({ success: true, message: 'Stock consumido', product });
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

    product.isActive = !product.isActive;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Producto ${product.isActive ? 'activado' : 'desactivado'}`,
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

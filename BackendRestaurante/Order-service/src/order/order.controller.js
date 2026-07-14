import Order from './order.model.js';
import OrderDetail from '../orderDetail/orderDetail.model.js';

const TAX_RATE = 0.12;

const calculateTotals = (details) => {
  const subtotal = details.reduce((acc, item) => acc + Number(item.subtotal || 0), 0);
  const tax = Number((subtotal * TAX_RATE).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));
  return { subtotal: Number(subtotal.toFixed(2)), tax, total };
};

const recalculateOrder = async (orderId) => {
  const details = await OrderDetail.find({ order: orderId });
  const totals = calculateTotals(details);
  return Order.findByIdAndUpdate(orderId, totals, { new: true, runValidators: true });
};

export const createOrder = async (req, res) => {
  try {
    const { items = [], ...orderData } = req.body;
    const order = await Order.create(orderData);
    const details = [];

    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const quantity = Number(item.quantity);
        const price = Number(item.price ?? item.unitPrice);

        if (!item.dish || !quantity || quantity <= 0 || Number.isNaN(price) || price < 0) {
          return res.status(400).json({
            success: false,
            message: 'Cada item debe incluir dish, quantity y price validos',
          });
        }

        const detail = await OrderDetail.create({
          order: order._id,
          dish: item.dish,
          dishName: item.dishName,
          quantity,
          price,
          notes: item.notes,
        });
        details.push(detail);
      }

      const updatedOrder = await recalculateOrder(order._id);
      return res.status(201).json({ success: true, order: updatedOrder, details });
    }

    res.status(201).json({ success: true, order, details });
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.type) filters.type = req.query.type;
    if (req.query.user) filters.user = req.query.user;
    if (req.query.table) filters.table = req.query.table;

    const orders = await Order.find(filters).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    const details = await OrderDetail.find({ order: order._id });
    res.status(200).json({ success: true, order, details });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    res.status(200).json({ success: true, message: 'Orden actualizada', order });
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    await OrderDetail.deleteMany({ order: order._id });
    res.status(200).json({ success: true, message: 'Orden eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    res.status(200).json({ success: true, message: 'Estado de orden actualizado', order });
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ success: false, message: error.message });
  }
};

export { recalculateOrder };

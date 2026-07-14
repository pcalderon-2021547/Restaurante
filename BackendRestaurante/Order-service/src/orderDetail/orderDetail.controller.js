import OrderDetail from './orderDetail.model.js';
import Order from '../order/order.model.js';

const recalculateOrder = async (orderId) => {
  const details = await OrderDetail.find({ order: orderId });
  const subtotal = details.reduce((acc, item) => acc + Number(item.subtotal || 0), 0);
  const tax = Number((subtotal * 0.12).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  return Order.findByIdAndUpdate(
    orderId,
    { subtotal: Number(subtotal.toFixed(2)), tax, total },
    { new: true, runValidators: true }
  );
};

export const createOrderDetail = async (req, res) => {
  try {
    const order = await Order.findById(req.body.order);
    if (!order) return res.status(404).json({ success: false, message: 'Orden no encontrada' });

    const orderDetail = await OrderDetail.create({
      ...req.body,
      price: req.body.price ?? req.body.unitPrice,
    });
    const updatedOrder = await recalculateOrder(order._id);
    res.status(201).json({ success: true, detail: orderDetail, order: updatedOrder });
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const getOrderDetails = async (req, res) => {
  try {
    const filters = {};
    if (req.query.order) filters.order = req.query.order;
    if (req.query.dish) filters.dish = req.query.dish;

    const details = await OrderDetail.find(filters).populate('order');
    res.status(200).json({ success: true, details });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderDetailById = async (req, res) => {
  try {
    const detail = await OrderDetail.findById(req.params.id).populate('order');
    if (!detail) return res.status(404).json({ success: false, message: 'Detalle de orden no encontrado' });
    res.status(200).json({ success: true, detail });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderDetail = async (req, res) => {
  try {
    const detail = await OrderDetail.findById(req.params.id);
    if (!detail) return res.status(404).json({ success: false, message: 'Detalle de orden no encontrado' });

    detail.set({
      ...req.body,
      price: req.body.price ?? req.body.unitPrice ?? detail.price,
    });
    await detail.save();
    const order = await recalculateOrder(detail.order);
    res.status(200).json({ success: true, message: 'Detalle actualizado', detail, order });
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const deleteOrderDetail = async (req, res) => {
  try {
    const detail = await OrderDetail.findByIdAndDelete(req.params.id);
    if (!detail) return res.status(404).json({ success: false, message: 'Detalle de orden no encontrado' });
    const order = await recalculateOrder(detail.order);
    res.status(200).json({ success: true, message: 'Detalle eliminado', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

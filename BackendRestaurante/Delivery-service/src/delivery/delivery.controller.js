import Delivery from './delivery.model.js';

export const createDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.create(req.body);
    res.status(201).json({ success: true, delivery });
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const getDeliveries = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.order) filters.order = req.query.order;
    if (req.query.deliveryPerson) filters.deliveryPerson = req.query.deliveryPerson;
    if (req.query.assignedTo) filters.assignedTo = req.query.assignedTo;

    const deliveries = await Delivery.find(filters).sort({ createdAt: -1 });
    res.status(200).json({ success: true, deliveries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ success: false, message: 'Entrega no encontrada' });
    res.status(200).json({ success: true, delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!delivery) return res.status(404).json({ success: false, message: 'Entrega no encontrada' });
    res.status(200).json({ success: true, message: 'Entrega actualizada', delivery });
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const deleteDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndDelete(req.params.id);
    if (!delivery) return res.status(404).json({ success: false, message: 'Entrega no encontrada' });
    res.status(200).json({ success: true, message: 'Entrega eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDeliveryStatus = async (req, res) => {
  try {
    const updates = { status: req.body.status };
    if (req.body.status === 'in_transit' || req.body.status === 'in-transit') {
      updates.deliveryStartTime = new Date();
    }
    if (req.body.status === 'delivered') {
      updates.deliveryEndTime = new Date();
      updates.paymentStatus = 'completed';
    }
    if (req.body.notes) updates.deliveryNotes = req.body.notes;

    const delivery = await Delivery.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!delivery) return res.status(404).json({ success: false, message: 'Entrega no encontrada' });
    res.status(200).json({ success: true, message: 'Estado de entrega actualizado', delivery });
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const assignDeliveryPerson = async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      {
        deliveryPerson: req.body.deliveryPersonId ?? req.body.deliveryPerson ?? req.body.assignedTo,
        assignedTo: req.body.assignedTo ?? req.body.deliveryPersonId ?? req.body.deliveryPerson,
        deliveryPersonContact: req.body.contact ?? req.body.deliveryPersonContact,
        status: 'accepted',
      },
      { new: true, runValidators: true }
    );
    if (!delivery) return res.status(404).json({ success: false, message: 'Entrega no encontrada' });
    res.status(200).json({ success: true, message: 'Repartidor asignado', delivery });
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const confirmDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      {
        status: 'delivered',
        deliveryEndTime: new Date(),
        customerSignature: req.body.signature,
        rating: req.body.rating,
        feedback: req.body.feedback,
        deliveryNotes: req.body.deliveryNotes,
        paymentStatus: 'completed',
      },
      { new: true, runValidators: true }
    );
    if (!delivery) return res.status(404).json({ success: false, message: 'Entrega no encontrada' });
    res.status(200).json({ success: true, message: 'Entrega confirmada', delivery });
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const cancelDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', cancelledReason: req.body.reason },
      { new: true, runValidators: true }
    );
    if (!delivery) return res.status(404).json({ success: false, message: 'Entrega no encontrada' });
    res.status(200).json({ success: true, message: 'Entrega cancelada', delivery });
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ success: false, message: error.message });
  }
};

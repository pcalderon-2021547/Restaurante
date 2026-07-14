import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, required: true },
    orderDetails: [{ type: mongoose.Schema.Types.ObjectId }],
    deliveryAddress: {
      street: { type: String, required: true, trim: true },
      number: { type: String, trim: true },
      neighborhood: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      postalCode: { type: String, trim: true },
      reference: { type: String, trim: true },
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      reference: { type: String, trim: true },
    },
    deliveryZone: { type: String, trim: true },
    distance: { type: Number, default: 0, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    estimatedDeliveryTime: { type: Number, default: 40, min: 0 },
    estimatedTime: { type: Number, min: 0 },
    actualTime: { type: Number, min: 0 },
    deliveryPerson: { type: mongoose.Schema.Types.ObjectId },
    assignedTo: { type: mongoose.Schema.Types.ObjectId },
    deliveryPersonContact: { type: String, trim: true },
    status: {
      type: String,
      enum: [
        'pending',
        'assigned',
        'in-transit',
        'pending_acceptance',
        'accepted',
        'preparing',
        'ready_for_delivery',
        'in_transit',
        'delivered',
        'cancelled',
        'failed_delivery',
      ],
      default: 'pending_acceptance',
    },
    scheduledDeliveryTime: { type: Date },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'transfer', 'digital_wallet'],
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'completed'],
      default: 'pending',
    },
    specialInstructions: { type: String, trim: true },
    deliveryStartTime: { type: Date },
    deliveryEndTime: { type: Date },
    customerSignature: { type: String, trim: true },
    deliveryNotes: { type: String, trim: true },
    rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String, trim: true },
    subtotal: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
    cancelledReason: { type: String, trim: true },
  },
  { timestamps: true }
);

deliverySchema.pre('validate', function normalizeAddress(next) {
  if (!this.deliveryAddress && this.address) {
    this.deliveryAddress = {
      street: this.address.street,
      city: this.address.city,
      postalCode: this.address.zipCode,
      reference: this.address.reference,
    };
  }

  if (!this.estimatedDeliveryTime && this.estimatedTime) {
    this.estimatedDeliveryTime = this.estimatedTime;
  }

  if (this.assignedTo && !this.deliveryPerson) {
    this.deliveryPerson = this.assignedTo;
  }

  next();
});

deliverySchema.pre('save', function setScheduledDelivery(next) {
  if ((this.isModified('status') && this.status === 'in_transit') || this.status === 'in-transit') {
    this.deliveryStartTime = this.deliveryStartTime || new Date();
    this.scheduledDeliveryTime = this.scheduledDeliveryTime || new Date(Date.now() + this.estimatedDeliveryTime * 60 * 1000);
  }
  next();
});

export default mongoose.model('Delivery', deliverySchema);

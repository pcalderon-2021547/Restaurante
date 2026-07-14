import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    user: { type: String },
    customer: { type: String },
    customerName: { type: String, required: true, trim: true },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{8}$/, 'El telefono debe contener 8 digitos numericos'],
    },
    table: { type: mongoose.Schema.Types.ObjectId },
    date: { type: Date, required: true },
    time: { type: String, trim: true },
    numberOfPeople: { type: Number, required: true, min: 1 },
    partySize: { type: Number, min: 1 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'seated', 'completed', 'no-show'],
      default: 'pending',
    },
    notes: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true }
);

reservationSchema.pre('validate', function syncPartySize(next) {
  if (!this.numberOfPeople && this.partySize) this.numberOfPeople = this.partySize;
  if (!this.partySize && this.numberOfPeople) this.partySize = this.numberOfPeople;
  next();
});

export default mongoose.model('Reservation', reservationSchema);

import mongoose from 'mongoose';

const metricSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: Number, required: true, default: 0 },
    unit: { type: String, trim: true },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: ['sales', 'inventory', 'reservations', 'delivery', 'financial', 'reviews', 'operations', 'custom'],
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'generated', 'archived'],
      default: 'generated',
    },
    data: { type: mongoose.Schema.Types.Mixed, required: true, default: {} },
    summary: { type: mongoose.Schema.Types.Mixed, default: {} },
    metrics: [metricSchema],
    generatedBy: { type: String, trim: true },
    sourceService: { type: String, trim: true },
    dateRange: {
      start: { type: Date },
      end: { type: Date },
    },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

reportSchema.index({ type: 1, createdAt: -1 });
reportSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Report', reportSchema);

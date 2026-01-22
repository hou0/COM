import mongoose from 'mongoose';

const inspectionItemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  standard: {
    type: String,
    required: true,
    trim: true
  },
  method: {
    type: String,
    required: true,
    trim: true
  },
  measurementTool: {
    type: String,
    required: true,
    trim: true
  },
  criticalItem: {
    type: Boolean,
    default: false
  },
  unit: {
    type: String,
    trim: true
  },
  minValue: {
    type: Number
  },
  maxValue: {
    type: Number
  },
  referenceValue: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 自动更新时间戳
inspectionItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const InspectionItem = mongoose.model('InspectionItem', inspectionItemSchema);

export default InspectionItem;

import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true
  },
  productCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  specification: {
    type: String,
    required: true,
    trim: true
  },
  standardCode: {
    type: String,
    required: true,
    trim: true
  },
  manufacturer: {
    type: String,
    trim: true
  },
  supplier: {
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
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;

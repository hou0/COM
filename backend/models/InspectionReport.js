import mongoose from 'mongoose';

const inspectionReportSchema = new mongoose.Schema({
  inspectionNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  batchNumber: {
    type: String,
    required: true,
    trim: true
  },
  originalBatchNumber: {
    type: String,
    trim: true
  },
  inspectionDate: {
    type: Date,
    required: true
  },
  deliveryDate: {
    type: Date
  },
  inspectionType: {
    type: String,
    required: true,
    enum: ['IQC', 'IPQC', 'FQC', 'OQC'],
    default: 'IQC'
  },
  standardCode: {
    type: String,
    required: true,
    trim: true
  },
  specification: {
    type: String,
    required: true,
    trim: true
  },
  inspectionMethod: {
    type: String,
    required: true,
    trim: true
  },
  sampleQuantity: {
    type: Number,
    required: true
  },
  inspectionQuantity: {
    type: Number,
    required: true
  },
  unqualifiedRate: {
    type: String,
    trim: true
  },
  conclusion: {
    type: String,
    required: true,
    enum: ['pass', 'fail'],
    default: 'pass'
  },
  defectHandling: {
    type: String,
    trim: true
  },
  handlingQuantities: {
    scrap: {
      type: Number,
      default: 0
    },
    stock: {
      type: Number,
      default: 0
    },
    rework: {
      type: Number,
      default: 0
    },
    reinspect: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'draft'
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  approver: {
    type: String,
    trim: true
  },
  inspector: {
    type: String,
    required: true,
    trim: true
  },
  manufacturer: {
    type: String,
    trim: true
  },
  agent: {
    type: String,
    trim: true
  },
  validUntil: {
    type: Date
  },
  inspectionItems: [{
    itemName: {
      type: String,
      required: true
    },
    standard: {
      type: String,
      required: true
    },
    actualValue: {
      type: String,
      required: true
    },
    result: {
      type: String,
      required: true,
      enum: ['符合', '不符合', '未检验']
    },
    defectItem: {
      type: String,
      trim: true
    },
    recordNumber: {
      type: String,
      trim: true
    },
    measurementTool: {
      type: String,
      trim: true
    },
    criticalItem: {
      type: String,
      enum: ['是', '否']
    },
    remark: {
      type: String,
      trim: true
    }
  }],
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
inspectionReportSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const InspectionReport = mongoose.model('InspectionReport', inspectionReportSchema);

export default InspectionReport;

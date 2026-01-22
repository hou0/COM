import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import inspectionItemRoutes from './routes/inspectionItems.js';
import inspectionReportRoutes from './routes/inspectionReports.js';


import exportRoutes from './routes/export.js';

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 配置中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 数据库连接
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cosmetic-inspection-system', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('数据库连接成功'))
  .catch(err => console.error('数据库连接失败:', err));

// 配置路由
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inspection-items', inspectionItemRoutes);
app.use('/api/inspection-reports', inspectionReportRoutes);


app.use('/api/export', exportRoutes);

// 健康检查路由
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '服务运行正常' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

// 监听端口
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

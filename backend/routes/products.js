import express from 'express';
import Product from '../models/Product.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// 获取产品列表
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = {};
    
    if (search) {
      filter.productName = { $regex: search, $options: 'i' };
    }
    
    if (status) {
      filter.status = status;
    }
    
    const products = await Product.find(filter).sort({ updatedAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取产品详情
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: '产品不存在' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建产品
router.post('/', authMiddleware, roleMiddleware(['admin', 'quality_manager']), async (req, res) => {
  try {
    const { productName, productCode, specification, standardCode, manufacturer, supplier } = req.body;
    
    // 检查产品代码是否已存在
    const existingProduct = await Product.findOne({ productCode });
    if (existingProduct) {
      return res.status(400).json({ error: '产品代码已存在' });
    }
    
    const product = new Product({
      productName,
      productCode,
      specification,
      standardCode,
      manufacturer,
      supplier
    });
    
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新产品
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'quality_manager']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: '产品不存在' });
    }
    
    const { productName, productCode, specification, standardCode, manufacturer, supplier, status } = req.body;
    
    // 检查产品代码是否已被其他产品使用
    if (productCode && productCode !== product.productCode) {
      const existingProduct = await Product.findOne({ productCode });
      if (existingProduct) {
        return res.status(400).json({ error: '产品代码已存在' });
      }
    }
    
    // 更新产品信息
    product.productName = productName || product.productName;
    product.productCode = productCode || product.productCode;
    product.specification = specification || product.specification;
    product.standardCode = standardCode || product.standardCode;
    product.manufacturer = manufacturer || product.manufacturer;
    product.supplier = supplier || product.supplier;
    product.status = status || product.status;
    
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除产品
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: '产品不存在' });
    }
    
    await product.remove();
    res.json({ message: '产品删除成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

import express from 'express';
import InspectionItem from '../models/InspectionItem.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// 获取检验项目列表
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, criticalItem, status } = req.query;
    const filter = {};
    
    if (search) {
      filter.itemName = { $regex: search, $options: 'i' };
    }
    
    if (criticalItem) {
      filter.criticalItem = criticalItem === 'true';
    }
    
    if (status) {
      filter.status = status;
    }
    
    const inspectionItems = await InspectionItem.find(filter).sort({ itemName: 1 });
    res.json(inspectionItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取检验项目详情
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const inspectionItem = await InspectionItem.findById(req.params.id);
    if (!inspectionItem) {
      return res.status(404).json({ error: '检验项目不存在' });
    }
    res.json(inspectionItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建检验项目
router.post('/', authMiddleware, roleMiddleware(['admin', 'quality_manager']), async (req, res) => {
  try {
    const { 
      itemName, standard, method, measurementTool, criticalItem, 
      unit, minValue, maxValue, referenceValue 
    } = req.body;
    
    const inspectionItem = new InspectionItem({
      itemName,
      standard,
      method,
      measurementTool,
      criticalItem,
      unit,
      minValue,
      maxValue,
      referenceValue
    });
    
    await inspectionItem.save();
    res.status(201).json(inspectionItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新检验项目
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'quality_manager']), async (req, res) => {
  try {
    const inspectionItem = await InspectionItem.findById(req.params.id);
    if (!inspectionItem) {
      return res.status(404).json({ error: '检验项目不存在' });
    }
    
    const { 
      itemName, standard, method, measurementTool, criticalItem, 
      unit, minValue, maxValue, referenceValue, status 
    } = req.body;
    
    // 更新检验项目信息
    inspectionItem.itemName = itemName || inspectionItem.itemName;
    inspectionItem.standard = standard || inspectionItem.standard;
    inspectionItem.method = method || inspectionItem.method;
    inspectionItem.measurementTool = measurementTool || inspectionItem.measurementTool;
    inspectionItem.criticalItem = criticalItem !== undefined ? criticalItem : inspectionItem.criticalItem;
    inspectionItem.unit = unit || inspectionItem.unit;
    inspectionItem.minValue = minValue !== undefined ? minValue : inspectionItem.minValue;
    inspectionItem.maxValue = maxValue !== undefined ? maxValue : inspectionItem.maxValue;
    inspectionItem.referenceValue = referenceValue || inspectionItem.referenceValue;
    inspectionItem.status = status || inspectionItem.status;
    
    await inspectionItem.save();
    res.json(inspectionItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除检验项目
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const inspectionItem = await InspectionItem.findById(req.params.id);
    if (!inspectionItem) {
      return res.status(404).json({ error: '检验项目不存在' });
    }
    
    await inspectionItem.remove();
    res.json({ message: '检验项目删除成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

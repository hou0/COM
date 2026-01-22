import express from 'express';
import xlsx from 'xlsx';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';
import Product from '../models/Product.js';
import InspectionItem from '../models/InspectionItem.js';
import InspectionReport from '../models/InspectionReport.js';

const router = express.Router();

// 确保上传目录存在
const uploadPath = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// 导出产品数据
router.get('/products', authMiddleware, async (req, res) => {
  try {
    const products = await Product.find().sort({ productName: 1 });
    
    // 转换为Excel格式
    const worksheet = xlsx.utils.json_to_sheet(products.map(product => ({
      '产品名称': product.productName,
      '产品代码': product.productCode,
      '规格': product.specification,
      '标准代码': product.standardCode,
      '制造商': product.manufacturer,
      '供应商': product.supplier,
      '状态': product.status,
      '创建时间': product.createdAt.toISOString().slice(0, 10)
    })));
    
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, '产品数据');
    
    // 生成文件
    const filename = `产品数据_${new Date().toISOString().slice(0, 10)}.xlsx`;
    const filepath = path.join(uploadPath, filename);
    xlsx.writeFile(workbook, filepath);
    
    // 下载文件
    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('下载失败:', err);
      }
      // 清理文件
      setTimeout(() => {
        fs.unlink(filepath, (err) => {
          if (err) console.error('删除文件失败:', err);
        });
      }, 10000);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 导出检验项目数据
router.get('/inspection-items', authMiddleware, async (req, res) => {
  try {
    const inspectionItems = await InspectionItem.find().sort({ itemName: 1 });
    
    // 转换为Excel格式
    const worksheet = xlsx.utils.json_to_sheet(inspectionItems.map(item => ({
      '项目名称': item.itemName,
      '检验标准': item.standard,
      '检验方法': item.method,
      '测量工具': item.measurementTool,
      '是否关键项目': item.criticalItem ? '是' : '否',
      '单位': item.unit || '',
      '最小值': item.minValue || '',
      '最大值': item.maxValue || '',
      '参考值': item.referenceValue || '',
      '状态': item.status,
      '创建时间': item.createdAt.toISOString().slice(0, 10)
    })));
    
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, '检验项目数据');
    
    // 生成文件
    const filename = `检验项目数据_${new Date().toISOString().slice(0, 10)}.xlsx`;
    const filepath = path.join(uploadPath, filename);
    xlsx.writeFile(workbook, filepath);
    
    // 下载文件
    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('下载失败:', err);
      }
      // 清理文件
      setTimeout(() => {
        fs.unlink(filepath, (err) => {
          if (err) console.error('删除文件失败:', err);
        });
      }, 10000);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 导出检验报告数据
router.get('/inspection-reports', authMiddleware, async (req, res) => {
  try {
    const reports = await InspectionReport.find().sort({ inspectionDate: -1 });
    
    // 转换为Excel格式
    const worksheet = xlsx.utils.json_to_sheet(reports.map(report => ({
      '检验编号': report.inspectionNumber,
      '产品名称': report.productName,
      '批次号': report.batchNumber,
      '检验日期': report.inspectionDate.toISOString().slice(0, 10),
      '检验类型': report.inspectionType,
      '样本数量': report.sampleQuantity,
      '检验数量': report.inspectionQuantity,
      '不合格率': report.unqualifiedRate,
      '结论': report.conclusion === 'pass' ? '合格' : '不合格',
      '状态': report.status,
      '编制人': report.author,
      '审批人': report.approver || '',
      '创建时间': report.createdAt.toISOString().slice(0, 10)
    })));
    
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, '检验报告数据');
    
    // 生成文件
    const filename = `检验报告数据_${new Date().toISOString().slice(0, 10)}.xlsx`;
    const filepath = path.join(uploadPath, filename);
    xlsx.writeFile(workbook, filepath);
    
    // 下载文件
    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('下载失败:', err);
      }
      // 清理文件
      setTimeout(() => {
        fs.unlink(filepath, (err) => {
          if (err) console.error('删除文件失败:', err);
        });
      }, 10000);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 导出PDF报告
router.get('/inspection-reports/:id/pdf', authMiddleware, async (req, res) => {
  try {
    const report = await InspectionReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: '检验报告不存在' });
    }
    
    // 生成PDF文件
    const filename = `${report.inspectionNumber}_检验报告.pdf`;
    const filepath = path.join(uploadPath, filename);
    
    // 创建PDF文档
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4'
    });
    
    // 保存到文件
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);
    
    // 添加标题
    doc.fontSize(24).text('检验报告', { align: 'center' });
    doc.moveDown();
    
    // 添加报告基本信息
    doc.fontSize(16).text('报告信息', { underline: true });
    doc.moveDown(0.5);
    
    doc.fontSize(12);
    doc.text(`检验编号: ${report.inspectionNumber}`);
    doc.text(`产品名称: ${report.productName}`);
    doc.text(`批次号: ${report.batchNumber}`);
    doc.text(`检验日期: ${report.inspectionDate.toISOString().slice(0, 10)}`);
    doc.text(`检验类型: ${report.inspectionType}`);
    doc.text(`标准代码: ${report.standardCode}`);
    doc.text(`规格: ${report.specification}`);
    doc.text(`检验方法: ${report.inspectionMethod}`);
    doc.text(`样本数量: ${report.sampleQuantity}`);
    doc.text(`检验数量: ${report.inspectionQuantity}`);
    doc.text(`不合格率: ${report.unqualifiedRate}`);
    doc.text(`结论: ${report.conclusion === 'pass' ? '合格' : '不合格'}`);
    doc.text(`状态: ${report.status}`);
    doc.text(`编制人: ${report.author}`);
    doc.text(`审批人: ${report.approver || '未审批'}`);
    doc.text(`检验员: ${report.inspector}`);
    doc.moveDown();
    
    // 添加检验项目
    doc.fontSize(16).text('检验项目', { underline: true });
    doc.moveDown(0.5);
    
    report.inspectionItems.forEach((item, index) => {
      doc.fontSize(11).text(`项目 ${index + 1}: ${item.itemName}`);
      doc.text(`  标准: ${item.standard}`);
      doc.text(`  实际值: ${item.actualValue}`);
      doc.text(`  结果: ${item.result}`);
      if (item.defectItem) {
        doc.text(`  缺陷项目: ${item.defectItem}`);
      }
      if (item.remark) {
        doc.text(`  备注: ${item.remark}`);
      }
      doc.moveDown(0.3);
    });
    
    // 结束文档
    doc.end();
    
    // 等待文件写入完成
    stream.on('finish', () => {
      // 下载文件
      res.download(filepath, filename, (err) => {
        if (err) {
          console.error('下载失败:', err);
        }
        // 清理文件
        setTimeout(() => {
          fs.unlink(filepath, (err) => {
            if (err) console.error('删除文件失败:', err);
          });
        }, 10000);
      });
    });
    
    stream.on('error', (err) => {
      console.error('写入文件失败:', err);
      res.status(500).json({ error: '生成PDF失败' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

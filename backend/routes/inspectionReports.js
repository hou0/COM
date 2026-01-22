import express from 'express';
import InspectionReport from '../models/InspectionReport.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// 生成检验编号
const generateInspectionNumber = async () => {
    const prefix = 'INS';
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    // 查找当天最后一个报告
    const lastReport = await InspectionReport.findOne({
        inspectionNumber: { $regex: `${prefix}${dateStr}` }
    }).sort({ inspectionNumber: -1 });

    let serialNumber = 1;
    if (lastReport) {
        const lastSerial = parseInt(lastReport.inspectionNumber.slice(-4));
        serialNumber = lastSerial + 1;
    }

    return `${prefix}${dateStr}${String(serialNumber).padStart(4, '0')}`;
};

// 获取检验报告列表
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { search, inspectionType, status, conclusion, fromDate, toDate } = req.query;
        const filter = {};

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            filter.$or = [
                { productName: searchRegex },
                { batchNumber: searchRegex },
                { inspectionNumber: searchRegex }
            ];
        }

        if (inspectionType) filter.inspectionType = inspectionType;
        if (status) filter.status = status;
        if (conclusion) filter.conclusion = conclusion;

        if (fromDate) filter.inspectionDate = { $gte: new Date(fromDate) };
        if (toDate) filter.inspectionDate = { ...filter.inspectionDate, $lte: new Date(toDate) };

        const inspectionReports = await InspectionReport.find(filter).sort({ inspectionDate: -1 });
        res.json(inspectionReports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 获取检验报告详情
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const inspectionReport = await InspectionReport.findById(req.params.id);
        if (!inspectionReport) {
            return res.status(404).json({ error: '检验报告不存在' });
        }
        res.json(inspectionReport);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 创建检验报告
router.post('/', authMiddleware, async (req, res) => {
    try {
        const {
            productName, batchNumber, originalBatchNumber, inspectionDate, deliveryDate,
            inspectionType, standardCode, specification, inspectionMethod,
            sampleQuantity, inspectionQuantity, unqualifiedRate, conclusion,
            defectHandling, handlingQuantities, inspector, manufacturer,
            agent, validUntil, inspectionItems, notes
        } = req.body;

        // 生成检验编号
        const inspectionNumber = await generateInspectionNumber();

        const inspectionReport = new InspectionReport({
            inspectionNumber,
            productName,
            batchNumber,
            originalBatchNumber,
            inspectionDate,
            deliveryDate,
            inspectionType,
            standardCode,
            specification,
            inspectionMethod,
            sampleQuantity,
            inspectionQuantity,
            unqualifiedRate,
            conclusion,
            defectHandling,
            handlingQuantities,
            status: 'draft',
            author: req.user.name,
            inspector,
            manufacturer,
            agent,
            validUntil,
            inspectionItems
        });

        await inspectionReport.save();

        res.status(201).json(inspectionReport);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 更新检验报告
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const inspectionReport = await InspectionReport.findById(req.params.id);
        if (!inspectionReport) {
            return res.status(404).json({ error: '检验报告不存在' });
        }

        // 只有草稿状态的报告可以编辑
        if (inspectionReport.status !== 'draft') {
            return res.status(400).json({ error: '只有草稿状态的报告可以编辑' });
        }

        const {
            productName, batchNumber, originalBatchNumber, inspectionDate, deliveryDate,
            inspectionType, standardCode, specification, inspectionMethod,
            sampleQuantity, inspectionQuantity, unqualifiedRate, conclusion,
            defectHandling, handlingQuantities, inspector, manufacturer,
            agent, validUntil, inspectionItems, status
        } = req.body;

        // 更新检验报告信息
        inspectionReport.productName = productName || inspectionReport.productName;
        inspectionReport.batchNumber = batchNumber || inspectionReport.batchNumber;
        inspectionReport.originalBatchNumber = originalBatchNumber || inspectionReport.originalBatchNumber;
        inspectionReport.inspectionDate = inspectionDate || inspectionReport.inspectionDate;
        inspectionReport.deliveryDate = deliveryDate || inspectionReport.deliveryDate;
        inspectionReport.inspectionType = inspectionType || inspectionReport.inspectionType;
        inspectionReport.standardCode = standardCode || inspectionReport.standardCode;
        inspectionReport.specification = specification || inspectionReport.specification;
        inspectionReport.inspectionMethod = inspectionMethod || inspectionReport.inspectionMethod;
        inspectionReport.sampleQuantity = sampleQuantity !== undefined ? sampleQuantity : inspectionReport.sampleQuantity;
        inspectionReport.inspectionQuantity = inspectionQuantity !== undefined ? inspectionQuantity : inspectionReport.inspectionQuantity;
        inspectionReport.unqualifiedRate = unqualifiedRate || inspectionReport.unqualifiedRate;
        inspectionReport.conclusion = conclusion || inspectionReport.conclusion;
        inspectionReport.defectHandling = defectHandling || inspectionReport.defectHandling;
        inspectionReport.handlingQuantities = handlingQuantities || inspectionReport.handlingQuantities;
        inspectionReport.inspector = inspector || inspectionReport.inspector;
        inspectionReport.manufacturer = manufacturer || inspectionReport.manufacturer;
        inspectionReport.agent = agent || inspectionReport.agent;
        inspectionReport.validUntil = validUntil || inspectionReport.validUntil;
        inspectionReport.inspectionItems = inspectionItems || inspectionReport.inspectionItems;
        inspectionReport.status = status || inspectionReport.status;

        await inspectionReport.save();

        res.json(inspectionReport);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 审批检验报告
router.post('/:id/approve', authMiddleware, roleMiddleware(['admin', 'quality_manager', 'approver']), async (req, res) => {
    try {
        const inspectionReport = await InspectionReport.findById(req.params.id);
        if (!inspectionReport) {
            return res.status(404).json({ error: '检验报告不存在' });
        }

        // 只有提交状态的报告可以审批
        if (inspectionReport.status !== 'submitted') {
            return res.status(400).json({ error: '只有提交状态的报告可以审批' });
        }

        // 更新报告状态
        inspectionReport.status = 'approved';
        inspectionReport.approver = req.user.name;

        await inspectionReport.save();

        res.json(inspectionReport);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 驳回检验报告
router.post('/:id/reject', authMiddleware, roleMiddleware(['admin', 'quality_manager', 'approver']), async (req, res) => {
    try {
        const inspectionReport = await InspectionReport.findById(req.params.id);
        if (!inspectionReport) {
            return res.status(404).json({ error: '检验报告不存在' });
        }

        // 只有提交状态的报告可以驳回
        if (inspectionReport.status !== 'submitted') {
            return res.status(400).json({ error: '只有提交状态的报告可以驳回' });
        }

        // 更新报告状态
        inspectionReport.status = 'rejected';
        inspectionReport.approver = req.user.name;

        await inspectionReport.save();
        res.json(inspectionReport);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 删除检验报告
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
    try {
        const inspectionReport = await InspectionReport.findById(req.params.id);
        if (!inspectionReport) {
            return res.status(404).json({ error: '检验报告不存在' });
        }

        await inspectionReport.remove();
        res.json({ message: '检验报告删除成功' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

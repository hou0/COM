<template>
  <div class="inspection-report">
    <!-- Report Header -->
    <div class="report-header">
      <div class="report-title">检验报告</div>
      <div class="report-info">
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">检验单号:</span>
            <span class="info-value">{{ reportData.inspectionNumber || 'QJB-20260102' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">检验日期:</span>
            <span class="info-value">{{ reportData.inspectionDate || '2026-01-20' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">送检单号:</span>
            <span class="info-value">{{ reportData.deliveryNumber || 'SJ20260104013' }}</span>
          </div>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">检验部门:</span>
            <span class="info-value">{{ reportData.inspectionDept || '上海国际集团生化有限公司' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">检验类型:</span>
            <span class="info-value">{{ reportData.inspectionType || '进厂检验' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">检验标准:</span>
            <span class="info-value">{{ reportData.inspectionStandard || '企标' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Information -->
    <div class="product-info">
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">物料编码:</span>
          <span class="info-value">{{ reportData.materialCode || '03E1-MY-BC' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">物料名称:</span>
          <span class="info-value">{{ reportData.materialName || '乙腈(色谱纯精丙酮)' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">检验数量:</span>
          <span class="info-value">{{ reportData.inspectionQuantity || '365.000000 KG' }}</span>
        </div>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">检验方式:</span>
          <span class="info-value">{{ reportData.inspectionMethod || '1.抽样' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">检验状态:</span>
          <span class="info-value">{{ reportData.inspectionStatus || '1.检验' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">备注:</span>
          <span class="info-value">{{ reportData.remark || '执行标准 Q/BT666-2004' }}</span>
        </div>
      </div>
    </div>

    <!-- Supplier Information -->
    <div class="supplier-info">
      <div class="info-item">
        <span class="info-label">供应商:</span>
        <span class="info-value">{{ reportData.supplier || '' }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">生产批号:</span>
        <span class="info-value">{{ reportData.productionBatch || '2029-01-20' }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">有效期:</span>
        <span class="info-value">{{ reportData.validUntil || '' }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">审批人:</span>
        <span class="info-value">{{ reportData.approver || '焦维菌' }}</span>
      </div>
    </div>

    <!-- Inspection Items Table -->
    <div class="inspection-items">
      <table class="items-table">
        <thead>
          <tr>
            <th>检验项目</th>
            <th>检验标准</th>
            <th>实际值</th>
            <th>检验结果</th>
            <th>不合格项</th>
            <th>严重不良数量</th>
            <th>主要不良数量</th>
            <th>次要不良数量</th>
            <th>检验记录号</th>
            <th>上批检验项目</th>
            <th>测量工具</th>
            <th>关键项目</th>
            <th>备注</th>
            <th>检验装置图</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in reportData.inspectionItems" :key="index">
            <td>{{ item.itemName }}</td>
            <td>{{ item.standard }}</td>
            <td>{{ item.actualValue }}</td>
            <td :class="{ 'pass': item.result === '符合', 'fail': item.result === '不符合' }">{{ item.result }}</td>
            <td>{{ item.defectItem || '' }}</td>
            <td>{{ item.criticalDefect || '' }}</td>
            <td>{{ item.majorDefect || '' }}</td>
            <td>{{ item.minorDefect || '' }}</td>
            <td>{{ item.recordNumber || '' }}</td>
            <td>{{ item.previousItem || '' }}</td>
            <td>{{ item.measurementTool || '' }}</td>
            <td>{{ item.criticalItem || '' }}</td>
            <td>{{ item.remark || '' }}</td>
            <td>{{ item.deviceDiagram || '' }}</td>
          </tr>
          <!-- Example Row -->
          <tr v-if="reportData.inspectionItems.length === 0">
            <td>酸碱度</td>
            <td>均匀溶液不准备：参考合格样本</td>
            <td>5.98</td>
            <td class="pass">符合</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td>pH</td>
            <td>pH试纸</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Test Summary -->
    <div class="test-summary">
      <div class="summary-item">
        <span class="summary-label">检验结果：</span>
        <div class="result-options">
          <label><input type="radio" name="testResult" value="pass" checked> 合格</label>
          <label><input type="radio" name="testResult" value="fail"> 不合格</label>
        </div>
      </div>
      <div class="summary-item">
        <span class="summary-label">不合格品处理：</span>
        <div class="defect-handling">
          <select>
            <option>报废</option>
            <option>入库待处理</option>
            <option>返工修检</option>
            <option>重检</option>
          </select>
        </div>
      </div>
      <div class="summary-item">
        <span class="summary-label">结论与建议：</span>
        <div class="conclusion">
          <Button label="通过" />
        </div>
      </div>
    </div>

    <!-- Defect Details -->
    <div class="defect-details">
      <div class="defect-item">
        <span class="defect-label">不合格品数量：</span>
        <input type="text" placeholder="数量" />
      </div>
      <div class="defect-item">
        <span class="defect-label">不良率：</span>
        <input type="text" placeholder="0.000000 %" />
      </div>
      <div class="defect-item">
        <span class="defect-label">缺陷分类：</span>
        <input type="text" placeholder="请选择" />
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <Button label="保存" icon="pi pi-save" class="p-mr-2" @click="saveReport" />
      <Button label="打印" icon="pi pi-print" class="p-mr-2" @click="printReport" />
      <Button label="导出" icon="pi pi-download" class="p-mr-2" @click="exportReport" />
      <Button label="关闭" icon="pi pi-times" @click="closeReport" />
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import Button from 'primevue/button'

const props = defineProps({
  reportData: {
    type: Object,
    default: () => ({
      inspectionItems: []
    })
  }
})

const emit = defineEmits(['save', 'print', 'export', 'close'])

const saveReport = () => {
  emit('save', props.reportData)
}

const printReport = () => {
  emit('print', props.reportData)
}

const exportReport = () => {
  emit('export', props.reportData)
}

const closeReport = () => {
  emit('close')
}
</script>

<style scoped>
.inspection-report {
  font-family: Arial, sans-serif;
  border: 1px solid #ccc;
  padding: 20px;
  background-color: white;
  max-width: 1200px;
  margin: 0 auto;
}

.report-header {
  margin-bottom: 20px;
}

.report-title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #000;
}

.report-info {
  margin-bottom: 15px;
}

.info-grid {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-label {
  width: 100px;
  font-weight: bold;
  margin-right: 10px;
}

.info-value {
  width: 180px;
}

.product-info, .supplier-info {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 5px;
}

.supplier-info .info-grid {
  justify-content: flex-start;
}

.supplier-info .info-item {
  margin-right: 40px;
}

.inspection-items {
  margin-bottom: 20px;
  overflow-x: auto;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th, .items-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
  font-size: 12px;
}

.items-table th {
  background-color: #e0e0e0;
  font-weight: bold;
  position: sticky;
  top: 0;
}

.items-table td.pass {
  color: green;
  font-weight: bold;
}

.items-table td.fail {
  color: red;
  font-weight: bold;
}

.test-summary {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 5px;
}

.summary-item {
  margin-bottom: 10px;
}

.summary-label {
  font-weight: bold;
  margin-right: 10px;
}

.result-options {
  display: inline-block;
}

.result-options label {
  margin-right: 20px;
  cursor: pointer;
}

.defect-details {
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
}

.defect-item {
  display: flex;
  align-items: center;
}

.defect-label {
  font-weight: bold;
  margin-right: 10px;
}

.defect-item input, .defect-item select {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 3px;
  width: 120px;
}

.action-buttons {
  text-align: right;
  margin-top: 20px;
}
</style>
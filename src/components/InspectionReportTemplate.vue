<template>
  <Panel header="检验报告模板系统" class="inspection-report-template">
    <div class="main-content">
      <div class="sidebar">
        <h3 style="margin-bottom: 15px; color: #333;">模板选择</h3>
        <div id="templates">
          <div 
            v-for="template in templates" 
            :key="template.id" 
            :class="['template-card', { active: currentTemplate.id === template.id }]"
            @click="loadTemplate(template)"
          >
            <div class="template-title">{{ template.name }}检验报告</div>
            <div class="template-desc">{{ template.description }}</div>
          </div>
        </div>
      </div>
      
      <div class="report-viewer">
        <div class="report-header">
          <h2 id="reportTitle" class="report-title">{{ currentTemplate.name }}检验报告</h2>
          <div class="inspection-order-no">
            检验单号：{{ formData.inspectionOrderNo || '' }}
          </div>
        </div>
        
        <!-- 基本信息 -->
        <div class="section">
          <h3 class="section-title">基本信息</h3>
          <div class="form-grid">
            <!-- 动态生成所有可见字段，支持排序 -->
            <div 
              class="form-group field-item" 
              v-for="field in visibleFields" 
              :key="field.id"
              draggable="true"
              @dragstart="onDragStart($event, field)"
              @dragover.prevent
              @drop="onDrop($event, field)"
            >
              <div class="field-header">
                <label class="form-label">{{ field.label }}</label>
                <button 
                  class="field-action-btn"
                  @click="toggleFieldVisibility(field)"
                  :title="field.visible ? '隐藏字段' : '显示字段'"
                >
                  {{ field.visible ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
              <input 
                :type="field.type" 
                :id="field.id" 
                v-model="formData[field.id]" 
                class="form-control"
                :placeholder="`请输入${field.label}`"
              >
            </div>
          </div>
        </div>
        
        <!-- 检验项目 -->
        <div class="section">
          <h3 class="section-title">检验项目</h3>
          <div class="table-container">
            <table id="testItems">
              <thead>
                <tr>
                  <th>检验项目</th>
                  <th>标准要求</th>
                  <th>检验结果</th>
                  <th>单位</th>
                  <th>判定</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in currentTemplate.testItems" :key="index">
                  <td>{{ item && item.name }}</td>
                  <td>{{ item && item.standard }}</td>
                  <td>
                    <input 
                      :type="item && item.type" 
                      class="result-input" 
                      v-model="testResults[index]"
                      placeholder="输入结果"
                      @input="updateResult(index, testResults[index])"
                    >
                  </td>
                  <td>{{ item && item.unit }}</td>
                  <td>
                    <span :class="['status', item ? getResultStatus(item, testResults[index]) : 'pending']">
                      {{ item ? getStatusText(getResultStatus(item, testResults[index])) : '待检' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- 简洁的审批确认区域 -->
        <div class="section">
          <h3 class="section-title">审批确认</h3>
          <div class="approval-simple" id="approvalSimple">
            <div class="approval-item-simple" v-for="(item, index) in approvalItems" :key="index">
              <div class="approval-label">{{ item.label }}：</div>
              <div class="signature-line"></div>
              <div v-if="item.hasDate" class="approval-label" style="margin-top: 15px;">日期：</div>
              <div v-if="item.hasDate" class="date-line"></div>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="buttons">
          <Button label="保存模板" icon="pi pi-save" @click="saveTemplate" class="p-mr-2" />
          <Button label="添加自定义字段" icon="pi pi-plus" @click="showAddFieldDialog = true" class="p-mr-2" />
          <Button label="删除字段" icon="pi pi-trash" @click="deleteCustomField" class="p-button-danger p-mr-2" :disabled="customFields.length === 0" />
          <Button label="清空模板数据" icon="pi pi-eraser" @click="clearTemplateData" class="p-button-warning" />
        </div>
      </div>
    </div>
    
    <!-- 添加字段对话框 -->
    <Dialog header="添加自定义字段" v-model:visible="showAddFieldDialog" @hide="resetAddFieldDialog">
      <div class="p-fluid p-formgrid p-grid">
        <div class="p-field p-col-12">
          <label for="fieldName">字段名称</label>
          <InputText id="fieldName" v-model="newField.name" required />
        </div>
        <div class="p-field p-col-12">
          <label for="fieldType">字段类型</label>
          <select id="fieldType" v-model="newField.type" class="p-inputtext p-w-full">
            <option value="text">文本</option>
            <option value="number">数字</option>
            <option value="date">日期</option>
          </select>
        </div>
      </div>
      <template #footer>
        <div>
          <Button label="取消" @click="showAddFieldDialog = false" />
          <Button label="添加" @click="addCustomField" class="p-mr-2" :disabled="!newField.name" />
        </div>
      </template>
    </Dialog>
    
    <div class="footer">
      <p>检验报告模板系统 | 当前模板: <span id="currentTemplateName">{{ currentTemplate.name }}</span></p>
    </div>
  </Panel>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Panel from 'primevue/panel'

// 模板数据
const templates = ref([
  {
    id: 1,
    name: '原料',
    description: '原材料质量检验报告',
    subtitle: '原材料入库检验报告',
    fields: [
      { id: 'manufacturer', label: '生产商', type: 'text', required: true },
      { id: 'supplier', label: '供应商', type: 'text', required: true },
      { id: 'batchNo', label: '批号', type: 'text', required: true },
      { id: 'manufacturerBatchNo', label: '厂家批号', type: 'text', required: true },
      { id: 'submissionDate', label: '送检日期', type: 'date', required: true },
    ],
    testItems: [
      { name: '外观', standard: '均匀，无杂质', unit: '目测', type: 'text', min: null, max: null },
      { name: '含量', standard: '≥98.5%', unit: '%', type: 'number', min: 98.5, max: 101 },
      { name: '水分', standard: '≤0.5%', unit: '%', type: 'number', min: null, max: 0.5 },
      { name: '重金属', standard: '≤10ppm', unit: 'ppm', type: 'number', min: null, max: 10 },
      { name: '微生物', standard: '≤100CFU/g', unit: 'CFU/g', type: 'number', min: null, max: 100 }
    ]
  },
  {
    id: 2,
    name: '包材',
    description: '包装材料检验报告',
    subtitle: '包装材料验收检验报告',
    fields: [
      { id: 'manufacturer', label: '生产商', type: 'text', required: true },
      { id: 'supplier', label: '供应商', type: 'text', required: true },
      { id: 'batchNo', label: '批号', type: 'text', required: true },
      { id: 'manufacturerBatchNo', label: '厂家批号', type: 'text', required: true },
      { id: 'submissionDate', label: '送检日期', type: 'date', required: true },
      { id: 'specification', label: '规格尺寸', type: 'text', required: true }
    ],
    testItems: [
      { name: '外观', standard: '平整，无瑕疵', unit: '目测', type: 'text', min: null, max: null },
      { name: '尺寸偏差', standard: '±0.5mm', unit: 'mm', type: 'number', min: -0.5, max: 0.5 },
      { name: '密封性', standard: '无泄漏', unit: '检测', type: 'text', min: null, max: null },
      { name: '印刷质量', standard: '清晰，无错位', unit: '目测', type: 'text', min: null, max: null }
    ]
  },
  {
    id: 3,
    name: '半成品',
    description: '半成品过程检验报告',
    subtitle: '生产过程质量检验报告',
    fields: [
      { id: 'manufacturer', label: '生产商', type: 'text', required: true },
      { id: 'supplier', label: '供应商', type: 'text', required: true },
      { id: 'batchNo', label: '批号', type: 'text', required: true },
      { id: 'manufacturerBatchNo', label: '厂家批号', type: 'text', required: true },
      { id: 'submissionDate', label: '送检日期', type: 'date', required: true },
    ],
    testItems: [
      { name: '外观', standard: '符合要求', unit: '目测', type: 'text', min: null, max: null },
      { name: '中间体含量', standard: '95%-105%', unit: '%', type: 'number', min: 95, max: 105 },
      { name: '水分', standard: '≤3.0%', unit: '%', type: 'number', min: null, max: 3.0 },
      { name: 'pH值', standard: '6.5-7.5', unit: 'pH', type: 'number', min: 6.5, max: 7.5 }
    ]
  },
  {
    id: 4,
    name: '成品',
    description: '最终成品检验报告',
    subtitle: '产品出厂检验报告',
    fields: [
      { id: 'manufacturer', label: '生产商', type: 'text', required: true },
      { id: 'supplier', label: '供应商', type: 'text', required: true },
      { id: 'batchNo', label: '批号', type: 'text', required: true },
      { id: 'manufacturerBatchNo', label: '厂家批号', type: 'text', required: true },
      { id: 'submissionDate', label: '送检日期', type: 'date', required: true },
      { id: 'productName', label: '产品名称', type: 'text', required: true },
      { id: 'expiryDate', label: '有效期至', type: 'date', required: true }
    ],
    testItems: [
      { name: '外观', standard: '符合规定', unit: '目测', type: 'text', min: null, max: null },
      { name: '鉴别', standard: '阳性', unit: '检测', type: 'text', min: null, max: null },
      { name: '含量测定', standard: '90.0%-110.0%', unit: '%', type: 'number', min: 90, max: 110 },
      { name: '重金属', standard: '≤20ppm', unit: 'ppm', type: 'number', min: null, max: 20 }
    ]
  }
]);

// 当前选中的模板
const currentTemplate = ref(templates.value[0]);

// 预定义的固定字段列表，支持排序和隐藏
const predefinedFields = ref([
  { id: 'inspectionDate', label: '检验日期', type: 'date', order: 1, visible: true },
  { id: 'productName', label: '产品名称', type: 'text', order: 2, visible: true },
  { id: 'batchNo', label: '批号', type: 'text', order: 3, visible: true },
  { id: 'manufacturer', label: '生产商', type: 'text', order: 4, visible: true },
  { id: 'supplier', label: '供应商', type: 'text', order: 5, visible: true },
  { id: 'expiryDate', label: '有效期至', type: 'date', order: 6, visible: true }
]);

// 自定义字段列表（按模板保存）
const customFields = ref([]);

// 计算属性：获取所有可见字段，包括预定义和自定义字段，按order排序
const visibleFields = computed(() => {
  // 过滤出可见的预定义字段
  const visiblePredefinedFields = predefinedFields.value.filter(field => {
    // 有效期至只在成品模板中显示
    if (field.id === 'expiryDate') {
      return field.visible && currentTemplate.value.name === '成品';
    }
    return field.visible;
  });
  
  // 合并预定义字段和自定义字段
  const allFields = [...visiblePredefinedFields, ...customFields.value];
  
  // 按order排序
  return [...allFields].sort((a, b) => (a.order || 0) - (b.order || 0));
});

// 初始化预定义字段
const initPredefinedFields = () => {
  // 从localStorage加载预定义字段配置
  const storageKey = `predefinedFields_${currentTemplate.value.name}`;
  const savedFields = localStorage.getItem(storageKey);
  if (savedFields) {
    try {
      const parsedFields = JSON.parse(savedFields);
      // 合并保存的配置，保留默认值
      predefinedFields.value.forEach((field, index) => {
        const savedField = parsedFields.find(f => f.id === field.id);
        if (savedField) {
          field.order = savedField.order || field.order;
          field.visible = savedField.visible !== undefined ? savedField.visible : field.visible;
        }
      });
    } catch (error) {
      console.error('解析预定义字段配置失败:', error);
    }
  }
};

// 保存预定义字段配置
const savePredefinedFields = () => {
  const storageKey = `predefinedFields_${currentTemplate.value.name}`;
  localStorage.setItem(storageKey, JSON.stringify(predefinedFields.value));
};

// 初始化自定义字段（根据当前模板加载对应的自定义字段）
const initCustomFields = () => {
  // 从localStorage加载当前模板的自定义字段
  const storageKey = `customTemplateFields_${currentTemplate.value.name}`;
  const savedFields = localStorage.getItem(storageKey);
  if (savedFields) {
    try {
      customFields.value = JSON.parse(savedFields);
      // 确保自定义字段有order和visible属性
      customFields.value.forEach((field, index) => {
        if (field.order === undefined) {
          field.order = 100 + index; // 自定义字段默认排在后面
        }
        if (field.visible === undefined) {
          field.visible = true;
        }
      });
    } catch (error) {
      console.error('解析自定义字段失败:', error);
      customFields.value = [];
    }
  } else {
    customFields.value = [];
  }
};

// 保存当前模板的自定义字段到localStorage
const saveCustomFields = () => {
  const storageKey = `customTemplateFields_${currentTemplate.value.name}`;
  localStorage.setItem(storageKey, JSON.stringify(customFields.value));
};

// 拖拽相关功能
const draggedField = ref(null);

// 开始拖拽
const onDragStart = (event, field) => {
  draggedField.value = field;
  event.dataTransfer.effectAllowed = 'move';
  // 添加拖拽样式
  event.target.classList.add('dragging');
};

// 放置拖拽元素
const onDrop = (event, targetField) => {
  event.preventDefault();
  if (draggedField.value && draggedField.value !== targetField) {
    // 交换两个字段的order值
    const tempOrder = draggedField.value.order;
    draggedField.value.order = targetField.order;
    targetField.order = tempOrder;
    
    // 保存字段配置
    saveFieldConfig();
  }
  // 移除拖拽样式
  document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
};

// 切换字段可见性
const toggleFieldVisibility = (field) => {
  field.visible = !field.visible;
  // 保存字段配置
  saveFieldConfig();
};

// 保存字段配置
const saveFieldConfig = () => {
  savePredefinedFields();
  saveCustomFields();
};

// 表单数据
const formData = reactive({
  reportNo: 'RPT-' + new Date().getFullYear() + '-' + String(Math.floor(1000 + Math.random() * 9000)),
  inspectionDate: new Date().toISOString().split('T')[0],
  manufacturer: '',
  supplier: '',
  batchNo: '',
  manufacturerBatchNo: '',
  submissionDate: new Date().toISOString().split('T')[0],
  inspectionOrderNo: '',
  inspector: '',
  materialType: '',
  material: '',
  specification: '',
  processStage: '',
  equipment: '',
  productName: '',
  expiryDate: ''
});

// 测试结果数据
const testResults = ref({});

// 审批项
const approvalItems = ref([
  { label: '检验人', hasDate: true },
  { label: '审核人', hasDate: true },
  { label: '批准人', hasDate: true }
]);

// 添加字段对话框
const showAddFieldDialog = ref(false);
const newField = ref({
  name: '',
  type: 'text'
});

// 从localStorage加载检验报告数据并填充到模板中
const loadInspectionReportData = () => {
  try {
    // 检查是否有从报告管理页面传递过来的报告数据
    let reportData = localStorage.getItem('reportDataForTemplate');
    let parsedData = null;
    
    if (reportData) {
      // 有传递的报告数据，使用它
      parsedData = JSON.parse(reportData);
      // 清理localStorage中的数据，避免下次打开时重复加载
      localStorage.removeItem('reportDataForTemplate');
    } else {
      // 没有传递的报告数据，尝试加载最新的检验报告
      const inspectionReports = JSON.parse(localStorage.getItem('inspectionReports') || '[]');
      if (inspectionReports.length > 0) {
        // 获取最新的检验报告
        parsedData = inspectionReports[inspectionReports.length - 1];
      }
    }
    
    if (parsedData) {
      // 统一字段映射 - 将检验管理和报告管理页面的字段映射到模板系统字段
      const fieldMappings = {
        // 基本信息映射
        'reportCode': ['reportCode', 'inspectionNumber'],
        'inspectionOrderNo': ['reportCode', 'inspectionNumber'],
        'productName': ['productName', 'materialName'],
        'batchNo': ['batchNumber', 'batchNo'],
        'manufacturer': ['manufacturer'],
        'supplier': ['supplier'],
        'inspectionDate': ['createDate', 'inspectionDate'],
        'submissionDate': ['createDate', 'deliveryDate'],
        
        // 扩展信息映射
        'specification': ['specification'],
        'standardCode': ['standardCode'],
        'validUntil': ['validUntil'],
        'inspector': ['inspector'],
        'agent': ['agent']
      };
      
      // 应用字段映射
      Object.entries(fieldMappings).forEach(([templateField, sourceFields]) => {
        for (const sourceField of sourceFields) {
          if (parsedData[sourceField] !== undefined && parsedData[sourceField] !== '') {
            formData[templateField] = parsedData[sourceField];
            break;
          }
        }
      });
      
      // 填充检验项目数据
      if (parsedData.inspectionItems && parsedData.inspectionItems.length > 0) {
        // 将检验管理页面的检验项目转换为模板系统的测试结果格式
        const testResultsMap = {};
        parsedData.inspectionItems.forEach((item, index) => {
          // 找到对应的模板检验项目
          const templateItem = currentTemplate.value.testItems[index];
          if (templateItem) {
            testResultsMap[index] = item.actualValue || '';
          }
        });
        testResults.value = testResultsMap;
        
        // 如果模板的检验项目数量少于检验报告的检验项目数量，添加缺失的检验项目
        if (parsedData.inspectionItems.length > currentTemplate.value.testItems.length) {
          // 这里可以根据需要添加逻辑来处理额外的检验项目
          console.warn('检验报告中的检验项目数量超过了模板定义的数量');
        }
      }
      
      console.log('已加载检验报告数据到模板系统，字段映射完成');
    }
  } catch (error) {
    console.error('解析报告数据失败:', error);
  }
};

// 初始化
onMounted(() => {
  // 初始化预定义字段
  initPredefinedFields();
  // 初始化自定义字段
  initCustomFields();
  // 加载模板
  loadTemplate(currentTemplate.value);
  
  // 加载检验报告数据到模板中
  loadInspectionReportData();
});

// 加载模板
const loadTemplate = (template) => {
  currentTemplate.value = template;
  
  // 重新初始化自定义字段
  initCustomFields();
  
  // 尝试加载保存的模板数据
  loadSavedTemplateData();
  
  // 清空测试结果
  testResults.value = {};
}

// 更新测试结果
const updateResult = (index, value) => {
  testResults.value[index] = value;
}

// 获取结果状态
const getResultStatus = (item, value) => {
  if (!item) return 'pending';
  if (!value || value.trim() === '') return 'pending';
  
  if (item.type === 'number') {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'fail';
    
    if (item.min !== null && item.max !== null) {
      return numValue >= item.min && numValue <= item.max ? 'pass' : 'fail';
    } else if (item.min !== null) {
      return numValue >= item.min ? 'pass' : 'fail';
    } else if (item.max !== null) {
      return numValue <= item.max ? 'pass' : 'fail';
    }
  } else if (item.type === 'text') {
    // 文本类型简单判断
    return value.includes('符合') || value.includes('合格') ? 'pass' : 'pending';
  }
  
  return 'pending';
}

// 获取状态文本
const getStatusText = (status) => {
  switch(status) {
    case 'pass': return '合格';
    case 'fail': return '不合格';
    default: return '待检';
  }
}

// 打印报告
const printReport = () => {
  // 获取当前日期
  const today = new Date();
  
  // 自动填写检验日期（如果为空）
  if (!formData.inspectionDate) {
    formData.inspectionDate = today.toISOString().split('T')[0];
  }
  
  // 打印前提示
  alert('即将打印报告。打印后请在签名区域手写签名。');
  
  // 打印页面
  window.print();
}

// 添加自定义字段
const addCustomField = () => {
  if (newField.value.name) {
    // 生成唯一ID（使用时间戳确保唯一性）
    const fieldId = newField.value.name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
    
    // 创建新字段对象
    const newFieldObj = {
      id: fieldId,
      label: newField.value.name,
      type: newField.value.type,
      required: false
    };
    
    // 添加到自定义字段列表
    customFields.value.push(newFieldObj);
    
    // 保存当前模板的自定义字段到localStorage
    saveCustomFields();
    
    // 初始化表单数据
    formData[fieldId] = '';
    
    // 关闭对话框
    showAddFieldDialog.value = false;
    resetAddFieldDialog();
    
    alert('字段添加成功！已保存到当前模板。');
  }
}

// 重置添加字段对话框
const resetAddFieldDialog = () => {
  newField.value = {
    name: '',
    type: 'text'
  };
}

// 删除自定义字段
const deleteCustomField = () => {
  if (customFields.value.length === 0) {
    alert('没有可删除的自定义字段');
    return;
  }
  
  // 构建字段列表供用户选择
  const fieldList = customFields.value.map((field, index) => `${index + 1}. ${field.label}`).join('\n');
  const fieldToDelete = prompt(`请输入要删除的字段编号：\n${fieldList}`);
  
  if (fieldToDelete) {
    const index = parseInt(fieldToDelete) - 1;
    if (index >= 0 && index < customFields.value.length) {
      const deletedField = customFields.value[index];
      
      // 从表单数据中移除该字段
      if (formData[deletedField.id] !== undefined) {
        delete formData[deletedField.id];
      }
      
      // 从列表中移除
      customFields.value.splice(index, 1);
      
      // 保存到localStorage
      saveCustomFields();
      
      alert(`字段 "${deletedField.label}" 已删除`);
    } else {
      alert('无效的字段编号');
    }
  }
}

// 清空模板数据
const clearTemplateData = () => {
  if (confirm('确定要清空当前模板的所有数据吗？此操作不会删除自定义字段。')) {
    // 清空表单数据
    formData.reportNo = 'RPT-' + new Date().getFullYear() + '-' + String(Math.floor(1000 + Math.random() * 9000));
    formData.inspectionDate = new Date().toISOString().split('T')[0];
    formData.manufacturer = '';
    formData.supplier = '';
    formData.batchNo = '';
    formData.manufacturerBatchNo = '';
    formData.submissionDate = new Date().toISOString().split('T')[0];
    formData.inspectionOrderNo = '';
    formData.productName = '';
    formData.expiryDate = '';
    
    // 清空测试结果
    testResults.value = {};
    
    // 清空自定义字段的数据
    customFields.value.forEach(field => {
      formData[field.id] = '';
    });
    
    alert('模板数据已清空');
  }
};

// 保存模板
const saveTemplate = () => {
  try {
    // 构建要保存的模板数据
    const templateData = {
      templateName: currentTemplate.value.name,
      savedAt: new Date().toISOString(),
      formData: { ...formData },
      testResults: { ...testResults.value },
      customFields: [...customFields.value]
    };
    
    // 保存到localStorage
    const storageKey = `savedTemplate_${currentTemplate.value.name}`;
    localStorage.setItem(storageKey, JSON.stringify(templateData));
    
    alert(`模板 "${currentTemplate.value.name}" 已保存！\n保存时间：${new Date().toLocaleString()}`);
  } catch (error) {
    console.error('保存模板失败:', error);
    alert('保存模板失败，请重试');
  }
};

// 加载保存的模板数据
const loadSavedTemplateData = () => {
  try {
    const storageKey = `savedTemplate_${currentTemplate.value.name}`;
    const savedData = localStorage.getItem(storageKey);
    
    if (savedData) {
      const templateData = JSON.parse(savedData);
      
      // 恢复表单数据
      Object.assign(formData, templateData.formData);
      
      // 恢复测试结果
      testResults.value = templateData.testResults || {};
      
      alert(`已加载保存的模板数据（保存时间：${new Date(templateData.savedAt).toLocaleString()}）`);
    }
  } catch (error) {
    console.error('加载保存的模板数据失败:', error);
  }
};
</script>

<style scoped>
.inspection-report-template {
  max-width: 1400px;
  margin: 0 auto;
}

.main-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.sidebar {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.template-card {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.template-card:hover {
  border-color: #1890ff;
  transform: translateY(-2px);
}

.template-card.active {
  border-color: #1890ff;
  background: #e6f7ff;
}

.template-title {
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 5px;
}

.template-desc {
  font-size: 12px;
  color: #666;
}

.report-viewer {
  background: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.report-header {
  border-bottom: 2px solid #1890ff;
  padding-bottom: 20px;
  margin-bottom: 25px;
}

.report-title {
  font-size: 22px;
  color: #1890ff;
  margin: 0 0 10px 0;
  text-align: center;
}

.inspection-order-no {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  text-align: left;
  margin-top: 10px;
}

.section {
  margin-bottom: 25px;
  padding: 20px;
  background: #fafafa;
  border-radius: 6px;
}

.section-title {
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 4px solid #1890ff;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  margin-bottom: 15px;
}

/* 字段项样式 */
.field-item {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 10px;
  transition: all 0.3s ease;
}

.field-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

/* 拖拽样式 */
.field-item.dragging {
  opacity: 0.5;
  border-color: #1890ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
  transform: rotate(2deg);
}

/* 字段头部样式 */
.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.form-label {
  margin: 0;
  font-weight: 500;
  color: #555;
}

/* 字段操作按钮样式 */
.field-action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.field-action-btn:hover {
  background: #f0f0f0;
  transform: scale(1.1);
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-control:focus {
  border-color: #1890ff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(24,144,255,0.2);
}

/* 简洁的三列审批样式 */
.approval-simple {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid #ddd;
  text-align: left;
}

.approval-item-simple {
  flex: 1;
  font-size: 16px;
  line-height: 1.8;
}

.approval-label {
  font-weight: 500;
  color: #333;
  margin-bottom: 15px;
}

.signature-line {
  margin-top: 10px;
  border-bottom: 2px solid #999;
  width: 80%;
  min-width: 150px;
  height: 30px;
}

.date-line {
  margin-top: 5px;
  border-bottom: 1px solid #999;
  width: 80%;
  min-width: 150px;
  height: 25px;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th {
  background: #f0f7ff;
  padding: 12px;
  text-align: left;
  border-bottom: 2px solid #ddd;
  color: #333;
}

td {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

tr:hover {
  background: #f9f9f9;
}

.result-input {
  width: 100px;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.status {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-pass {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.status-fail {
  background: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

.status-pending {
  background: #fafafa;
  color: #8c8c8c;
  border: 1px solid #d9d9d9;
}

.buttons {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn {
  padding: 10px 25px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #1890ff;
  color: white;
}

.btn-primary:hover {
  background: #096dd9;
}

.footer {
  text-align: center;
  color: #666;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

/* 打印样式 */
@media print {
  .sidebar {
    display: none;
  }
  
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .buttons {
    display: none;
  }
  
  .footer {
    display: none;
  }
  
  .signature-line {
    border-bottom: 2px solid #000;
  }
  
  .date-line {
    border-bottom: 1px solid #000;
  }
  
  body {
    background: white;
    padding: 0;
  }
  
  .container {
    max-width: 100%;
    margin: 0;
  }
  
  .section {
    break-inside: avoid;
  }
  
  table {
    break-inside: avoid;
  }
}

@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .approval-simple {
    flex-direction: column;
    gap: 25px;
  }
}
</style>
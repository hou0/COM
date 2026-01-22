<template>
  <Panel header="报告管理" class="report-management">
    <Toolbar>
      <template #start>
        <InputText v-model="searchQuery" placeholder="搜索报告..." class="p-w-full p-mr-2" style="width: 300px" />
        <select v-model="filterReportType" placeholder="筛选报告类型" class="p-inputtext p-mr-2" style="width: 150px">
          <option value="">全部</option>
          <option v-for="type in reportTypes" :key="type" :value="type">{{ type }}</option>
        </select>
      </template>
      <template #end>
        <Button label="添加报告" icon="pi pi-plus" @click="showAddDialog = true" class="p-mr-2" />
        <Button label="导入报告" icon="pi pi-upload" @click="importReports" />
        <Button label="导出报告" icon="pi pi-download" @click="exportReports" />
      </template>
    </Toolbar>

    <div class="report-table-container">
      <DataTable :value="filteredReports" responsiveLayout="scroll" class="report-table">
        <Column field="reportName" header="报告名称" />
        <Column field="reportCode" header="检验单号" />
        <Column field="productName" header="关联产品" />
        <Column field="batchNumber" header="批次号" />
        <Column field="createDate" header="创建日期" />
        <Column field="status" header="状态">
          <template #body="{ data }">
            <span :class="['status', data.status]">{{ data.status }}</span>
          </template>
        </Column>
        <Column field="author" header="编制人" sortable />
        <Column field="approver" header="审批人" sortable />
        <Column header="操作" style="width: 220px;">
          <template #body="{ data }">
            <div class="table-actions">
          <Button icon="pi pi-eye" @click="viewReport(data)" class="p-mr-2" />
          <!-- 如果是检验报告，添加编辑到检验管理页面的按钮 -->
          <Button 
            v-if="data.originalInspectionData" 
            icon="pi pi-refresh" 
            @click="editInInspectionManagement(data)" 
            class="p-mr-2" 
            :tooltip="'编辑检验'"
          />
          <!-- 只有待审批状态的报告才能审核 -->
          <Button 
            v-if="data.status === '待审批'" 
            icon="pi pi-check" 
            @click="approveReport(data)" 
            class="p-mr-2" 
            severity="success"
            :tooltip="'审核通过'"
          />
          <Button icon="pi pi-trash" @click="deleteReport(data)" severity="danger" />
        </div>
          </template>
        </Column>
      </DataTable>
    </div>


    
    <!-- View Report Dialog -->
    <Dialog :header="currentViewReport.reportName" v-model:visible="showViewDialog" :style="{ width: '1000px' }">
      <!-- 模板选择和切换按钮 -->
      <div class="p-d-flex p-jc-between p-ai-center p-mb-4">
        <div class="p-d-flex p-ai-center">
          <label for="templateSelect" class="p-mr-2">选择模板：</label>
          <select id="templateSelect" v-model="selectedTemplate" class="p-inputtext p-mr-2" style="width: 150px;">
            <option value="">请选择模板</option>
            <option value="原料">原料检验报告</option>
            <option value="包材">包材检验报告</option>
            <option value="半成品">半成品检验报告</option>
            <option value="成品">成品检验报告</option>
          </select>
          <Button label="使用模板查看" @click="useTemplateView(currentViewReport)" class="p-mr-2" :disabled="!selectedTemplate" />
        </div>
        <div class="p-d-flex p-ai-center">
          <Button v-if="showTemplatePreview" label="打印报告" icon="pi pi-print" @click="printReport" class="p-mr-2" />
          <Button v-if="showTemplatePreview" label="导出Word" icon="pi pi-file-word" @click="exportToWord" class="p-mr-2" />
          <Button v-if="showTemplatePreview" label="导出Excel" icon="pi pi-file-excel" @click="exportToExcel" class="p-mr-2" />
          <Button v-if="showTemplatePreview" label="返回原始视图" @click="switchToOriginalView" />
        </div>
      </div>
      
      <!-- 原始查看模式 -->
      <div v-if="!showTemplatePreview" class="p-fluid p-formgrid p-grid">
        <div class="p-field p-col-12 p-md-6">
          <label>检验单号</label>
          <div class="p-inputtext p-component p-filled">{{ currentViewReport.reportCode }}</div>
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label>报告类型</label>
          <div class="p-inputtext p-component p-filled">{{ currentViewReport.reportType || '检验报告' }}</div>
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label>关联产品</label>
          <div class="p-inputtext p-component p-filled">{{ currentViewReport.productName }}</div>
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label>批次号</label>
          <div class="p-inputtext p-component p-filled">{{ currentViewReport.batchNumber }}</div>
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label>创建日期</label>
          <div class="p-inputtext p-component p-filled">{{ currentViewReport.createDate }}</div>
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label>状态</label>
          <div class="p-inputtext p-component p-filled">
            <span :class="['status', currentViewReport.status]">{{ currentViewReport.status }}</span>
          </div>
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label>编制人</label>
          <div class="p-inputtext p-component p-filled">{{ currentViewReport.author }}</div>
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label>审批人</label>
          <div class="p-inputtext p-component p-filled">{{ currentViewReport.approver || '未审批' }}</div>
        </div>
        <div class="p-field p-col-12">
          <label>报告内容</label>
          <div class="p-inputtextarea p-component p-filled">{{ currentViewReport.reportContent }}</div>
        </div>
        <div class="p-field p-col-12">
          <label>备注</label>
          <div class="p-inputtextarea p-component p-filled">{{ currentViewReport.remarks }}</div>
        </div>
      </div>
      
      <!-- 模板预览模式 -->
      <div v-else class="template-preview">
        <div class="template-header">
          <h2>{{ selectedTemplate }}检验报告</h2>
          <div class="inspection-order-no">检验单号：{{ currentViewReport.reportCode }}</div>
        </div>
        
        <!-- 基本信息 -->
        <div class="template-section">
          <h3>基本信息</h3>
          <div class="template-form">
            <!-- 动态生成基本信息字段 -->
            <div 
              v-for="field in getCurrentTemplate.fields" 
              :key="field.id" 
              class="template-field"
            >
              <label>{{ field.label }}：</label>
              <span>{{ getFieldValue(field.id) !== undefined ? getFieldValue(field.id) : '未填写' }}</span>
            </div>
            
            <!-- 添加检验管理页面特有的字段 -->
            <div v-if="currentViewReport.originalInspectionData" class="template-field">
              <label>检验数量：</label>
              <span>{{ currentViewReport.originalInspectionData.inspectionQuantity || '' }}</span>
            </div>
            <div v-if="currentViewReport.originalInspectionData" class="template-field">
              <label>样品数量：</label>
              <span>{{ currentViewReport.originalInspectionData.sampleQuantity || '' }}</span>
            </div>
            <div v-if="currentViewReport.originalInspectionData" class="template-field">
              <label>有效期：</label>
              <span>{{ currentViewReport.originalInspectionData.validUntil || '' }}</span>
            </div>
            <div v-if="currentViewReport.originalInspectionData" class="template-field">
              <label>代理商：</label>
              <span>{{ currentViewReport.originalInspectionData.agent || '' }}</span>
            </div>
            <div v-if="currentViewReport.originalInspectionData" class="template-field">
              <label>生产日期：</label>
              <span>{{ currentViewReport.originalInspectionData.productionDate || '' }}</span>
            </div>
          </div>
        </div>
        

        
        <!-- 检验项目 -->
        <div class="template-section">
          <h3>检验项目</h3>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>序号</th>
                  <th>检验项目</th>
                  <th>检验标准</th>
                  <th>实际值</th>
                  <th>测量工具</th>
                  <th>关键项目</th>
                  <th>判定</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in (currentViewReport.originalInspectionData?.inspectionItems || [])" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td>{{ item.itemName }}</td>
                  <td>{{ item.standard }}</td>
                  <td>{{ item.actualValue || '未填写' }}</td>
                  <td>{{ item.measurementTool || '未填写' }}</td>
                  <td>{{ item.criticalItem || '否' }}</td>
                  <td>
                    <span class="status">
                      {{ item.result === '符合' ? '合格' : (item.result === '不符合' ? '不合格' : '待检') }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- 审批确认 -->
        <div class="template-section">
          <h3>审批确认</h3>
          <div class="approval-section">
            <div class="approval-item">
              <div class="approval-label">检验人：</div>
              <div class="signature-line"></div>
            </div>
            <div class="approval-item">
              <div class="approval-label">审核人：</div>
              <div class="signature-line"></div>
            </div>
            <div class="approval-item">
              <div class="approval-label">批准人：</div>
              <div class="signature-line"></div>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div>
          <Button label="关闭" @click="showViewDialog = false" />
        </div>
      </template>
    </Dialog>
  </Panel>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import router from '../router/index.js'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import { reportAPI } from '../services/api.js'



// 从localStorage加载检验报告数据
const loadReportsFromLocalStorage = () => {
  try {
    // 从localStorage获取检验报告
    const inspectionReports = JSON.parse(localStorage.getItem('inspectionReports') || '[]')
    
    // 将检验报告转换为报告管理页面所需的格式
    return inspectionReports.map(report => {
      // 生成报告名称
      const reportName = `${report.materialName || '未知产品'}检验报告`
      
      // 确定报告类型
      let reportType = '检验报告'
      if (report.inspectionType === 'YL') reportType = '原材料检验报告'
      else if (report.inspectionType === 'BC') reportType = '半成品检验报告'
      else if (report.inspectionType === 'CD') reportType = '成品检验报告'
      else if (report.inspectionType === 'PC') reportType = '包材检验报告'
      
      return {
        id: report.id,
        reportName: reportName,
        reportCode: report.inspectionNumber || `RPT-${report.id}`,
        reportType: reportType,
        productName: report.materialName || '未知产品',
        batchNumber: report.batchNumber || '',
        createDate: report.createDate || new Date().toISOString().split('T')[0],
        status: report.status || '已保存',
        author: report.inspector || '未知',
        approver: report.approver || '',
        summary: `${report.materialName || '未知产品'}的检验报告`,
        reportContent: `检验单号：${report.inspectionNumber || ''}\n检验日期：${report.inspectionDate || ''}\n检验结论：${report.conclusion === 'pass' ? '合格' : '不合格'}`,
        remarks: '',
        originalInspectionData: report
      }
    })
  } catch (error) {
    console.error('从localStorage加载报告失败:', error)
    return []
  }
}

// 从后端加载报告数据
const loadReportsFromAPI = async () => {
  try {
    const response = await reportAPI.getReports()
    return response
  } catch (error) {
    console.error('加载报告失败:', error)
    return []
  }
}

// 综合加载报告数据
const loadCombinedReports = async () => {
  // 先从API加载报告
  let apiReports = await loadReportsFromAPI()
  
  // 再从localStorage加载检验报告
  const localStorageReports = loadReportsFromLocalStorage()
  
  // 合并报告，避免重复
  const allReports = [...apiReports, ...localStorageReports]
  
  // 去重（根据id）
  const uniqueReports = []
  const reportIds = new Set()
  
  for (const report of allReports) {
    if (!reportIds.has(report.id)) {
      reportIds.add(report.id)
      uniqueReports.push(report)
    }
  }
  
  return uniqueReports
}

const reports = ref([])

// 加载报告数据
const loadReports = async () => {
  try {
    reports.value = await loadCombinedReports()
  } catch (error) {
    console.error('加载报告数据失败:', error)
    // 加载失败时，只从localStorage加载数据
    reports.value = loadReportsFromLocalStorage()
  }
}

const searchQuery = ref('')
const filterReportType = ref('')// 状态定义
const showViewDialog = ref(false)
const showTemplatePreview = ref(false)
const currentViewReport = ref({})
const selectedTemplate = ref('')
const reportTypes = ['原材料检验报告', '过程检验报告', '成品检验报告', '不合格品报告', '质量分析报告', '其他报告']

// 初始化模板数据
const initTemplates = () => {
  // 基础模板数据
  const baseTemplates = [
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
        { id: 'materialType', label: '原料类型', type: 'text', required: true }
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
        { id: 'material', label: '包装材质', type: 'text', required: true },
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
  ];
  
  // 从localStorage加载自定义字段和模板配置
  return baseTemplates.map(template => {
    // 加载预定义字段配置
    const predefinedFieldsKey = `predefinedFields_${template.name}`;
    const savedPredefinedFields = localStorage.getItem(predefinedFieldsKey);
    
    // 加载自定义字段
    const customFieldsKey = `customTemplateFields_${template.name}`;
    const savedCustomFields = localStorage.getItem(customFieldsKey);
    
    // 合并基础字段和自定义字段
    let allFields = [...template.fields];
    if (savedCustomFields) {
      try {
        const customFields = JSON.parse(savedCustomFields);
        // 合并自定义字段，但只保留不存在的字段（避免重复）
        customFields.forEach(customField => {
          // 检查该字段是否已经存在于基础字段中
          const fieldExists = allFields.some(field => field.id === customField.id);
          if (!fieldExists) {
            allFields.push(customField);
          }
        });
      } catch (error) {
        console.error(`解析${template.name}模板的自定义字段失败:`, error);
      }
    }
    
    // 应用预定义字段的可见性和排序配置
    if (savedPredefinedFields) {
      try {
        const predefinedFields = JSON.parse(savedPredefinedFields);
        allFields = allFields.map(field => {
          const savedField = predefinedFields.find(f => f.id === field.id);
          if (savedField) {
            return { ...field, visible: savedField.visible, order: savedField.order };
          }
          return { ...field, visible: true, order: field.order || 0 };
        });
      } catch (error) {
        console.error(`解析${template.name}模板的预定义字段配置失败:`, error);
      }
    }
    
    // 按order排序字段
    allFields.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // 过滤出可见字段
    const visibleFields = allFields.filter(field => field.visible !== false);
    
    return {
      ...template,
      fields: visibleFields
    };
  });
};

// 模板数据（从localStorage加载，支持动态更新）
const templates = ref(initTemplates());


// 根据选中的模板名称获取模板对象
const getCurrentTemplate = computed(() => {
  return templates.value.find(template => template.name === selectedTemplate.value) || templates.value[0];
});

// 从报告内容中提取检验项目的实际值
const extractActualValue = (itemName) => {
  // 如果原始检验数据存在，直接从原始数据中获取
  if (currentViewReport.value.originalInspectionData && currentViewReport.value.originalInspectionData.inspectionItems) {
    const inspectionItem = currentViewReport.value.originalInspectionData.inspectionItems.find(item => item.itemName === itemName);
    if (inspectionItem) {
      return inspectionItem.actualValue || '';
    }
  }
  
  // 否则从报告内容中提取
  return currentViewReport.value[itemName] || '';
};

// 从报告内容中提取检验项目的判定结果
const extractResultStatus = (itemName) => {
  // 如果原始检验数据存在，直接从原始数据中获取
  if (currentViewReport.value.originalInspectionData && currentViewReport.value.originalInspectionData.inspectionItems) {
    const inspectionItem = currentViewReport.value.originalInspectionData.inspectionItems.find(item => item.itemName === itemName);
    if (inspectionItem) {
      if (inspectionItem.isQualified !== undefined) {
        return inspectionItem.isQualified ? '合格' : '不合格';
      } else if (inspectionItem.result) {
        // 处理检验管理页面的结果格式
        return inspectionItem.result === '符合' ? '合格' : '不合格';
      }
      return '待检';
    }
  }
  
  // 否则从报告内容中提取
  return '待检';
};

// 根据字段ID获取报告中的对应值
const getFieldValue = (fieldId) => {
  // 首先尝试从原始检验数据中获取
  if (currentViewReport.value.originalInspectionData) {
    const originalData = currentViewReport.value.originalInspectionData;
    
    // 根据不同字段ID映射到原始数据的不同属性
    switch (fieldId) {
      // 基本信息字段
      case 'productName':
        return originalData.materialName || originalData.productName;
      case 'batchNo':
      case '批号':
        return originalData.batchNumber || originalData.batchNo || '';
      case 'manufacturer':
      case '生产商':
        return originalData.manufacturer || '';
      case 'supplier':
      case '供应商':
        return originalData.supplier || originalData.agent || '';
      case 'inspectionDate':
      case '检验日期':
        return originalData.inspectionDate || originalData.createDate || '';
      case 'expiryDate':
      case '有效期':
        return originalData.expiryDate || originalData.validUntil || '';
      case 'submissionDate':
      case '送检日期':
        return originalData.deliveryDate || originalData.createDate || '';
      case 'inspectionOrderNo':
      case '检验单号':
        return originalData.inspectionNumber || '';
      case 'manufacturerBatchNo':
      case '厂家批号':
      case '原厂批号':
        return originalData.originalBatchNumber || originalData.manufacturerBatchNo || '';
      case 'materialType':
      case '原料类型':
        // 映射产品类型代码到中文名称
        const typeMapping = {
          'YL': '原料',
          'BC': '半成品',
          'CD': '成品',
          'PC': '包材'
        };
        return typeMapping[originalData.inspectionType] || originalData.materialType || '未填写';
      case 'sampleQuantity':
      case '样品数量':
        return originalData.sampleQuantity || '';
      case 'material':
        return originalData.material || originalData.materialName || '';
      case 'specification':
      case '规格':
        return originalData.specification || '';
      case 'processStage':
        return originalData.processStage || '';
      case 'equipment':
        return originalData.equipment || '';
      case 'inspectionQuantity':
      case '检验数量':
        return originalData.inspectionQuantity || '';
      case 'agent':
      case '代理商':
        return originalData.agent || '';
      case 'productionDate':
      case '生产日期':
        return originalData.productionDate || '';
      default:
        // 对于其他字段，直接从原始数据中查找
        return originalData[fieldId] || '';
    }
  }
  
  // 如果没有原始检验数据，从报告内容中提取
  return currentViewReport.value[fieldId] || '';
};

const filteredReports = computed(() => {
  return reports.value.filter(report => {
    const matchesSearch = !searchQuery.value || 
      report.reportName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      report.reportCode.includes(searchQuery.value) ||
      report.productName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      report.batchNumber.includes(searchQuery.value)
    
    const matchesType = !filterReportType.value || report.reportType === filterReportType.value
    
    return matchesSearch && matchesType
  })
})

const refreshReports = async () => {
  // 重新加载报告数据，确保显示最新的检验报告
  await loadReports()
}

const viewReport = (report) => {
  // 查看报告详情
  currentViewReport.value = { ...report }
  showViewDialog.value = true
}

const deleteReport = async (report) => {
  if (confirm('确定要删除这个报告吗？')) {
    try {
      await reportAPI.deleteReport(report.id)
      await loadReports()
    } catch (error) {
      console.error('删除报告失败:', error)
    }
  }
}

// 使用模板查看报告
const useTemplateView = (report) => {
  // 重新加载模板数据，确保获取最新的模板配置
  templates.value = initTemplates();
  // 切换到模板预览模式
  showTemplatePreview.value = true
};

// 切换回原始查看模式
const switchToOriginalView = () => {
  showTemplatePreview.value = false
}

const approveReport = async (report) => {
  if (confirm('确定要审核通过这个报告吗？')) {
    // 设置审批人（这里可以根据实际需求获取当前登录用户）
    const approver = prompt('请输入审批人姓名：', '系统管理员')
    if (approver) {
      try {
        // 更新报告状态和审批人
        await reportAPI.updateReport(report.id, {
          ...report,
          status: '已审批',
          approver: approver
        })
        await loadReports()
      } catch (error) {
        console.error('审批报告失败:', error)
      }
    }
  }
}

const editInInspectionManagement = (report) => {
  console.log('Edit inspection button clicked', report)
  if (report.originalInspectionData) {
    // 将检验报告数据保存到localStorage，供检验管理页面加载
    localStorage.setItem('editingInspectionReport', JSON.stringify(report.originalInspectionData))
    console.log('Saved inspection data to localStorage', report.originalInspectionData)
    
    // 自动跳转到检验管理页面
    try {
      router.push({ name: 'inspection-management' })
      console.log('Router push successful')
    } catch (error) {
      console.error('Router push failed', error)
    }
  } else {
    console.log('No originalInspectionData found', report)
  }
}



// 组件挂载时刷新报告数据
onMounted(() => {
  refreshReports()
})

// 导入报告功能
const importReports = () => {
  // 创建一个隐藏的文件输入元素
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = '.json'
  
  fileInput.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const importedReports = JSON.parse(event.target.result)
          if (Array.isArray(importedReports)) {
            // 为导入的报告生成新的ID
            const maxId = Math.max(...reports.value.map(r => r.id), 0)
            importedReports.forEach((report, index) => {
              report.id = maxId + index + 1
              reports.value.push(report)
            })
            alert(`成功导入 ${importedReports.length} 个报告`)
          } else {
            alert('导入的文件格式不正确，应为报告数组')
          }
        } catch (error) {
          alert('导入失败：' + error.message)
        }
      }
      reader.readAsText(file)
    }
  }
  
  // 触发文件选择
  fileInput.click()
}

// 导出报告功能
const exportReports = () => {
  if (reports.value.length === 0) {
    alert('没有报告可以导出')
    return
  }
  
  // 将报告数据转换为JSON格式
  const reportData = JSON.stringify(reports.value, null, 2)
  
  // 创建下载链接
  const blob = new Blob([reportData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `检验报告_${new Date().toISOString().split('T')[0]}.json`
  
  // 触发下载
  document.body.appendChild(a)
  a.click()
  
  // 清理
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
}

// 打印报告功能
const printReport = () => {
  // 使用浏览器的打印API
  window.print();
};

// 导出Word功能
const exportToWord = () => {
  // 创建一个新的Blob对象，包含要导出的HTML内容
  const templatePreview = document.querySelector('.template-preview');
  if (!templatePreview) return;
  
  // 先获取原始HTML内容
  let originalHtml = templatePreview.innerHTML;
  
  // 替换Grid布局为表格布局，因为表格在Word中兼容性更好
  // 1. 找到基本信息部分
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = originalHtml;
  
  // 处理基本信息部分，将template-form转换为表格
  const templateForms = tempDiv.querySelectorAll('.template-form');
  templateForms.forEach(form => {
    const fields = form.querySelectorAll('.template-field');
    const fieldCount = fields.length;
    
    // 创建表格
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.border = 'none';
    table.style.cellPadding = '8px';
    table.style.cellSpacing = '0';
    
    // 计算列数，这里使用3列布局
    const columns = 3;
    let currentRow = null;
    
    fields.forEach((field, index) => {
      // 每columns个字段创建一行
      if (index % columns === 0) {
        currentRow = document.createElement('tr');
        table.appendChild(currentRow);
      }
      
      // 创建单元格
      const cell = document.createElement('td');
      cell.style.width = `${100 / columns}%`;
      cell.style.border = 'none';
      cell.style.verticalAlign = 'top';
      
      // 设置字段样式
      field.style.display = 'block';
      field.style.margin = '0';
      
      // 处理label样式
      const label = field.querySelector('label');
      if (label) {
        label.style.fontWeight = 'bold';
        label.style.color = '#333';
        label.style.display = 'inline';
      }
      
      // 处理值样式
      const valueSpan = field.querySelector('span');
      if (valueSpan) {
        valueSpan.style.display = 'inline';
      }
      
      // 将字段添加到单元格
      cell.appendChild(field.cloneNode(true));
      currentRow.appendChild(cell);
    });
    
    // 替换原始的template-form为表格
    form.parentNode.replaceChild(table, form);
  });
  
  // 处理审批确认部分，确保三列布局在Word中正确显示
  const approvalSections = tempDiv.querySelectorAll('.approval-section');
  approvalSections.forEach(section => {
    const approvalItems = section.querySelectorAll('.approval-item');
    
    // 创建表格
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.border = 'none';
    table.style.cellPadding = '0';
    table.style.cellSpacing = '0';
    
    // 创建单行
    const row = document.createElement('tr');
    table.appendChild(row);
    
    // 为每个审批项创建单元格
    approvalItems.forEach(item => {
      const cell = document.createElement('td');
      cell.style.width = `${100 / approvalItems.length}%`;
      cell.style.border = 'none';
      cell.style.textAlign = 'center';
      cell.style.verticalAlign = 'top';
      cell.style.padding = '0';
      
      // 移除原始的inline-block样式
      item.style.display = 'block';
      item.style.width = '100%';
      item.style.margin = '0';
      
      // 将审批项添加到单元格
      cell.appendChild(item.cloneNode(true));
      row.appendChild(cell);
    });
    
    // 替换原始的approval-section为表格
    section.parentNode.replaceChild(table, section);
  });
  
  // 更新HTML内容
  const updatedHtml = tempDiv.innerHTML;
  
  // 获取模板预览的HTML内容
  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${currentViewReport.value.reportName}</title>
        <meta name="ProgId" content="Word.Document">
        <meta name="Generator" content="Microsoft Word 9">
        <meta name="Originator" content="Microsoft Word 9">
        <style>
          /* Word兼容样式 */
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            word-wrap: break-word;
          }
          .template-header {
            text-align: center;
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 2px solid #1890ff;
          }
          .template-header h2 {
            color: #1890ff;
            margin-bottom: 10px;
            font-size: 22px;
          }
          .inspection-order-no {
            text-align: left;
            font-weight: bold;
            font-size: 16px;
          }
          .template-section {
            margin-bottom: 25px;
            padding: 20px;
            background: #fafafa;
            border: 1px solid #eee;
          }
          .template-section h3 {
            font-size: 18px;
            color: #333;
            margin-bottom: 15px;
            padding-left: 10px;
            border-left: 4px solid #1890ff;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          /* 审批部分样式 */
          .approval-section {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
          }
          .approval-item {
            display: inline-block;
            width: 30%;
            text-align: center;
            margin: 0 1%;
          }
          .approval-label {
            font-weight: 500;
            margin-bottom: 10px;
            display: block;
          }
          .signature-line {
            border-bottom: 2px solid #999;
            width: 80%;
            margin: 0 auto;
            height: 30px;
          }
          /* 字段样式 */
          .template-field {
            margin: 0;
          }
          .template-field label {
            font-weight: bold;
            color: #333;
            display: inline;
          }
          .template-field span {
            display: inline;
          }
        </style>
      </head>
      <body>
        ${updatedHtml}
      </body>
    </html>
  `;
  
  // 创建Blob对象
  const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
  
  // 创建下载链接
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${currentViewReport.value.reportName}.doc`;
  
  // 触发下载
  document.body.appendChild(a);
  a.click();
  
  // 清理
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};

// 处理CSV特殊字符
const escapeCsvField = (field) => {
  if (typeof field !== 'string') {
    field = String(field);
  }
  // 如果字段包含逗号、引号或换行符，需要用引号包围并转义内部引号
  if (field.includes(',') || field.includes('"') || field.includes('\n') || field.includes('\r')) {
    return '"' + field.replace(/"/g, '""') + '"';
  }
  return field;
};

// 格式化日期，确保Excel能正确识别
const formatDateForExcel = (dateString) => {
  if (!dateString) return '';
  // 尝试解析日期
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    // 如果解析失败，返回原始字符串
    return dateString;
  }
  // 格式化日期为YYYY-MM-DD，确保Excel能正确识别
  return date.toISOString().split('T')[0];
};

// 导出Excel功能
const exportToExcel = () => {
  // 创建一个新的工作簿
  const reportData = currentViewReport.value;
  
  // 准备Excel数据
  let csvContent = "\ufeff";
  
  // 第一部分：报告基本信息
  csvContent += `检验报告,\n\n`;
  csvContent += `报告名称,${escapeCsvField(reportData.reportName)},\n`;
  csvContent += `检验单号,${escapeCsvField(reportData.reportCode)},\n`;
  csvContent += `创建日期,${escapeCsvField(formatDateForExcel(reportData.createDate))},\n`;
  csvContent += `状态,${escapeCsvField(reportData.status)},\n`;
  csvContent += `编制人,${escapeCsvField(reportData.author)},\n`;
  csvContent += `审批人,${escapeCsvField(reportData.approver || '未审批')},\n\n\n`;
  
  // 第二部分：检验基本信息表格
  if (reportData.originalInspectionData) {
    const originalData = reportData.originalInspectionData;
    csvContent += `检验基本信息,\n`;
    csvContent += `项目名称,项目值,\n`;
    csvContent += `产品名称,${escapeCsvField(originalData.materialName || '')},\n`;
    csvContent += `规格,${escapeCsvField(originalData.specification || '')},\n`;
    csvContent += `生产商,${escapeCsvField(originalData.manufacturer || '')},\n`;
    csvContent += `供应商,${escapeCsvField(originalData.supplier || '')},\n`;
    csvContent += `批号,${escapeCsvField(originalData.batchNumber || '')},\n`;
    csvContent += `厂家批号,${escapeCsvField(originalData.originalBatchNumber || '')},\n`;
    csvContent += `送检日期,${escapeCsvField(formatDateForExcel(originalData.deliveryDate))},\n`;
    csvContent += `检验数量,${escapeCsvField(originalData.inspectionQuantity || '')},\n`;
    csvContent += `样品数量,${escapeCsvField(originalData.sampleQuantity || '')},\n`;
    csvContent += `有效期,${escapeCsvField(formatDateForExcel(originalData.validUntil))},\n`;
    csvContent += `代理商,${escapeCsvField(originalData.agent || '')},\n`;
    csvContent += `生产日期,${escapeCsvField(formatDateForExcel(originalData.productionDate))},\n\n\n`;
  }
  
  // 第三部分：检验项目表格
  csvContent += `检验项目,\n`;
  csvContent += `序号,检验项目,检验标准,实际值,测量工具,关键项目,判定,\n`;
  
  if (reportData.originalInspectionData && reportData.originalInspectionData.inspectionItems) {
    reportData.originalInspectionData.inspectionItems.forEach((item, index) => {
      const result = item.result === '符合' ? '合格' : item.result === '不符合' ? '不合格' : '待检';
      csvContent += `${index + 1},`;
      csvContent += `${escapeCsvField(item.itemName || '')},`;
      csvContent += `${escapeCsvField(item.standard || '')},`;
      csvContent += `${escapeCsvField(item.actualValue || '')},`;
      csvContent += `${escapeCsvField(item.measurementTool || '')},`;
      csvContent += `${escapeCsvField(item.criticalItem || '否')},`;
      csvContent += `${escapeCsvField(result)},\n`;
    });
  }
  
  // 创建Blob对象
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // 创建下载链接
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${reportData.reportName}.csv`;
  
  // 触发下载
  document.body.appendChild(a);
  a.click();
  
  // 清理
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};

// 监听报告数据变化，确保显示最新数据
watch(
  () => reports.value.length,
  () => {
    refreshReports()
  }
)
</script>

<style scoped>
.report-management {
  max-width: 1200px;
  margin: 0 auto;
}

.report-table-container {
  padding: 20px;
  overflow-x: auto;
}

.report-table {
  font-size: 14px;
  width: 100%;
}

.report-table th {
  text-align: left;
  background-color: #f5f5f5;
  padding: 12px;
}

.report-table td {
  vertical-align: middle;
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Status styles for table */
.status {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: bold;
}

.status.草稿 {
  background-color: #ffc107;
  color: #fff;
}

.status.待审批 {
  background-color: #17a2b8;
  color: #fff;
}

.status.已审批 {
  background-color: #28a745;
  color: #fff;
}

.status.已保存 {
  background-color: #e3f2fd;
  color: #1976d2;
}

.status.已发布 {
  background-color: #fff3e0;
  color: #f57c00;
}

.status.已归档 {
  background-color: #f5f5f5;
  color: #616161;
}

/* Template preview styles */
.template-preview {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.template-header {
  text-align: center;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 2px solid #1890ff;
}

.template-header h2 {
  color: #1890ff;
  margin-bottom: 10px;
  font-size: 22px;
}

.inspection-order-no {
  text-align: left;
  font-weight: bold;
  font-size: 16px;
}

.template-section {
  margin-bottom: 25px;
  padding: 20px;
  background: #fafafa;
  border-radius: 6px;
}

.template-section h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 4px solid #1890ff;
}

.template-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.template-field {
  display: flex;
  align-items: center;
}

.template-field label {
  font-weight: 500;
  margin-right: 10px;
  min-width: 100px;
  color: #555;
}

.template-content {
  line-height: 1.6;
  white-space: pre-wrap;
}

.approval-section {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #ddd;
}

.approval-item {
  flex: 1;
  text-align: center;
}

.approval-label {
  font-weight: 500;
  margin-bottom: 10px;
  display: block;
}

.signature-line {
  border-bottom: 2px solid #999;
  width: 80%;
  margin: 0 auto;
  height: 30px;
}
</style>

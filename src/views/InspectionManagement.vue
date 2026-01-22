<template>
  <div class="inspection-report">


    <!-- 检验管理表单 -->
    <div class="inspection-form">
      <!-- 检验基本信息 -->
      <div class="info-row">
        <div class="info-item">
          <span class="info-label">检验日期:</span>
          <input type="date" v-model="reportData.inspectionDate" class="p-inputtext" />
        </div>
        <div class="info-item">
          <span class="info-label">送检日期:</span>
          <input type="date" v-model="reportData.deliveryDate" class="p-inputtext" />
        </div>
        <div class="info-item">
          <span class="info-label">检验单号:</span>
          <InputText v-model="reportData.inspectionNumber" placeholder="自动生成" readonly />
        </div>
        <div class="info-item">
          <span class="info-label">送检单号:</span>
          <InputText v-model="reportData.deliveryNumber" placeholder="自动生成" readonly />
        </div>
      </div>

      <!-- 物料基本信息 -->
      <div class="info-row">
        <div class="info-item">
          <span class="info-label">产品编码:</span>
          <InputText v-model="reportData.materialCode" placeholder="例如: 03E1-MY-BC" @change="handleMaterialCodeChange" />
        </div>
        <div class="info-item">
          <span class="info-label">产品名称:</span>
          <InputText v-model="reportData.materialName" placeholder="例如: 乙腈(色谱纯精丙酮)" />
        </div>
        <div class="info-item">
          <span class="info-label">批号:</span>
          <InputText v-model="reportData.batchNumber" placeholder="例如: 20260101" />
        </div>
        <div class="info-item">
          <span class="info-label">原厂批号:</span>
          <InputText v-model="reportData.originalBatchNumber" placeholder="例如: FB20260101" />
        </div>
      </div>

      <!-- 检验标准信息 -->
      <div class="info-row">
        <div class="info-item">
          <span class="info-label">标准编号:</span>
          <InputText v-model="reportData.standardCode" placeholder="例如: GB 7916-1987" />
        </div>
        <div class="info-item">
          <span class="info-label">生厂商:</span>
          <InputText v-model="reportData.manufacturer" placeholder="例如: 上海国际集团生化有限公司" />
        </div>
        <div class="info-item">
          <span class="info-label">代理商:</span>
          <InputText v-model="reportData.agent" placeholder="例如: 北京科技发展有限公司" />
        </div>
        <div class="info-item">
          <span class="info-label">检验部门:</span>
          <InputText v-model="reportData.inspectionDept" placeholder="例如: 质量控制部" />
        </div>
      </div>

      <!-- 物料规格信息 -->
      <div class="info-row">
        <div class="info-item">
          <span class="info-label">生产日期:</span>
          <input type="date" v-model="reportData.productionDate" class="p-inputtext" />
        </div>
        <div class="info-item">
          <span class="info-label">规格:</span>
          <InputText v-model="reportData.specification" placeholder="例如: 500ml" />
        </div>
        <div class="info-item">
          <span class="info-label">产品类型:</span>
          <select v-model="reportData.inspectionType">
            <option value="PC">包材PC</option>
            <option value="YL">原料YL</option>
            <option value="BC">半成品BC</option>
            <option value="CD">成品CD</option>
          </select>
        </div>

      </div>

      <!-- 检验数量信息 -->
      <div class="info-row">
        <div class="info-item">
          <span class="info-label">检验数量:</span>
          <InputText v-model="reportData.inspectionQuantity" placeholder="例如: 365.000000 KG" />
        </div>
        <div class="info-item">
          <span class="info-label">不合格数量:</span>
          <InputText v-model="reportData.unqualifiedQuantity" placeholder="例如: 0.000000" />
        </div>
        <div class="info-item">
          <span class="info-label">样品数量:</span>
          <InputText v-model="reportData.sampleQuantity" placeholder="例如: 3" type="number" />
        </div>
        <div class="info-item">
          <span class="info-label">有效期:</span>
          <input type="date" v-model="reportData.validUntil" class="p-inputtext" />
        </div>
      </div>

      <!-- 检验方式信息 -->
      <div class="info-row">
        <div class="info-item">
          <span class="info-label">检验方式:</span>
          <select v-model="reportData.inspectionMethod">
            <option value="抽样">抽样</option>
            <option value="全检">全检</option>
          </select>
        </div>
        <div class="info-item">
          <span class="info-label">检验状态:</span>
          <select v-model="reportData.inspectionStatus">
            <option value="已检验">已检验</option>
            <option value="待检验">待检验</option>
            <option value="检验中">检验中</option>
          </select>
        </div>
        <div class="info-item">
          <span class="info-label">不合格率:</span>
          <InputText v-model="reportData.unqualifiedRate" placeholder="例如: 0.000000 %" />
        </div>
        <div class="info-item">
          <span class="info-label">检验员:</span>
          <InputText v-model="reportData.inspector" placeholder="例如: 焦维菌" />
        </div>
      </div>
      
      <!-- 自定义字段区域 -->
      <div v-if="customFields.length > 0" class="info-row" style="border-top: 1px solid #ddd; padding-top: 15px; margin-top: 15px;">
        <div class="info-item" v-for="field in customFields" :key="field.id" :style="{ flex: '0 0 25%' }">
          <span class="info-label">{{ field.label }}:</span>
          <InputText 
            v-if="field.type === 'text' || field.type === 'number'" 
            v-model="reportData[field.id]" 
            :placeholder="`请输入${field.label}`" 
            :type="field.type" 
          />
          <input 
            v-else-if="field.type === 'date'" 
            v-model="reportData[field.id]" 
            type="date" 
            class="p-inputtext" 
          />
        </div>
      </div>

      <!-- 编辑专用字段区域 -->
      <div v-if="isEditing" class="info-row" style="border-top: 1px solid #ddd; padding-top: 15px; margin-top: 15px; background-color: #f5f9ff;">
        <h4 style="width: 100%; margin-bottom: 15px; color: #1976d2;">编辑专用选项</h4>
        <div class="info-item">
          <span class="info-label">检验状态:</span>
          <select v-model="reportData.inspectionStatus">
            <option value="待检验">待检验</option>
            <option value="检验中">检验中</option>
            <option value="已检验">已检验</option>
            <option value="已审核">已审核</option>
          </select>
        </div>
        <div class="info-item">
          <span class="info-label">检验结论:</span>
          <select v-model="reportData.conclusion">
            <option value="pass">合格</option>
            <option value="fail">不合格</option>
          </select>
        </div>
        <div class="info-item">
          <span class="info-label">不合格处理方式:</span>
          <select v-model="reportData.defectHandling">
            <option value="报废">报废</option>
            <option value="入库待处理">入库待处理</option>
            <option value="返工修检">返工修检</option>
            <option value="重检">重检</option>
          </select>
        </div>
        <div class="info-item">
          <span class="info-label">审核意见:</span>
          <InputText v-model="reportData.auditComments" placeholder="请输入审核意见" />
        </div>
      </div>
    </div>

    <!-- 检验项目表格 -->
    <div class="inspection-items-table">
      <table>
        <thead>
          <tr>
            <th>序号</th>
            <th>检验项目</th>
            <th>检验标准</th>
            <th>实际值</th>
            <th>检验结果</th>
            <th>不合格项</th>
            <th>检验记录号</th>
            <th>测量工具</th>
            <th>关键项目</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in reportData.inspectionItems" :key="index">
            <td>{{ index + 1 }}</td>
            <td><InputText v-model="item.itemName" placeholder="例如: 酸碱度" /></td>
            <td><InputText v-model="item.standard" placeholder="例如: 均匀溶液不准备：参考合格样本" /></td>
            <td><InputText v-model="item.actualValue" placeholder="例如: 5.98" /></td>
            <td>
              <select v-model="item.result">
                <option value="符合">符合</option>
                <option value="不符合">不符合</option>
              </select>
            </td>
            <td><InputText v-model="item.defectItem" placeholder="" /></td>
            <td><InputText v-model="item.recordNumber" placeholder="" /></td>
            <td><InputText v-model="item.measurementTool" placeholder="例如: pH试纸" /></td>
            <td>
              <select v-model="item.criticalItem">
                <option value="">否</option>
                <option value="是">是</option>
              </select>
            </td>
            <td><InputText v-model="item.remark" placeholder="" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 检验结论 -->
    <div class="inspection-conclusion">
      <div class="conclusion-section">
        <span class="section-title">检验结论：</span>
        <div class="result-options">
          <label><input type="radio" name="testResult" value="pass" v-model="reportData.conclusion" /> 合格</label>
          <label><input type="radio" name="testResult" value="fail" v-model="reportData.conclusion" /> 不合格</label>
        </div>
      </div>

      <div class="conclusion-section">
        <span class="section-title">不合格品处理：</span>
        <div class="defect-handling">
          <select v-model="reportData.defectHandling">
            <option value="报废">报废</option>
            <option value="入库待处理">入库待处理</option>
            <option value="返工修检">返工修检</option>
            <option value="重检">重检</option>
          </select>
        </div>
      </div>

      <div class="conclusion-section">
        <span class="section-title">处理不合格数量：</span>
        <div class="quantity-inputs">
          <div class="input-group">
            <label>报废:</label>
            <InputText v-model="reportData.handlingQuantities.scrap" type="number" />
          </div>
          <div class="input-group">
            <label>入库待处理:</label>
            <InputText v-model="reportData.handlingQuantities.stock" type="number" />
          </div>
          <div class="input-group">
            <label>返工修检:</label>
            <InputText v-model="reportData.handlingQuantities.rework" type="number" />
          </div>
          <div class="input-group">
            <label>重检:</label>
            <InputText v-model="reportData.handlingQuantities.reinspect" type="number" />
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <Button label="保存" icon="pi pi-save" class="p-mr-2" @click="saveReport" />
      <Button label="打印" icon="pi pi-print" class="p-mr-2" @click="printReport" />
      <Button label="导出" icon="pi pi-download" class="p-mr-2" @click="exportReport" />
      <Button label="添加检验项目" icon="pi pi-plus" class="p-mr-2" @click="addInspectionItem" />
      <Button label="关闭" icon="pi pi-times" @click="closeReport" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'

// 报告数据
// 获取当前日期
const currentDate = new Date().toISOString().split('T')[0]

const reportData = ref({
  // 基本信息
  inspectionDate: currentDate,
  deliveryDate: currentDate, // 新增：送检日期
  inspectionNumber: '',
  inspectionDept: '',
  deliveryNumber: '',
  
  // 物料基本信息
  materialCode: '',
  materialName: '',
  batchNumber: '', // 新增：批号
  originalBatchNumber: '', // 新增：原厂批号
  inspectionType: 'PC',
  standardCode: '企标', // 新增：标准编号（替代原检验标准）
  
  // 物料详细信息
  productionDate: '',
  specification: '',
  materialStatus: '合格',
  inspectionQuantity: '',
  unqualifiedQuantity: '',
  
  // 检验相关信息
  inspectionMethod: '抽样',
  inspectionStatus: '待检验',
  unqualifiedRate: '',
  
  // 其他信息
  sampleQuantity: '',
  inspector: '',
  manufacturer: '', // 新增：生厂商
  agent: '', // 新增：代理商
  
  // 附加信息
  validUntil: '', // 删除了：工作票号、批准部门、备注
  
  // 检验结论
  conclusion: 'pass',
  defectHandling: '报废',
  handlingQuantities: {
    scrap: 0,
    stock: 0,
    rework: 0,
    reinspect: 0
  },
  // 编辑专用字段
  auditComments: '',
  
  // 检验项目
  inspectionItems: [
    {
      itemName: '',
      standard: '',
      actualValue: '',
      result: '符合',
      defectItem: '',
      criticalDefect: '',
      majorDefect: '',
      minorDefect: '',
      recordNumber: '',
      previousItem: '',
      measurementTool: '',
      criticalItem: '',
      remark: '',
      deviceDiagram: ''
    }
  ]
})

// 从localStorage加载产品数据
const loadProductsFromStorage = () => {
  const savedProducts = localStorage.getItem('products')
  if (savedProducts) {
    return JSON.parse(savedProducts)
  } else {
    // 默认示例数据 - 与产品管理页面保持一致的产品类型
    return [
      {
        productCode: '03E1-MY-BC',
        productName: '乙腈(色谱纯精丙酮)',
        specification: '500ml',
        materialCharacteristics: '液体',
        productType: '原料',
        standardCode: '企标'
      },
      {
        productCode: '03E2-MY-BC',
        productName: '甲醇(分析纯)',
        specification: '1000ml',
        materialCharacteristics: '液体',
        productType: '原料',
        standardCode: '国标'
      },
      {
        productCode: '03E3-MY-BC',
        productName: '氯化钠(分析纯)',
        specification: '500g',
        materialCharacteristics: '固体',
        productType: '原料',
        standardCode: '行标'
      },
      {
        productCode: 'RM002',
        productName: '乙醇(工业级)',
        specification: '25L/桶',
        materialCharacteristics: '液体',
        productType: '原料',
        standardCode: '国标'
      }
    ]
  }
}

// 初始化产品数据（从产品管理页面共享）
const productDatabase = ref(loadProductsFromStorage())

// 模拟检验项目模板数据库
const inspectionItemTemplates = {
  '03E1-MY-BC': [
    {
      itemName: '酸碱度',
      standard: '均匀溶液不准备：参考合格样本',
      measurementTool: 'pH试纸',
      criticalItem: ''
    },
    {
      itemName: '密度',
      standard: '4.0±0.5',
      measurementTool: '密度量筒',
      criticalItem: ''
    },
    {
      itemName: '纯度',
      standard: '≥99.9%',
      measurementTool: '色谱仪',
      criticalItem: '是'
    }
  ],
  '03E2-MY-BC': [
    {
      itemName: '酸碱度',
      standard: '6.0-8.0',
      measurementTool: 'pH计',
      criticalItem: ''
    },
    {
      itemName: '水分含量',
      standard: '≤0.05%',
      measurementTool: '卡尔费休水分测定仪',
      criticalItem: '是'
    },
    {
      itemName: '蒸发残渣',
      standard: '≤0.001%',
      measurementTool: '电子天平',
      criticalItem: ''
    }
  ],
  '03E3-MY-BC': [
    {
      itemName: '纯度',
      standard: '≥99.5%',
      measurementTool: '滴定仪',
      criticalItem: '是'
    },
    {
      itemName: '重金属含量',
      standard: '≤0.0005%',
      measurementTool: '原子吸收光谱仪',
      criticalItem: '是'
    },
    {
      itemName: '水不溶物',
      standard: '≤0.005%',
      measurementTool: '过滤装置',
      criticalItem: ''
    }
  ],
  'RM002': [
    {
      itemName: '乙醇浓度',
      standard: '≥95%',
      measurementTool: '酒精计',
      criticalItem: '是'
    },
    {
      itemName: '酸碱度',
      standard: '6.0-8.0',
      measurementTool: 'pH计',
      criticalItem: ''
    },
    {
      itemName: '水分含量',
      standard: '≤0.5%',
      measurementTool: '卡尔费休水分测定仪',
      criticalItem: ''
    },
    {
      itemName: '外观',
      standard: '无色透明液体',
      measurementTool: '目视',
      criticalItem: ''
    }
  ]
}

// 刷新产品数据（确保获取最新的产品管理页面数据）
const refreshProductData = () => {
  productDatabase.value = loadProductsFromStorage()
}

// 处理物料编码变化
const handleMaterialCodeChange = () => {
  const materialCode = reportData.value.materialCode.trim()
  if (materialCode) {
    // 先刷新数据，确保获取最新的产品信息
    refreshProductData()
    autoFillProductData(materialCode)
    autoFillInspectionItems(materialCode)
  }
}

// 产品类型映射关系
const productTypeMapping = {
  '原料': 'YL',
  '半成品': 'BC',
  '成品': 'CD',
  '包材': 'PC'
}

// 自动填充产品数据
const autoFillProductData = (materialCode) => {
  const product = productDatabase.value.find(item => item.productCode === materialCode)
  if (product) {
    reportData.value.materialName = product.productName
    reportData.value.specification = product.specification || ''
    // 将产品管理页面的中文产品类型映射到检验管理页面的代码值
    reportData.value.inspectionType = productTypeMapping[product.productType] || 'PC'
    reportData.value.standardCode = product.standardCode || '企标'
    reportData.value.manufacturer = product.manufacturer || ''
    reportData.value.agent = product.agent || ''
    
    // 根据产品类型重新生成单号
    regenerateNumbers()
  }
}

// 自动填充检验项目数据
const autoFillInspectionItems = (materialCode) => {
  // 先尝试从产品管理页面的数据中获取检验项目
  const product = productDatabase.value.find(item => item.productCode === materialCode)
  if (product && product.inspectionItems && product.inspectionItems.length > 0) {
    // 转换产品管理页面的检验项目格式为检验报告需要的格式
    reportData.value.inspectionItems = product.inspectionItems.map(item => ({
      itemName: item.customItemName || `未知项目(${item.itemId})`,
      standard: item.standardRange || '',
      actualValue: '',
      result: '符合',
      defectItem: '',
      criticalDefect: '',
      majorDefect: '',
      minorDefect: '',
      recordNumber: '',
      previousItem: '',
      measurementTool: item.measurementTool || item.requiredEquipment || '',
      criticalItem: '',
      remark: '',
      deviceDiagram: ''
    }))
  } else {
    // 如果没有从产品管理页面获取到检验项目，使用默认模板
    const templates = inspectionItemTemplates[materialCode]
    if (templates) {
      reportData.value.inspectionItems = templates.map(template => ({
        ...template,
        actualValue: '',
        result: '符合',
        defectItem: '',
        criticalDefect: '',
        majorDefect: '',
        minorDefect: '',
        recordNumber: '',
        previousItem: '',
        remark: '',
        deviceDiagram: ''
      }))
    }
  }
}

// Methods
const addInspectionItem = () => {
  reportData.value.inspectionItems.push({
    itemName: '',
    standard: '',
    actualValue: '',
    result: '符合',
    defectItem: '',
    criticalDefect: '',
    majorDefect: '',
    minorDefect: '',
    recordNumber: '',
    previousItem: '',
    measurementTool: '',
    criticalItem: '',
    remark: '',
    deviceDiagram: ''
  })
}

// 静态字段列表 - 这些字段已经在模板中硬编码，不应作为自定义字段重复渲染
const staticFields = [
  'inspectionDate', // 检验日期
  'deliveryDate', // 送检日期
  'inspectionNumber', // 检验单号
  'deliveryNumber', // 送检单号
  'materialCode', // 产品编码
  'materialName', // 产品名称
  'batchNumber', // 批号
  'originalBatchNumber', // 原厂批号
  'productionDate', // 生产日期
  'standardCode', // 标准编号
  'manufacturer', // 生厂商
  'agent', // 代理商
  'inspectionDept', // 检验部门
  'specification', // 规格
  'inspectionType', // 产品类型
  'inspectionQuantity', // 检验数量
  'unqualifiedQuantity', // 不合格数量
  'sampleQuantity', // 样品数量
  'validUntil', // 有效期
  'inspectionMethod', // 检验方式
  'inspectionStatus', // 检验状态
  'unqualifiedRate', // 不合格率
  'inspector' // 检验员
]

// 从模板系统加载自定义字段配置 - 过滤掉静态字段
const loadCustomFieldsFromTemplate = () => {
  try {
    // 获取当前模板类型
    const inspectionTypeMap = {
      'PC': '包材',
      'YL': '原料',
      'BC': '半成品',
      'CD': '成品'
    }
    const templateName = inspectionTypeMap[reportData.value.inspectionType] || '原料'
    
    // 加载自定义字段
    const customFieldsKey = `customTemplateFields_${templateName}`
    const savedCustomFields = localStorage.getItem(customFieldsKey)
    
    if (savedCustomFields) {
      const allFields = JSON.parse(savedCustomFields)
      // 过滤掉静态字段，只保留真正的自定义字段
      return allFields.filter(field => !staticFields.includes(field.id))
    }
  } catch (error) {
    console.error('加载自定义字段配置失败:', error)
  }
  return []
}

// 保存检验数据到localStorage - 支持自定义字段
const saveInspectionReport = (report) => {
  // 获取已保存的报告
  const savedReports = JSON.parse(localStorage.getItem('inspectionReports') || '[]')
  
  let inspectionReport = null
  
  if (report.id) {
    // 如果报告有ID，说明是编辑现有报告
    const reportIndex = savedReports.findIndex(r => r.id === report.id)
    if (reportIndex > -1) {
      // 更新现有报告
      inspectionReport = {
        ...savedReports[reportIndex],
        ...report,
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0]
      }
      savedReports[reportIndex] = inspectionReport
    } else {
      // 如果找不到ID，创建新报告
      inspectionReport = createNewInspectionReport(report)
      savedReports.push(inspectionReport)
    }
  } else {
    // 没有ID，创建新报告
    inspectionReport = createNewInspectionReport(report)
    savedReports.push(inspectionReport)
  }
  
  // 保存回localStorage
  localStorage.setItem('inspectionReports', JSON.stringify(savedReports))
  
  return inspectionReport
}

// 创建新的检验报告
const createNewInspectionReport = (report) => {
  // 生成唯一ID
  const reportId = Date.now() + Math.floor(Math.random() * 1000)
  return {
    id: reportId,
    ...report,
    reportType: '检验报告',
    createDate: new Date().toISOString().split('T')[0],
    status: '已保存',
    author: report.inspector || '未知',
    summary: `${report.materialName}的检验报告`
  }
}

const saveReport = () => {
  // 保存报告数据
  console.log('保存报告:', reportData.value)
  
  // 保存到localStorage
  const savedReport = saveInspectionReport(reportData.value)
  
  // 保存成功提示
  alert(`检验报告已保存！报告ID: ${savedReport.id}`)
}

const printReport = () => {
  // 打印报告
  window.print()
}

const exportReport = () => {
  // 导出报告为JSON或其他格式
  const dataStr = JSON.stringify(reportData.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `检验报告_${reportData.value.inspectionNumber || '未命名'}.json`
  link.click()
  URL.revokeObjectURL(url)
  
  console.log('导出报告:', reportData.value)
}

// 格式化日期为YYYYMMDD格式
const formatDate = (dateString) => {
  if (!dateString) return ''
  return dateString.replace(/-/g, '')
}

// 自动生成检验单号（产品类型 + 日期 + 4位随机数）
const generateInspectionNumber = (productType = 'PC', date = currentDate) => {
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  const formattedDate = formatDate(date)
  return `${productType}${formattedDate}${random}`
}

// 自动生成送检单号（T + 日期 + 4位随机数）
const generateDeliveryNumber = (date = currentDate) => {
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  const formattedDate = formatDate(date)
  return `T${formattedDate}${random}`
}

// 重新生成单号
const regenerateNumbers = () => {
  reportData.value.inspectionNumber = generateInspectionNumber(
    reportData.value.inspectionType,
    reportData.value.inspectionDate
  )
  reportData.value.deliveryNumber = generateDeliveryNumber(reportData.value.deliveryDate)
}

// 加载要编辑的检验报告数据
const loadEditingReport = () => {
  const editingReport = localStorage.getItem('editingInspectionReport')
  if (editingReport) {
    const reportDataToEdit = JSON.parse(editingReport)
    // 设置报告数据
    Object.assign(reportData.value, reportDataToEdit)
    // 清除编辑标记
    localStorage.removeItem('editingInspectionReport')
    
    // 设置为编辑模式
    isEditing.value = true
    
    // 提示用户数据已加载
    alert('已加载检验报告数据，可以开始编辑')
  }
}

// 编辑模式状态
const isEditing = ref(false)

// 自定义字段配置
const customFields = ref([])

// 加载自定义字段到报告数据中
const loadCustomFieldsToReport = () => {
  const fields = loadCustomFieldsFromTemplate()
  customFields.value = fields
  
  // 确保报告数据中包含所有自定义字段
  fields.forEach(field => {
    if (reportData.value[field.id] === undefined) {
      reportData.value[field.id] = ''
    }
  })
}

// 组件加载时自动生成单号和检查是否有要编辑的数据
onMounted(() => {
  loadEditingReport()
  // 只有在新建报告时才自动生成单号，编辑现有报告时保留原有单号
  if (!reportData.value.id) {
    regenerateNumbers()
  }
  // 加载自定义字段
  loadCustomFieldsToReport()
})

// 监听日期或产品类型变化，重新生成单号
// 只有在新建报告时才自动生成单号，编辑现有报告时保留原有单号
watch(
  () => [reportData.value.inspectionDate, reportData.value.deliveryDate, reportData.value.inspectionType],
  () => {
    if (!reportData.value.id) {
      regenerateNumbers()
    }
  },
  { deep: true }
)

const closeReport = () => {
  // 关闭报告，可以添加确认逻辑
  if (confirm('确定要关闭报告吗？未保存的更改将丢失。')) {
    // 这里可以添加关闭逻辑，例如返回上一页
    console.log('关闭报告')
  }
}
</script>

<style scoped>
.inspection-report {
  width: 100%;
  margin: 0;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 0;
}

.report-title {
  text-align: center;
  margin-bottom: 30px;
}

.report-title h1 {
  color: #333;
  font-size: 24px;
  margin: 0;
  padding: 10px;
  border-bottom: 2px solid #4CAF50;
  display: inline-block;
}

.basic-info, .material-info, .inspection-form {
  margin-bottom: 30px;
  padding: 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.info-row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-item {
  flex: 0 0 25%;
  padding: 0 10px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

/* 根据项目数量调整宽度 */
.info-row:has(.info-item:nth-child(1):last-child) .info-item { /* 1个项目 */
  flex: 0 0 50%;
}

.info-row:has(.info-item:nth-child(2):last-child) .info-item { /* 2个项目 */
  flex: 0 0 50%;
}

.info-row:has(.info-item:nth-child(3):last-child) .info-item { /* 3个项目 */
  flex: 0 0 33.33%;
}

.info-row:has(.info-item:nth-child(4):last-child) .info-item { /* 4个项目 */
  flex: 0 0 25%;
}

.info-label {
  width: 100px;
  font-weight: bold;
  margin-right: 10px;
  color: #555;
}

.info-item input,
.info-item select {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.inspection-items-table {
  margin-bottom: 30px;
  overflow-x: auto;
}

.inspection-items-table table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ddd;
}

.inspection-items-table th,
.inspection-items-table td {
  padding: 8px 12px;
  border: 1px solid #ddd;
  text-align: center;
  vertical-align: middle;
}

/* 优化表格列宽 */
.inspection-items-table th:nth-child(1) { width: 5%; }      /* 序号 */
.inspection-items-table th:nth-child(2) { width: 15%; }     /* 检验项目 */
.inspection-items-table th:nth-child(3) { width: 20%; }     /* 检验标准 */
.inspection-items-table th:nth-child(4) { width: 10%; }     /* 实际值 */
.inspection-items-table th:nth-child(5) { width: 10%; }     /* 检验结果 */
.inspection-items-table th:nth-child(6) { width: 10%; }     /* 不合格项 */
.inspection-items-table th:nth-child(7) { width: 10%; }     /* 检验记录号 */
.inspection-items-table th:nth-child(8) { width: 10%; }     /* 测量工具 */
.inspection-items-table th:nth-child(9) { width: 8%; }      /* 关键项目 */
.inspection-items-table th:nth-child(10) { width: 12%; }    /* 备注 */

.inspection-items-table th {
  background-color: #4CAF50;
  color: white;
  font-weight: bold;
}

.inspection-items-table tr:nth-child(even) {
  background-color: #f2f2f2;
}

.inspection-items-table td input,
.inspection-items-table td select {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 14px;
  text-align: center;
  box-sizing: border-box;
}

.inspection-conclusion {
  margin-bottom: 30px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.conclusion-section {
  margin-bottom: 20px;
}

.conclusion-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-weight: bold;
  margin-right: 15px;
  color: #555;
}

.result-options {
  display: inline-block;
}

.result-options label {
  margin-right: 15px;
  cursor: pointer;
}

.defect-handling select {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.quantity-inputs {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-group label {
  font-weight: bold;
  color: #555;
}

.input-group input {
  width: 80px;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.action-buttons {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ddd;
}

.action-buttons button {
  margin-right: 10px;
  padding: 8px 16px;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .info-item {
    flex: 0 0 33.33%;
  }
}

@media (max-width: 992px) {
  .info-item {
    flex: 0 0 50%;
  }
}

@media (max-width: 768px) {
  .info-item {
    flex: 0 0 100%;
  }
  
  .quantity-inputs {
    flex-direction: column;
  }
}
</style>
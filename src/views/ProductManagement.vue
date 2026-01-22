<template>
  <Panel header="产品管理" class="product-management">
    <div class="toolbar">
      <div class="toolbar-left">
        <InputText v-model="searchQuery" placeholder="搜索产品..." class="p-mr-2" :style="{ maxWidth: '200px' }" />
        <select v-model="filterProductType" placeholder="筛选产品类型" class="p-inputtext p-mr-2" :style="{ width: '120px' }">
          <option value="">全部类型</option>
          <option v-for="type in productTypes" :key="type" :value="type">{{ type }}</option>
        </select>
        <select v-model="filterProductStatus" placeholder="筛选状态" class="p-inputtext" :style="{ width: '100px' }">
          <option value="">全部状态</option>
          <option v-for="status in productStatuses" :key="status" :value="status">{{ status }}</option>
        </select>
      </div>
      <div class="toolbar-right">
        <div style="position: relative; display: inline-block;">
          <button @click="toggleAddMenu" style="margin-right: 5px; padding: 5px 10px;">添加产品</button>
          <div v-if="showAddMenu" style="position: absolute; top: 100%; right: 0; background-color: white; border: 1px solid #ccc; padding: 5px 0; z-index: 1000;">
            <div @click="addProduct('原料'); showAddMenu = false" style="padding: 5px 15px; cursor: pointer;">添加原料</div>
            <div @click="addProduct('半成品'); showAddMenu = false" style="padding: 5px 15px; cursor: pointer;">添加半成品</div>
            <div @click="addProduct('成品'); showAddMenu = false" style="padding: 5px 15px; cursor: pointer;">添加成品</div>
            <div @click="addProduct('包材'); showAddMenu = false" style="padding: 5px 15px; cursor: pointer;">添加包材</div>
          </div>
        </div>
        <button @click="showImportDialog = true" style="padding: 5px 10px;">导入产品</button>
      </div>
    </div>

    <DataTable :value="filteredProducts" paginator :rows="10" responsiveLayout="scroll">
      <Column field="productCode" header="产品编码" />
      <Column field="productName" header="产品名称" />
      <Column field="productType" header="产品类型" />
      <Column field="specification" header="规格型号" />
      <Column field="unit" header="单位" />
      <Column field="status" header="状态" />
      <Column field="createDate" header="创建日期" />
      <Column field="description" header="描述" />
      <Column field="standardCode" header="标准编号" />
      <Column header="操作" style="text-align: center">
        <template #body="{ data }">
          <Button icon="pi pi-eye" @click="viewProduct(data)" class="p-mr-2" />
          <Button icon="pi pi-pencil" @click="editProduct(data)" class="p-mr-2" />
          <Button icon="pi pi-trash" @click="deleteProduct(data)" severity="danger" />
        </template>
      </Column>
    </DataTable>

    <!-- Add/Edit Dialog -->
    <Dialog :header="editMode ? '编辑产品' : '添加' + currentProduct.productType" v-model:visible="showAddDialog" @hide="closeDialog" :closable="true" :style="{ width: '1000px' }">
      <div class="p-fluid p-formgrid p-grid">
        <div class="p-field p-col-12 p-md-6">
          <label for="productCode">产品编码</label>
          <InputText id="productCode" v-model="currentProduct.productCode" required />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="productName">产品名称</label>
          <InputText id="productName" v-model="currentProduct.productName" required />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="productType">产品类型</label>
          <select id="productType" v-model="currentProduct.productType" class="p-inputtext" required>
            <option value="原料">原料</option>
            <option value="半成品">半成品</option>
            <option value="成品">成品</option>
            <option value="包材">包材</option>
          </select>
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="specification">规格型号</label>
          <InputText id="specification" v-model="currentProduct.specification" required />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="unit">单位</label>
          <InputText id="unit" v-model="currentProduct.unit" required />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="status">状态</label>
          <select id="status" v-model="currentProduct.status" class="p-inputtext" required>
            <option value="启用">启用</option>
            <option value="禁用">禁用</option>
          </select>
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="createDate">创建日期</label>
          <InputText id="createDate" v-model="currentProduct.createDate" type="date" required />
        </div>
        <div class="p-field p-col-12">
          <label for="description">描述</label>
          <Textarea id="description" v-model="currentProduct.description" rows="3" />
        </div>
        <div class="p-field p-col-12 p-md-6" v-if="currentProduct.productType === '原料'">
          <label for="supplier">供应商</label>
          <InputText id="supplier" v-model="currentProduct.supplier" />
        </div>
        <div class="p-field p-col-12 p-md-6" v-if="currentProduct.productType === '原料'">
          <label for="manufacturer">生产商</label>
          <InputText id="manufacturer" v-model="currentProduct.manufacturer" />
        </div>
        <div class="p-field p-col-12 p-md-6" v-if="currentProduct.productType === '原料'">
          <label for="agent">代理商</label>
          <InputText id="agent" v-model="currentProduct.agent" />
        </div>
        <div class="p-field p-col-12 p-md-6" v-if="currentProduct.productType === '成品'">
          <label for="barcode">条形码</label>
          <InputText id="barcode" v-model="currentProduct.barcode" />
        </div>
        <div class="p-field p-col-12 p-md-6" v-if="currentProduct.productType === '成品'">
          <label for="expiryDate">保质期(天)</label>
          <InputNumber id="expiryDate" v-model="currentProduct.expiryDate" :min="1" />
        </div>
        <div class="p-field p-col-12 p-md-6" v-if="currentProduct.productType === '包材'">
          <label for="material">材质</label>
          <InputText id="material" v-model="currentProduct.material" />
        </div>
        <div class="p-field p-col-12 p-md-6" v-if="currentProduct.productType === '包材'">
          <label for="size">尺寸</label>
          <InputText id="size" v-model="currentProduct.size" />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="standardCode">标准编号</label>
          <InputText id="standardCode" v-model="currentProduct.standardCode" placeholder="例如：GB 7916-1987" />
        </div>
        <div class="p-field p-col-12">
          <div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
            <label style="margin: 0;">关联检验项目及标准范围</label>
            <button 
              class="add-inspection-item-btn" 
              @click="addInspectionItemRow"
              title="添加检验项目"
            >
              + 添加检验项目
            </button>
          </div>
          <div class="table-container" style="border: 1px solid #ced4da; border-radius: 4px; overflow: hidden;">
            <table class="p-datatable p-component" style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr class="p-datatable-thead">
                  <th style="width: 250px; padding: 8px;">检验项目</th>
                  <th style="width: 240px; padding: 8px;">标准范围</th>
                  <th style="width: 80px; padding: 8px;">单位</th>
                  <th style="width: 150px; padding: 8px;">测量设备</th>
                  <th style="flex: 1; padding: 8px;">检验方法</th>
                  <th style="width: 60px; padding: 8px; text-align: center;">删除</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(productItem, index) in currentProduct.inspectionItems" :key="productItem.itemId || index" class="p-datatable-tbody">
                  <td style="padding: 8px;">
                    <input type="text" 
                           v-model="productItem.customItemName" 
                           @input="handleProductInspectionItemInput(productItem, $event)" 
                           @keypress="handleProductInspectionItemKeyPress($event, index)" 
                           placeholder="输入检验项目名称" 
                           class="p-inputtext" 
                           style="width: 100%;">
                  </td>
                  <td style="padding: 8px;">
                    <input type="text" 
                           v-model="productItem.standardRange" 
                           placeholder="标准范围" 
                           class="p-inputtext" 
                           style="width: 100%;">
                  </td>
                  <td style="padding: 8px;">
                    <input type="text" v-model="productItem.unit" placeholder="单位" class="p-inputtext" style="width: 100%;">
                  </td>
                  <td style="padding: 8px;">
                    <input type="text" 
                           v-model="productItem.measurementTool" 
                           placeholder="测量设备" 
                           class="p-inputtext" 
                           style="width: 100%;">
                  </td>
                  <td style="padding: 8px;">
                    <input type="text" 
                           v-model="productItem.testMethod" 
                           placeholder="检验方法" 
                           class="p-inputtext" 
                           style="width: 100%;">
                  </td>
                  <td style="padding: 8px; text-align: center;">
                    <button 
                      class="delete-inspection-item-btn" 
                      @click="deleteProductInspectionItem(index)"
                      title="删除检验项目"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <template #footer>
        <div>
          <Button label="取消" @click="showAddDialog = false" />
          <Button label="保存" @click="saveProduct" :disabled="!isFormValid" class="p-mr-2" />
        </div>
      </template>
    </Dialog>

    <!-- Import Dialog -->
    <Dialog header="导入产品" v-model:visible="showImportDialog" :closable="true" :style="{ width: '600px' }">
      <div class="p-fluid">
        <div class="p-field p-col-12">
          <label for="importFile">选择文件</label>
          <input type="file" id="importFile" ref="importFileInput" @change="handleFileSelect" accept=".xlsx,.xls,.csv" class="p-inputtext" style="width: 100%; margin-bottom: 10px;">
          <button @click="downloadCSVTemplate" style="padding: 5px 10px; background-color: #f0f0f0; border: 1px solid #ccc;">
            下载CSV模板
          </button>
        </div>
        <div class="p-field p-col-12">
          <div class="p-formgroup-inline">
            <div class="p-field-radiobutton">
              <input type="radio" id="newProducts" value="new" v-model="importOptions.mode">
              <label for="newProducts">仅导入新产品</label>
            </div>
            <div class="p-field-radiobutton p-ml-4">
              <input type="radio" id="updateExisting" value="update" v-model="importOptions.mode">
              <label for="updateExisting">更新现有产品</label>
            </div>
          </div>
        </div>
        <div class="p-field p-col-12">
          <input type="checkbox" id="importWithInspection" v-model="importOptions.importInspectionItems">
          <label for="importWithInspection" class="p-checkbox-label">导入检验项目数据</label>
        </div>
        <div class="p-field p-col-12" v-if="selectedFile">
          <p>已选择文件: {{ selectedFile.name }}</p>
          <p>文件大小: {{ (selectedFile.size / 1024).toFixed(2) }} KB</p>
        </div>
      </div>
      <template #footer>
        <div>
          <Button label="取消" @click="cancelImport" />
          <Button label="导入" @click="importProducts" :disabled="!selectedFile" class="p-mr-2" />
        </div>
      </template>
    </Dialog>
  </Panel>
</template>

<script setup>
import { ref, computed } from 'vue'

// Add menu state
const showAddMenu = ref(false)

// Toggle add menu
const toggleAddMenu = () => {
  showAddMenu.value = !showAddMenu.value
}

// 从localStorage加载检验项目数据或使用默认数据
const loadInspectionItems = () => {
  const savedItems = localStorage.getItem('inspectionItems')
  if (savedItems) {
    return JSON.parse(savedItems)
  }
  // 默认数据
  return [
    {
      id: 1,
      itemCode: 'IT001',
      itemName: 'pH值',
      itemType: '物理指标',
      applicableType: '所有产品',
      testMethod: 'GB/T 13531.1-2008',
      unit: 'pH',
      standardRange: '4.0-8.5',
      status: '启用',
      description: '产品酸碱度测定',
      equipment: 'pH计'
    },
    {
      id: 2,
      itemCode: 'IT002',
      itemName: '微生物',
      itemType: '微生物指标',
      applicableType: '所有产品',
      testMethod: '《化妆品安全技术规范》(2015年版)',
      unit: 'CFU/g',
      standardRange: '<100',
      status: '启用',
      description: '微生物总数测定',
      equipment: '微生物培养箱'
    },
    {
      id: 3,
      itemCode: 'IT003',
      itemName: '重金属（铅）',
      itemType: '安全指标',
      applicableType: '所有产品',
      testMethod: 'GB/T 13531.1-2008',
      unit: 'mg/kg',
      standardRange: '<10',
      status: '启用',
      description: '铅含量测定',
      equipment: '原子吸收光谱仪'
    },
    {
      id: 4,
      itemCode: 'IT004',
      itemName: '粘度',
      itemType: '物理指标',
      applicableType: '液体产品',
      testMethod: 'GB/T 13531.1-2008',
      unit: 'mPa·s',
      standardRange: '10000-50000',
      status: '启用',
      description: '产品粘度测定',
      equipment: '粘度计'
    },
    {
      id: 5,
      itemCode: 'IT005',
      itemName: '保湿效果',
      itemType: '功效指标',
      applicableType: '护肤品',
      testMethod: 'QB/T 4256-2011',
      unit: '%',
      standardRange: '≥15',
      status: '启用',
      description: '保湿功效测定',
      equipment: '皮肤水分测试仪'
    }
  ]
}

// 检验项目数据
const inspectionItems = ref(loadInspectionItems())



// 从localStorage加载产品数据
const loadProductsFromStorage = () => {
  const savedProducts = localStorage.getItem('products')
  if (savedProducts) {
    return JSON.parse(savedProducts)
  } else {
    // 默认示例数据
    return [
      {
        id: 1,
        productCode: 'RM001',
        productName: '水',
        productType: '原料',
        specification: '去离子水',
        unit: 'kg',
        status: '启用',
        createDate: '2023-01-01',
        description: '化妆品生产用水',
        standardCode: 'GB 7916-1987',
        inspectionItems: [
          { itemId: 1, standardRange: '5.5-7.5', unit: 'pH', testMethod: 'GB/T 13531.1-2008' },
          { itemId: 2, standardRange: '<100', unit: 'CFU/g', testMethod: '《化妆品安全技术规范》(2015年版)' },
          { itemId: 3, standardRange: '<10', unit: 'mg/kg', testMethod: 'GB/T 13531.1-2008' }
        ],
        supplier: '供应商A',
        manufacturer: '生产商A',
        agent: '代理商A'
      },
      {
        id: 2,
        productCode: 'RM002',
        productName: '甘油',
        productType: '原料',
        specification: 'USP级',
        unit: 'kg',
        status: '启用',
        createDate: '2023-01-01',
        description: '保湿剂',
        standardCode: 'QB/T 4256-2011',
        inspectionItems: [
          { itemId: 1, standardRange: '6.0-7.0', unit: 'pH', testMethod: 'GB/T 13531.1-2008' },
          { itemId: 2, standardRange: '<100', unit: 'CFU/g', testMethod: '《化妆品安全技术规范》(2015年版)' },
          { itemId: 3, standardRange: '<10', unit: 'mg/kg', testMethod: 'GB/T 13531.1-2008' },
          { itemId: 4, standardRange: '99.5-100', unit: '%', testMethod: 'GB/T 13531.1-2008' }
        ],
        supplier: '供应商B',
        manufacturer: '生产商B',
        agent: '代理商B'
      },
      {
        id: 3,
        productCode: 'SF001',
        productName: '面霜基料',
        productType: '半成品',
        specification: '面霜基础配方',
        unit: 'kg',
        status: '启用',
        createDate: '2023-01-01',
        description: '用于生产面霜的基础配料',
        standardCode: 'Q/ABC 001-2023',
        inspectionItems: [
          { itemId: 1, standardRange: '5.0-6.0', unit: 'pH', testMethod: 'GB/T 13531.1-2008' },
          { itemId: 2, standardRange: '<100', unit: 'CFU/g', testMethod: '《化妆品安全技术规范》(2015年版)' },
          { itemId: 3, standardRange: '<10', unit: 'mg/kg', testMethod: 'GB/T 13531.1-2008' },
          { itemId: 4, standardRange: '40-60', unit: '%', testMethod: 'GB/T 13531.1-2008' }
        ]
      },
      {
        id: 4,
        productCode: 'FP001',
        productName: '保湿面霜',
        productType: '成品',
        specification: '50g/瓶',
        unit: '瓶',
        status: '启用',
        createDate: '2023-01-05',
        description: '保湿护肤面霜',
        barcode: '6901234567890',
        expiryDate: 730,
        standardCode: 'QB/T 4256-2011',
        inspectionItems: [
          { itemId: 1, standardRange: '5.5-6.5', unit: 'pH', testMethod: 'GB/T 13531.1-2008' },
          { itemId: 2, standardRange: '<100', unit: 'CFU/g', testMethod: '《化妆品安全技术规范》(2015年版)' },
          { itemId: 3, standardRange: '<10', unit: 'mg/kg', testMethod: 'GB/T 13531.1-2008' },
          { itemId: 5, standardRange: '20-40', unit: '%', testMethod: 'QB/T 4256-2011' }
        ]
      }
    ]
  }
}

// 保存产品数据到localStorage
const saveProductsToStorage = (productsData) => {
  localStorage.setItem('products', JSON.stringify(productsData))
}

// 初始化产品数据
const products = ref(loadProductsFromStorage())

const searchQuery = ref('')
const filterProductType = ref('')
const filterProductStatus = ref('')
const showAddDialog = ref(false)
const showImportDialog = ref(false)
const editMode = ref(false)
const currentProduct = ref({})
const inspectionItemSearch = ref('')
const dynamicInspectionItems = ref([])
const importOptions = ref({
  mode: 'new', // 'new' or 'update'
  importInspectionItems: true
})
const selectedFile = ref(null)
const importFileInput = ref(null)
let nextDynamicItemId = 1000

const productTypes = ['原料', '半成品', '成品', '包材']
const productStatuses = ['启用', '禁用']

const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const matchesSearch = !searchQuery.value || 
      product.productCode.includes(searchQuery.value) ||
      product.productName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesType = !filterProductType.value || product.productType === filterProductType.value
    const matchesStatus = !filterProductStatus.value || product.status === filterProductStatus.value
    
    return matchesSearch && matchesType && matchesStatus
  })
})

// Combine original inspection items with dynamically added ones
const filteredInspectionItems = computed(() => {
  return [...inspectionItems.value, ...dynamicInspectionItems.value]
})

const isFormValid = computed(() => {
  return currentProduct.value.productCode &&
         currentProduct.value.productName &&
         currentProduct.value.productType &&
         currentProduct.value.specification &&
         currentProduct.value.unit &&
         currentProduct.value.status &&
         currentProduct.value.createDate
})

const addProduct = (type) => {
  editMode.value = false
  currentProduct.value = {
    productType: type,
    status: '启用',
    createDate: new Date().toISOString().split('T')[0],
    inspectionItems: []
  }
  showAddDialog.value = true
}

// Add new inspection item row on Enter key press
const handleInspectionItemKeyPress = (event, item) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    
    // Add a new dynamic inspection item row
    const newItem = {
      id: nextDynamicItemId++,
      itemCode: '',
      itemName: '',
      itemType: '自定义',
      applicableType: '所有产品',
      testMethod: '',
      unit: '',
      standardRange: '',
      status: '启用',
      description: '',
      equipment: ''
    }
    
    dynamicInspectionItems.value.push(newItem)
    
    // After adding, you might want to focus on the new input field
    // This would require using a ref or nextTick
  }
}

const viewProduct = (product) => {
  // 查看产品详情
  console.log('查看产品:', product)
}

const editProduct = (product) => {
  editMode.value = true
  currentProduct.value = { ...product }
  showAddDialog.value = true
}

const deleteProduct = (product) => {
  if (confirm(`确定要删除产品"${product.productName}"吗？`)) {
    const index = products.value.findIndex(p => p.id === product.id)
    if (index > -1) {
      products.value.splice(index, 1)
      // 保存到localStorage
      saveProductsToStorage(products.value)
    }
  }
}

const saveProduct = () => {
  // Clean up dynamic items array when saving
  dynamicInspectionItems.value = []
  nextDynamicItemId = 1000
  
  if (editMode.value) {
    const index = products.value.findIndex(p => p.id === currentProduct.value.id)
    if (index > -1) {
      products.value[index] = { ...currentProduct.value }
    }
  } else {
    currentProduct.value.id = products.value.length + 1
    products.value.push({ ...currentProduct.value })
  }
  
  // 保存到localStorage
  saveProductsToStorage(products.value)
  showAddDialog.value = false
}

// Handle file selection for import
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
  }
}

// Parse CSV file content
const parseCSV = (csvContent) => {
  const rows = csvContent.split('\n')
  const headers = rows[0].split(',').map(header => header.trim())
  const data = []
  
  for (let i = 1; i < rows.length; i++) {
    if (!rows[i].trim()) continue
    
    const values = rows[i].split(',').map(value => value.trim())
    const row = {}
    
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    
    data.push(row)
  }
  
  return data
}

// Import products from file
const importProducts = () => {
  if (!selectedFile.value) {
    alert('请选择要导入的文件')
    return
  }
  
  const reader = new FileReader()
  
  reader.onload = (e) => {
    try {
      const content = e.target.result
      let importedData = []
      
      // Simple CSV parsing
      if (selectedFile.value.name.endsWith('.csv')) {
        importedData = parseCSV(content)
      } else {
        // For Excel files, we would need a library like SheetJS
        alert('Excel文件导入功能需要额外的库支持，当前仅支持CSV格式')
        return
      }
      
      // Process imported data
      importedData.forEach(item => {
        // Map CSV columns to product structure
        const product = {
          productCode: item['产品编码'] || '',
          productName: item['产品名称'] || '',
          productType: item['产品类型'] || '原料',
          specification: item['规格型号'] || '',
          unit: item['单位'] || '',
          status: item['状态'] || '启用',
          createDate: item['创建日期'] || new Date().toISOString().split('T')[0],
          description: item['描述'] || '',
          standardCode: item['标准编号'] || '',
          inspectionItems: []
        }
        
        // Handle product-specific fields
        if (product.productType === '原料') {
          product.supplier = item['供应商'] || ''
          product.manufacturer = item['生产商'] || ''
          product.agent = item['代理商'] || ''
        } else if (product.productType === '成品') {
          product.barcode = item['条形码'] || ''
          product.expiryDate = parseInt(item['保质期(天)']) || 0
        } else if (product.productType === '包材') {
          product.material = item['材质'] || ''
          product.size = item['尺寸'] || ''
        }
        
        // Import inspection items if enabled
        if (importOptions.value.importInspectionItems && item['检验项目']) {
          // Simple parsing of inspection items (this would need to be enhanced for complex data)
          const inspectionItems = item['检验项目'].split(';')
          inspectionItems.forEach(inspectionItem => {
            if (inspectionItem.trim()) {
              // Find matching inspection item by name
              const matchingItem = inspectionItems.value.find(ii => 
                ii.itemName === inspectionItem.trim()
              )
              
              if (matchingItem) {
                product.inspectionItems.push({
                  itemId: matchingItem.id,
                  customItemName: matchingItem.itemName,
                  standardRange: matchingItem.standardRange,
                  unit: matchingItem.unit,
                  testMethod: matchingItem.testMethod
                })
              }
            }
          })
        }
        
        // Check if product exists
        const existingProductIndex = products.value.findIndex(p => 
          p.productCode === product.productCode
        )
        
        // Handle import mode
        if (importOptions.value.mode === 'new' && existingProductIndex === -1) {
          // Add new product
          product.id = products.value.length + 1
          products.value.push(product)
        } else if (importOptions.value.mode === 'update' && existingProductIndex !== -1) {
          // Update existing product
          const existingProduct = products.value[existingProductIndex]
          products.value[existingProductIndex] = { ...existingProduct, ...product }
        }
      })
      
      // 保存到localStorage
      saveProductsToStorage(products.value)
      alert('导入完成！')
      showImportDialog.value = false
      cancelImport()
    } catch (error) {
      console.error('导入失败:', error)
      alert('导入失败，请检查文件格式是否正确')
    }
  }
  
  reader.readAsText(selectedFile.value)
}

// Cancel import and clean up
const cancelImport = () => {
  selectedFile.value = null
  importOptions.value = {
    mode: 'new',
    importInspectionItems: true
  }
  if (importFileInput) {
    importFileInput.value.value = ''
  }
}

// Download CSV template
const downloadCSVTemplate = () => {
  // CSV headers
  const headers = [
    '产品编码',
    '产品名称',
    '产品类型',
    '规格型号',
    '单位',
    '状态',
    '创建日期',
    '描述',
    '标准编号',
    '供应商',
    '生产商',
    '代理商',
    '条形码',
    '保质期(天)',
    '材质',
    '尺寸',
    '检验项目'
  ]
  
  // Sample data for each product type
  const sampleData = [
    // 原料示例
    [
      'RM001',
      '去离子水',
      '原料',
      '纯度≥99.9%',
      'kg',
      '启用',
      '2023-01-01',
      '化妆品生产用水',
      'GB 7916-1987',
      '供应商A',
      '生产商A',
      '代理商A',
      '',
      '',
      '',
      '',
      'pH值;微生物;重金属（铅）'
    ],
    // 成品示例
    [
      'FP001',
      '保湿面霜',
      '成品',
      '50g/瓶',
      '瓶',
      '启用',
      '2023-01-05',
      '保湿护肤面霜',
      'QB/T 4256-2011',
      '',
      '',
      '',
      '6901234567890',
      '730',
      '',
      '',
      'pH值;微生物;重金属（铅）;保湿效果'
    ],
    // 包材示例
    [
      'PM001',
      '玻璃瓶',
      '包材',
      '50ml',
      '个',
      '启用',
      '2023-01-10',
      '化妆品包装用玻璃瓶',
      'GB/T 4544-1996',
      '',
      '',
      '',
      '',
      '',
      '玻璃',
      '50ml',
      ''
    ],
    // 半成品示例
    [
      'SF001',
      '面霜基料',
      '半成品',
      '面霜基础配方',
      'kg',
      '启用',
      '2023-01-15',
      '用于生产面霜的基础配料',
      'Q/ABC 001-2023',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      'pH值;微生物;重金属（铅）;固体含量'
    ]
  ]
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...sampleData.map(row => row.join(','))
  ].join('\n')
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', '产品导入模板.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}



const getInspectionItemName = (itemId) => {
  const item = inspectionItems.value.find(i => i.id === itemId)
  return item ? item.itemName : `未知项目(${itemId})`
}

const isInspectionItemSelected = (itemId) => {
  return currentProduct.value.inspectionItems && currentProduct.value.inspectionItems.some(item => item.itemId === itemId)
}

const toggleInspectionItem = (item) => {
  if (!currentProduct.value.inspectionItems) {
    currentProduct.value.inspectionItems = []
  }
  const existingItemIndex = currentProduct.value.inspectionItems.findIndex(pi => pi.itemId === item.id)
  if (existingItemIndex >= 0) {
    // 从产品检验项目列表中移除，即取消关联
    currentProduct.value.inspectionItems.splice(existingItemIndex, 1)
  } else {
    // 添加到产品检验项目列表中，即关联
    currentProduct.value.inspectionItems.push({
      itemId: item.id,
      customItemName: item.itemName,
      standardRange: item.standardRange || '',
      unit: item.unit || '',
      testMethod: item.testMethod || ''
    })
  }
}

// 添加检验项目行
const addInspectionItemRow = () => {
  if (!currentProduct.value.inspectionItems) {
    currentProduct.value.inspectionItems = []
  }
  
  // 添加新的检验项目行，包含测量设备字段
  currentProduct.value.inspectionItems.push({
    itemId: `custom_${Date.now()}`, // 使用时间戳生成唯一ID
    customItemName: '',
    standardRange: '',
    unit: '',
    measurementTool: '',
    testMethod: ''
  })
}

// 删除产品检验项目
const deleteProductInspectionItem = (index) => {
  if (currentProduct.value.inspectionItems && currentProduct.value.inspectionItems.length > index) {
    currentProduct.value.inspectionItems.splice(index, 1)
  }
}

// 处理产品检验项目输入
const handleProductInspectionItemInput = (productItem, event) => {
  const inputText = event.target.value.trim().toLowerCase()
  if (inputText.length < 1) return
  
  // Find matching inspection items
  const matchingItems = inspectionItems.value.filter(inspectionItem => 
    inspectionItem.itemName.toLowerCase().includes(inputText) ||
    inspectionItem.itemCode.toLowerCase().includes(inputText)
  )
  
  // If exactly one match is found, auto-fill the data
  if (matchingItems.length === 1) {
    const matchedItem = matchingItems[0]
    
    // 更新自定义项目名称为匹配的项目名称
    productItem.customItemName = matchedItem.itemName
    
    // 自动填充标准范围（处理两种数据格式：standardRange 或 minValue/maxValue）
    if (matchedItem.standardRange) {
      productItem.standardRange = matchedItem.standardRange
    } else if (matchedItem.minValue !== undefined && matchedItem.maxValue !== undefined) {
      productItem.standardRange = `${matchedItem.minValue}-${matchedItem.maxValue}`
    } else {
      productItem.standardRange = ''
    }
    
    // 自动填充单位、检验方法和测量设备
    productItem.unit = matchedItem.unit || ''
    productItem.testMethod = matchedItem.testMethod || ''
    productItem.measurementTool = matchedItem.equipment || ''
  }
}

// 处理产品检验项目回车键
const handleProductInspectionItemKeyPress = (event, index) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    // 添加新的检验项目行
    addInspectionItemRow()
  }
}

const getProductInspectionItem = (itemId) => {
  if (!currentProduct.value.inspectionItems) {
    currentProduct.value.inspectionItems = []
  }
  let productItem = currentProduct.value.inspectionItems.find(pi => pi.itemId === itemId)
  if (!productItem) {
    // 不再自动创建关联项，而是返回一个空对象，仅用于显示
    return {
      itemId: itemId,
      customItemName: '',
      standardRange: '',
      unit: '',
      testMethod: ''
    }
  } else {
    // Only fill customItemName for existing products if it's empty
    if (!productItem.customItemName && editMode.value) {
      const inspectionItem = inspectionItems.value.find(i => i.id === itemId)
      if (inspectionItem) {
        productItem.customItemName = inspectionItem.itemName
      }
    }
  }
  return productItem
}

// Handle inspection item name input for auto-fill
const handleInspectionItemInput = (item, event) => {
  const inputText = event.target.value.trim().toLowerCase()
  if (inputText.length < 1) return
  
  // Find matching inspection items
  const matchingItems = inspectionItems.value.filter(inspectionItem => 
    inspectionItem.itemName.toLowerCase().includes(inputText) ||
    inspectionItem.itemCode.toLowerCase().includes(inputText)
  )
  
  // If exactly one match is found, auto-fill the data
  if (matchingItems.length === 1) {
    const matchedItem = matchingItems[0]
    
    // 检查当前检验项目是否已关联
    const isSelected = isInspectionItemSelected(item.id)
    if (isSelected) {
      // 只有已关联的项目才自动填充数据
      const productItem = getProductInspectionItem(item.id)
      
      productItem.standardRange = matchedItem.standardRange || ''
      productItem.unit = matchedItem.unit || ''
      productItem.testMethod = matchedItem.testMethod || ''
      // Also update the customItemName to show the matched item name
      productItem.customItemName = matchedItem.itemName
    } else {
      // 未关联的项目，不自动填充数据，只更新输入框
      // 这里需要通过事件直接更新输入框的值，而不是修改产品检验项目
      event.target.value = matchedItem.itemName
    }
  }
}

// Fill inspection item data when clicking on item name
const fillInspectionItemData = (item) => {
  // 检查当前检验项目是否已关联
  const isSelected = isInspectionItemSelected(item.id)
  if (isSelected) {
    const productItem = getProductInspectionItem(item.id)
    
    productItem.standardRange = item.standardRange || ''
    productItem.unit = item.unit || ''
    productItem.testMethod = item.testMethod || ''
    productItem.customItemName = item.itemName
  }
}

// Handle inspection item search input
const handleInspectionItemSearch = (event) => {
  const searchText = event.target.value.trim().toLowerCase()
  if (searchText.length < 2) return
  
  // Find matching inspection items
  const matchingItems = inspectionItems.value.filter(item => 
    item.itemName.toLowerCase().includes(searchText) ||
    item.itemCode.toLowerCase().includes(searchText)
  )
  
  // If exactly one match is found, auto-fill it
  if (matchingItems.length === 1) {
    const matchedItem = matchingItems[0]
    fillInspectionItemData(matchedItem)
  } else if (matchingItems.length > 1) {
    // If multiple matches, you could add a selection dropdown here
    console.log('Multiple matches found:', matchingItems)
  }
}

const resetDialog = () => {
  editMode.value = false
  showAddDialog.value = false
  currentProduct.value = {
    standardCode: '',
    inspectionItems: [],
    supplier: '',
    manufacturer: '',
    agent: '',
    material: '',
    size: ''
  }
}

// Direct close function for dialog
const closeDialog = () => {
  showAddDialog.value = false
  resetDialog()
}
</script>

<style scoped>
.product-management {
  max-width: 1200px;
  margin: 0 auto;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

/* Ensure proper two-column layout in dialog */
.p-grid {
  display: flex !important;
  flex-wrap: wrap !important;
}

/* Make inspection item names clickable */
.p-datatable-tbody td:first-child {
  color: #007bff;
  text-decoration: underline;
  cursor: pointer;
}

.p-datatable-tbody td:first-child:hover {
  color: #0056b3;
  text-decoration: none;
}

.p-field {
  margin-bottom: 1rem !important;
}

.p-col-12 {
  width: 100% !important;
}

.p-md-6 {
  width: 50% !important;
  padding: 0 0.5rem !important;
}

/* 删除检验项目按钮样式 */
.delete-inspection-item-btn {
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s ease;
}

.delete-inspection-item-btn:hover {
  background-color: #ff7875;
  transform: scale(1.1);
}

.delete-inspection-item-btn:disabled {
  background-color: #ffcccc;
  cursor: not-allowed;
  transform: none;
}

/* 添加检验项目按钮样式 */
.add-inspection-item-btn {
  background-color: #52c41a;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-inspection-item-btn:hover {
  background-color: #73d13d;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .p-md-6 {
    width: 100% !important;
  }
}
</style>

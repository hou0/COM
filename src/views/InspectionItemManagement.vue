<template>
  <Panel header="检验项目管理" class="inspection-item-management">
    <div class="toolbar">
      <div class="toolbar-left">
        <InputText v-model="searchQuery" placeholder="搜索检验项目..." class="p-mr-2" :style="{ maxWidth: '200px' }" />
        <select v-model="filterItemType" placeholder="筛选项目类型" class="p-inputtext p-mr-2" :style="{ width: '120px' }">
          <option value="">全部类型</option>
          <option v-for="type in itemTypes" :key="type" :value="type">{{ type }}</option>
        </select>
        <select v-model="filterApplicableType" placeholder="适用产品类型" class="p-inputtext" :style="{ width: '120px' }">
          <option value="">全部产品类型</option>
          <option v-for="type in applicableTypes" :key="type" :value="type">{{ type }}</option>
        </select>
      </div>
      <div class="toolbar-right">
        <button @click="addNewItem" style="margin-right: 5px; padding: 5px 10px;">添加检验项目</button>
        <button @click="" style="margin-right: 5px; padding: 5px 10px;">导入项目</button>
        <button @click="" style="padding: 5px 10px;">导出项目</button>
      </div>
    </div>

    <DataTable :value="filteredItems" paginator :rows="10" responsiveLayout="scroll">
      <Column field="itemCode" header="项目编码" />
      <Column field="itemName" header="项目名称" />
      <Column field="itemType" header="项目类型" />
      <Column field="applicableType" header="适用产品类型" />
      <Column field="testMethod" header="检验方法" />
      <Column field="unit" header="单位" />
      <Column field="equipment" header="所需设备" />
      <Column field="status" header="状态" />
      <Column header="操作" style="text-align: center">
        <template #body="{ data }">
          <Button icon="pi pi-eye" @click="viewItem(data)" class="p-mr-2" />
          <Button icon="pi pi-pencil" @click="editItem(data)" class="p-mr-2" />
          <Button icon="pi pi-trash" @click="deleteItem(data)" severity="danger" />
        </template>
      </Column>
    </DataTable>

    <!-- Add/Edit Dialog -->
    <Dialog :header="editMode ? '编辑检验项目' : '添加检验项目'" v-model:visible="showAddDialog" @hide="resetDialog" :style="{ width: '700px' }">
      <div class="p-fluid p-formgrid p-grid">
        <div class="p-field p-col-12 p-md-6">
          <label for="itemCode">项目编码</label>
          <InputText id="itemCode" v-model="currentItem.itemCode" :disabled="true" />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="itemName">项目名称</label>
          <InputText id="itemName" v-model="currentItem.itemName" required />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="itemType">项目类型</label>
          <select id="itemType" v-model="currentItem.itemType" class="p-inputtext" required>
            <option v-for="type in itemTypes" :key="type" :value="type">{{ type }}</option>
          </select>
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="applicableType">适用产品类型</label>
          <select id="applicableType" v-model="currentItem.applicableType" class="p-inputtext" required>
            <option v-for="type in applicableTypes" :key="type" :value="type">{{ type }}</option>
          </select>
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="testMethod">检验方法</label>
          <InputText id="testMethod" v-model="currentItem.testMethod" required />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="unit">单位</label>
          <InputText id="unit" v-model="currentItem.unit" />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="status">状态</label>
          <select id="status" v-model="currentItem.status" class="p-inputtext" required>
            <option value="启用">启用</option>
            <option value="禁用">禁用</option>
          </select>
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="description">项目描述</label>
          <Textarea id="description" v-model="currentItem.description" rows="3" />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="equipment">所需设备</label>
          <InputText id="equipment" v-model="currentItem.equipment" />
        </div>
      </div>
      <template #footer>
        <div>
          <Button label="取消" @click="showAddDialog = false" />
          <Button label="保存" @click="saveItem" :disabled="!isFormValid" class="p-mr-2" />
        </div>
      </template>
    </Dialog>
  </Panel>
</template>

<script setup>
import { ref, computed } from 'vue'

// Load inspection items from localStorage or use default data
const loadInspectionItems = () => {
  const savedItems = localStorage.getItem('inspectionItems')
  if (savedItems) {
    return JSON.parse(savedItems)
  }
  // Default data
  return [
    {
      id: 1,
      itemCode: 'IT001',
      itemName: 'pH值',
      itemType: '物理指标',
      applicableType: '所有产品',
      testMethod: 'GB/T 13531.1-2008',
      unit: 'pH',
      minValue: 4.0,
      maxValue: 8.0,
      status: '启用',
      description: '测定产品的酸碱度',
      equipment: 'pH计'
    },
    {
      id: 2,
      itemCode: 'IT002',
      itemName: '微生物限度',
      itemType: '微生物指标',
      applicableType: '所有产品',
      testMethod: 'GB 4789.2-2016',
      unit: 'CFU/g',
      minValue: 0,
      maxValue: 100,
      status: '启用',
      description: '测定产品中的微生物数量',
      equipment: '培养箱'
    },
    {
      id: 3,
      itemCode: 'IT003',
      itemName: '重金属含量',
      itemType: '安全指标',
      applicableType: '所有产品',
      testMethod: 'GB/T 30799-2014',
      unit: 'mg/kg',
      minValue: 0,
      maxValue: 1,
      status: '启用',
      description: '测定产品中的重金属含量',
      equipment: '原子吸收光谱仪'
    },
    {
      id: 4,
      itemCode: 'IT004',
      itemName: '粘度',
      itemType: '物理指标',
      applicableType: '液体产品',
      testMethod: 'GB/T 22314-2008',
      unit: 'Pa·s',
      minValue: 0.1,
      maxValue: 100,
      status: '启用',
      description: '测定产品的粘度',
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
      minValue: 20,
      maxValue: 50,
      status: '启用',
      description: '保湿功效测定',
      equipment: '皮肤水分测试仪'
    }
  ]
}

// Save inspection items to localStorage
const saveInspectionItems = () => {
  localStorage.setItem('inspectionItems', JSON.stringify(inspectionItems.value))
}

// Inspection items data with persistence
const inspectionItems = ref(loadInspectionItems())

const searchQuery = ref('')
const filterItemType = ref('')
const filterApplicableType = ref('')
const showAddDialog = ref(false)
const editMode = ref(false)
const currentItem = ref({})

const itemTypes = ['物理指标', '化学指标', '微生物指标', '安全指标', '功效指标', '其他指标']
const applicableTypes = ['所有产品', '原料', '半成品', '成品', '护肤品', '化妆品', '液体产品', '固体产品']

const filteredItems = computed(() => {
  return inspectionItems.value.filter(item => {
    const matchesSearch = !searchQuery.value || 
      item.itemCode.includes(searchQuery.value) ||
      item.itemName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.testMethod?.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesType = !filterItemType.value || item.itemType === filterItemType.value
    const matchesApplicable = !filterApplicableType.value || item.applicableType === filterApplicableType.value
    
    return matchesSearch && matchesType && matchesApplicable
  })
})

const isFormValid = computed(() => {
  return currentItem.value.itemName &&
         currentItem.value.itemType &&
         currentItem.value.applicableType &&
         currentItem.value.testMethod &&
         currentItem.value.status
})

const viewItem = (item) => {
  // 查看项目详情
  console.log('查看检验项目:', item)
}

const editItem = (item) => {
  editMode.value = true
  currentItem.value = { ...item }
  showAddDialog.value = true
}

const deleteItem = (item) => {
  if (confirm(`确定要删除检验项目"${item.itemName}"吗？`)) {
    const index = inspectionItems.value.findIndex(i => i.id === item.id)
    if (index > -1) {
      inspectionItems.value.splice(index, 1)
      saveInspectionItems() // Save after deletion
    }
  }
}

const addNewItem = () => {
  resetDialog()
  showAddDialog.value = true
}

const saveItem = () => {
  if (editMode.value) {
    const index = inspectionItems.value.findIndex(i => i.id === currentItem.value.id)
    if (index > -1) {
      inspectionItems.value[index] = { ...currentItem.value }
    }
  } else {
    // 自动生成项目编号
    const maxCode = Math.max(...inspectionItems.value.map(item => {
      const codeNum = parseInt(item.itemCode.replace('IT', ''))
      return isNaN(codeNum) ? 0 : codeNum
    }))
    const nextNum = maxCode + 1
    currentItem.value.itemCode = `IT${nextNum.toString().padStart(3, '0')}`
    currentItem.value.id = inspectionItems.value.length + 1
    inspectionItems.value.push({ ...currentItem.value })
  }
  showAddDialog.value = false
  saveInspectionItems() // Save after adding/editing
}

const resetDialog = () => {
  editMode.value = false
  currentItem.value = {
    itemName: '',
    itemType: '',
    applicableType: '',
    testMethod: '',
    unit: '',
    minValue: null,
    maxValue: null,
    status: '启用',
    description: '',
    equipment: ''
  }
}
</script>

<style scoped>
.inspection-item-management {
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
</style>

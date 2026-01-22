<template>
  <Panel header="产品标准" class="product-standards">
    <div class="p-grid p-mb-4">
      <div class="p-col-12 p-md-4">
        <InputText v-model="searchQuery" placeholder="搜索产品标准..." class="p-w-full" />
      </div>
      <div class="p-col-12 p-md-4">
        <Button label="关联标准" icon="pi pi-link" @click="showLinkDialog = true" class="p-mr-2" />
      </div>
    </div>

    <DataTable :value="filteredProductStandards" paginator :rows="10" responsiveLayout="scroll">
      <Column field="productName" header="产品名称" />
      <Column field="productBatch" header="产品批次" />
      <Column field="standardName" header="标准名称" />
      <Column field="standardVersion" header="标准版本" />
      <Column field="effectiveDate" header="生效日期" />
      <Column field="status" header="状态" />
      <Column header="操作" style="text-align: center">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" @click="editProductStandard(data)" class="p-mr-2" />
          <Button icon="pi pi-trash" @click="deleteProductStandard(data)" severity="danger" />
        </template>
      </Column>
    </DataTable>

    <!-- Link Dialog -->
    <Dialog header="关联产品标准" v-model:visible="showLinkDialog" @hide="resetDialog">
      <div class="p-fluid p-formgrid p-grid">
        <div class="p-field p-col-12">
          <label for="product">产品</label>
          <select id="product" v-model="currentProductStandard.productId" class="p-inputtext p-w-full">
            <option value="">请选择产品</option>
            <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }} (批次: {{ product.batchNumber }})</option>
          </select>
        </div>
        <div class="p-field p-col-12">
          <label for="standard">标准</label>
          <select id="standard" v-model="currentProductStandard.standardId" class="p-inputtext p-w-full">
            <option value="">请选择标准</option>
            <option v-for="standard in standards" :key="standard.id" :value="standard.id">{{ standard.name }} (版本: {{ standard.version }})</option>
          </select>
        </div>
        <div class="p-field p-col-12">
          <label for="status">状态</label>
          <SelectButton :options="statusOptions" v-model="currentProductStandard.status" />
        </div>
      </div>
      <template #footer>
        <div>
          <Button label="取消" @click="showLinkDialog = false" />
          <Button label="关联" @click="linkStandard" class="p-mr-2" />
        </div>
      </template>
    </Dialog>
  </Panel>
</template>

<script setup>
import { ref, computed } from 'vue'

// Mock data for products and standards
const products = ref([
  { id: 1, name: '保湿面霜', batchNumber: '20230115001' },
  { id: 2, name: '美白精华', batchNumber: '20230220002' },
  { id: 3, name: '洗发水', batchNumber: '20230310003' }
])

const standards = ref([
  { id: 1, name: '化妆品安全技术规范', version: '2022版', effectiveDate: '2022-01-01' },
  { id: 2, name: '保湿化妆品保湿效果测试方法', version: '2021版', effectiveDate: '2021-06-01' },
  { id: 3, name: '防晒化妆品防晒效果测试方法', version: '2020版', effectiveDate: '2020-03-01' }
])

const productStandards = ref([
  { id: 1, productId: 1, productName: '保湿面霜', productBatch: '20230115001', standardId: 1, standardName: '化妆品安全技术规范', standardVersion: '2022版', effectiveDate: '2022-01-01', status: '有效' },
  { id: 2, productId: 1, productName: '保湿面霜', productBatch: '20230115001', standardId: 2, standardName: '保湿化妆品保湿效果测试方法', standardVersion: '2021版', effectiveDate: '2021-06-01', status: '有效' },
  { id: 3, productId: 2, productName: '美白精华', productBatch: '20230220002', standardId: 1, standardName: '化妆品安全技术规范', standardVersion: '2022版', effectiveDate: '2022-01-01', status: '有效' }
])

const searchQuery = ref('')
const showLinkDialog = ref(false)
const editMode = ref(false)
const currentProductStandard = ref({})

const statusOptions = [
  { label: '有效', value: '有效' },
  { label: '无效', value: '无效' }
]

const filteredProductStandards = computed(() => {
  if (!searchQuery.value) return productStandards.value
  return productStandards.value.filter(ps => 
    ps.productName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    ps.standardName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    ps.productBatch.includes(searchQuery.value)
  )
})

const editProductStandard = (productStandard) => {
  editMode.value = true
  currentProductStandard.value = { ...productStandard }
  showLinkDialog.value = true
}

const deleteProductStandard = (productStandard) => {
  if (confirm('确定要删除这个产品标准关联吗？')) {
    const index = productStandards.value.findIndex(ps => ps.id === productStandard.id)
    if (index > -1) {
      productStandards.value.splice(index, 1)
    }
  }
}

const linkStandard = () => {
  const product = products.value.find(p => p.id === currentProductStandard.value.productId)
  const standard = standards.value.find(s => s.id === currentProductStandard.value.standardId)
  
  if (product && standard) {
    const newProductStandard = {
      id: productStandards.value.length + 1,
      productId: product.id,
      productName: product.name,
      productBatch: product.batchNumber,
      standardId: standard.id,
      standardName: standard.name,
      standardVersion: standard.version,
      effectiveDate: standard.effectiveDate,
      status: currentProductStandard.value.status || '有效'
    }
    
    if (editMode.value) {
      const index = productStandards.value.findIndex(ps => ps.id === currentProductStandard.value.id)
      if (index > -1) {
        productStandards.value[index] = newProductStandard
      }
    } else {
      productStandards.value.push(newProductStandard)
    }
    
    showLinkDialog.value = false
  }
}

const resetDialog = () => {
  editMode.value = false
  currentProductStandard.value = {}
}
</script>

<style scoped>
.product-standards {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
<template>
  <Panel header="产品标准" class="product-standards">
    <div class="p-grid p-mb-4">
      <div class="p-col-12 p-md-4">
        <InputText v-model="searchQuery" placeholder="搜索产品标准..." class="p-w-full" />
      </div>
      <div class="p-col-12 p-md-4">
        <Button label="关联标准" icon="pi pi-link" @click="showLinkDialog = true" class="p-mr-2" />
      </div>
    </div>

    <DataTable :value="filteredProductStandards" paginator :rows="10" responsiveLayout="scroll">
      <Column field="productName" header="产品名称" />
      <Column field="productBatch" header="产品批次" />
      <Column field="standardName" header="标准名称" />
      <Column field="standardVersion" header="标准版本" />
      <Column field="effectiveDate" header="生效日期" />
      <Column field="status" header="状态" />
      <Column header="操作" style="text-align: center">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" @click="editProductStandard(data)" class="p-mr-2" />
          <Button icon="pi pi-trash" @click="deleteProductStandard(data)" severity="danger" />
        </template>
      </Column>
    </DataTable>

    <!-- Link Standard Dialog -->
    <Dialog header="关联产品标准" v-model:visible="showLinkDialog" @hide="resetDialog">
      <div class="p-fluid p-formgrid p-grid">
        <div class="p-field p-col-12">
          <label for="product">产品</label>
          <select id="product" v-model="currentProductStandard.productId" class="p-inputtext p-w-full">
            <option value="">请选择产品</option>
            <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }} (批次: {{ product.batchNumber }})</option>
          </select>
        </div>
        <div class="p-field p-col-12">
          <label for="standard">标准</label>
          <select id="standard" v-model="currentProductStandard.standardId" class="p-inputtext p-w-full">
            <option value="">请选择标准</option>
            <option v-for="standard in standards" :key="standard.id" :value="standard.id">{{ standard.name }} (版本: {{ standard.version }})</option>
          </select>
        </div>
        <div class="p-field p-col-12">
          <label for="status">状态</label>
          <SelectButton :options="statusOptions" v-model="currentProductStandard.status" />
        </div>
      </div>
      <template #footer>
        <div>
          <Button label="取消" @click="showLinkDialog = false" />
          <Button label="关联" @click="linkStandard" class="p-mr-2" />
        </div>
      </template>
    </Dialog>
  </Panel>
</template>

<script setup>
import { ref, computed } from 'vue'

// Mock data for products and standards
const products = ref([
  { id: 1, name: '保湿面霜', batchNumber: '20230115001' },
  { id: 2, name: '美白精华', batchNumber: '20230220002' },
  { id: 3, name: '洗发水', batchNumber: '20230310003' }
])

const standards = ref([
  { id: 1, name: '化妆品安全技术规范', version: '2022版', effectiveDate: '2022-01-01' },
  { id: 2, name: '保湿化妆品保湿效果测试方法', version: '2021版', effectiveDate: '2021-06-01' },
  { id: 3, name: '防晒化妆品防晒效果测试方法', version: '2020版', effectiveDate: '2020-03-01' }
])

const productStandards = ref([
  { id: 1, productId: 1, productName: '保湿面霜', productBatch: '20230115001', standardId: 1, standardName: '化妆品安全技术规范', standardVersion: '2022版', effectiveDate: '2022-01-01', status: '有效' },
  { id: 2, productId: 1, productName: '保湿面霜', productBatch: '20230115001', standardId: 2, standardName: '保湿化妆品保湿效果测试方法', standardVersion: '2021版', effectiveDate: '2021-06-01', status: '有效' },
  { id: 3, productId: 2, productName: '美白精华', productBatch: '20230220002', standardId: 1, standardName: '化妆品安全技术规范', standardVersion: '2022版', effectiveDate: '2022-01-01', status: '有效' }
])

const searchQuery = ref('')
const showLinkDialog = ref(false)
const editMode = ref(false)
const currentProductStandard = ref({})

const statusOptions = [
  { label: '有效', value: '有效' },
  { label: '无效', value: '无效' }
]

const filteredProductStandards = computed(() => {
  if (!searchQuery.value) return productStandards.value
  return productStandards.value.filter(ps => 
    ps.productName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    ps.standardName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    ps.productBatch.includes(searchQuery.value)
  )
})

const editProductStandard = (productStandard) => {
  editMode.value = true
  currentProductStandard.value = { ...productStandard }
  showLinkDialog.value = true
}

const deleteProductStandard = (productStandard) => {
  if (confirm('确定要删除这个产品标准关联吗？')) {
    const index = productStandards.value.findIndex(ps => ps.id === productStandard.id)
    if (index > -1) {
      productStandards.value.splice(index, 1)
    }
  }
}

const linkStandard = () => {
  const product = products.value.find(p => p.id === currentProductStandard.value.productId)
  const standard = standards.value.find(s => s.id === currentProductStandard.value.standardId)
  
  if (product && standard) {
    const newProductStandard = {
      id: productStandards.value.length + 1,
      productId: product.id,
      productName: product.name,
      productBatch: product.batchNumber,
      standardId: standard.id,
      standardName: standard.name,
      standardVersion: standard.version,
      effectiveDate: standard.effectiveDate,
      status: currentProductStandard.value.status || '有效'
    }
    
    if (editMode.value) {
      const index = productStandards.value.findIndex(ps => ps.id === currentProductStandard.value.id)
      if (index > -1) {
        productStandards.value[index] = newProductStandard
      }
    } else {
      productStandards.value.push(newProductStandard)
    }
    
    showLinkDialog.value = false
  }
}

const resetDialog = () => {
  editMode.value = false
  currentProductStandard.value = {}
}
</script>

<style scoped>
.product-standards {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
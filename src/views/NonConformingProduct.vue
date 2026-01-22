<template>
  <Panel header="不合格品管理" class="non-conforming-product">
    <Toolbar>
      <template #start>
        <InputText v-model="searchQuery" placeholder="搜索不合格品..." class="p-w-full p-mr-2" style="width: 300px" />
        <select v-model="filterSource" placeholder="筛选来源" class="p-inputtext p-mr-2" style="width: 150px">
          <option value="">全部</option>
          <option v-for="source in nonConformingSources" :key="source" :value="source">{{ source }}</option>
        </select>
      </template>
      <template #end>
        <Button label="添加不合格品记录" icon="pi pi-plus" @click="showAddDialog = true" class="p-mr-2" />
        <Button label="导入数据" icon="pi pi-upload" />
        <Button label="生成报表" icon="pi pi-chart-bar" />
      </template>
    </Toolbar>

    <DataTable :value="filteredNonConforming" paginator :rows="10" responsiveLayout="scroll">
      <Column field="productName" header="产品名称" />
      <Column field="batchNumber" header="批次号" />
      <Column field="source" header="不合格来源" />
      <Column field="nonConformingDate" header="发现日期" />
      <Column field="nonConformingReason" header="不合格原因" />
      <Column field="quantity" header="数量" />
      <Column field="disposalMethod" header="处理方式" />
      <Column field="disposalDate" header="处理日期" />
      <Column field="handler" header="处理人" />
      <Column header="操作" style="text-align: center">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" @click="editNonConforming(data)" class="p-mr-2" />
          <Button icon="pi pi-trash" @click="deleteNonConforming(data)" severity="danger" />
        </template>
      </Column>
    </DataTable>

    <!-- Add/Edit Dialog -->
    <Dialog :header="editMode ? '编辑不合格品记录' : '添加不合格品记录'" v-model:visible="showAddDialog" @hide="resetDialog" :style="{ width: '700px' }">
      <div class="p-fluid p-formgrid p-grid">
        <div class="p-field p-col-12 p-md-6">
          <label for="productName">产品名称</label>
          <InputText id="productName" v-model="currentNonConforming.productName" required />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="batchNumber">批次号</label>
          <InputText id="batchNumber" v-model="currentNonConforming.batchNumber" required />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="source">不合格来源</label>
          <select id="source" v-model="currentNonConforming.source" class="p-inputtext" required>
            <option value="">请选择不合格来源</option>
            <option v-for="source in nonConformingSources" :key="source" :value="source">{{ source }}</option>
          </select>
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="nonConformingDate">发现日期</label>
          <InputText id="nonConformingDate" v-model="currentNonConforming.nonConformingDate" type="date" required />
        </div>
        <div class="p-field p-col-12">
          <label for="nonConformingReason">不合格原因</label>
          <Textarea id="nonConformingReason" v-model="currentNonConforming.nonConformingReason" rows="3" required />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="quantity">数量</label>
          <InputNumber id="quantity" v-model="currentNonConforming.quantity" :min="1" required />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="unit">单位</label>
          <InputText id="unit" v-model="currentNonConforming.unit" required />
        </div>
        <div class="p-field p-col-12">
          <label for="disposalMethod">处理方式</label>
          <select id="disposalMethod" v-model="currentNonConforming.disposalMethod" class="p-inputtext">
            <option value="返工">返工</option>
            <option value="降级">降级</option>
            <option value="报废">报废</option>
            <option value="退货">退货</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="disposalDate">处理日期</label>
          <InputText id="disposalDate" v-model="currentNonConforming.disposalDate" type="date" />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="handler">处理人</label>
          <InputText id="handler" v-model="currentNonConforming.handler" />
        </div>
        <div class="p-field p-col-12">
          <label for="correctiveAction">纠正措施</label>
          <Textarea id="correctiveAction" v-model="currentNonConforming.correctiveAction" rows="3" />
        </div>
        <div class="p-field p-col-12">
          <label for="preventiveAction">预防措施</label>
          <Textarea id="preventiveAction" v-model="currentNonConforming.preventiveAction" rows="3" />
        </div>
        <div class="p-field p-col-12">
          <label for="remarks">备注</label>
          <Textarea id="remarks" v-model="currentNonConforming.remarks" rows="2" />
        </div>
      </div>
      <template #footer>
        <div>
          <Button label="取消" @click="showAddDialog = false" />
          <Button label="保存" @click="saveNonConforming" :disabled="!isFormValid" class="p-mr-2" />
        </div>
      </template>
    </Dialog>
  </Panel>
</template>

<script setup>
import { ref, computed } from 'vue'

const nonConformingProducts = ref([
  {
    id: 1,
    productName: '保湿面霜',
    batchNumber: '20230101001',
    source: '过程检验',
    nonConformingDate: '2023-01-05',
    nonConformingReason: '乳化不均匀',
    quantity: 50,
    unit: '瓶',
    disposalMethod: '返工',
    disposalDate: '2023-01-06',
    handler: '赵六',
    correctiveAction: '调整乳化工艺参数',
    preventiveAction: '加强过程监控',
    remarks: ''
  },
  {
    id: 2,
    productName: '美白精华',
    batchNumber: '20230102002',
    source: '原材料检验',
    nonConformingDate: '2023-01-02',
    nonConformingReason: '原料重金属超标',
    quantity: 100,
    unit: 'kg',
    disposalMethod: '退货',
    disposalDate: '2023-01-03',
    handler: '孙七',
    correctiveAction: '更换供应商',
    preventiveAction: '增加原料检验项目',
    remarks: ''
  },
  {
    id: 3,
    productName: '洗发水',
    batchNumber: '20230103003',
    source: '成品检验',
    nonConformingDate: '2023-01-12',
    nonConformingReason: 'pH值超标',
    quantity: 200,
    unit: '瓶',
    disposalMethod: '返工',
    disposalDate: '2023-01-13',
    handler: '周八',
    correctiveAction: '调整配方pH值',
    preventiveAction: '加强成品pH值检测',
    remarks: '已返工处理，重新检验合格'
  }
])

const searchQuery = ref('')
const filterSource = ref('')
const showAddDialog = ref(false)
const editMode = ref(false)
const currentNonConforming = ref({})

const nonConformingSources = ['原材料检验', '过程检验', '成品检验', '客户投诉', '市场抽查', '其他']

const filteredNonConforming = computed(() => {
  return nonConformingProducts.value.filter(item => {
    const matchesSearch = !searchQuery.value || 
      item.productName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.batchNumber.includes(searchQuery.value) ||
      item.nonConformingReason.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesSource = !filterSource.value || item.source === filterSource.value
    
    return matchesSearch && matchesSource
  })
})

const isFormValid = computed(() => {
  return currentNonConforming.value.productName &&
         currentNonConforming.value.batchNumber &&
         currentNonConforming.value.source &&
         currentNonConforming.value.nonConformingDate &&
         currentNonConforming.value.nonConformingReason &&
         currentNonConforming.value.quantity &&
         currentNonConforming.value.unit
})

const editNonConforming = (item) => {
  editMode.value = true
  currentNonConforming.value = { ...item }
  showAddDialog.value = true
}

const deleteNonConforming = (item) => {
  if (confirm('确定要删除这条不合格品记录吗？')) {
    const index = nonConformingProducts.value.findIndex(n => n.id === item.id)
    if (index > -1) {
      nonConformingProducts.value.splice(index, 1)
    }
  }
}

const saveNonConforming = () => {
  if (editMode.value) {
    const index = nonConformingProducts.value.findIndex(n => n.id === currentNonConforming.value.id)
    if (index > -1) {
      nonConformingProducts.value[index] = { ...currentNonConforming.value }
    }
  } else {
    currentNonConforming.value.id = nonConformingProducts.value.length + 1
    nonConformingProducts.value.push({ ...currentNonConforming.value })
  }
  showAddDialog.value = false
}

const resetDialog = () => {
  editMode.value = false
  currentNonConforming.value = {}
}
</script>

<style scoped>
.non-conforming-product {
  max-width: 1200px;
  margin: 0 auto;
}
</style>

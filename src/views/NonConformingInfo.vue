<template>
  <Panel header="不合格信息汇总" class="non-conforming">
    <div class="p-grid p-mb-4">
      <div class="p-col-12 p-md-4">
        <InputText v-model="searchQuery" placeholder="搜索不合格信息..." class="p-w-full" />
      </div>
      <div class="p-col-12 p-md-4">
        <Button label="导出报告" icon="pi pi-file-pdf" severity="warning" />
      </div>
    </div>

    <DataTable :value="filteredNonConforming" paginator :rows="10" responsiveLayout="scroll">
      <Column field="productName" header="产品名称" />
      <Column field="batchNumber" header="产品批次" />
      <Column field="inspectionItem" header="检验项目" />
      <Column field="testValue" header="检测值" />
      <Column field="standardValue" header="标准值" />
      <Column field="inspectionDate" header="检验日期" />
      <Column field="inspector" header="检验员" />
      <Column field="reason" header="不合格原因" />
      <Column field="disposal" header="处理措施" />
      <Column header="操作" style="text-align: center">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" @click="editNonConforming(data)" class="p-mr-2" />
        </template>
      </Column>
    </DataTable>

    <!-- Edit Dialog -->
    <Dialog header="编辑不合格信息" v-model:visible="showEditDialog" @hide="resetDialog">
      <div class="p-fluid p-formgrid p-grid">
        <div class="p-field p-col-12">
          <label for="productName">产品名称</label>
          <InputText id="productName" v-model="currentNonConforming.productName" disabled />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="batchNumber">产品批次</label>
          <InputText id="batchNumber" v-model="currentNonConforming.batchNumber" disabled />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="inspectionItem">检验项目</label>
          <InputText id="inspectionItem" v-model="currentNonConforming.inspectionItem" disabled />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="testValue">检测值</label>
          <InputNumber id="testValue" v-model="currentNonConforming.testValue" :min="0" disabled />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="standardValue">标准值</label>
          <InputText id="standardValue" v-model="currentNonConforming.standardValue" disabled />
        </div>
        <div class="p-field p-col-12">
          <label for="reason">不合格原因</label>
          <Textarea id="reason" v-model="currentNonConforming.reason" rows="3" />
        </div>
        <div class="p-field p-col-12">
          <label for="disposal">处理措施</label>
          <Textarea id="disposal" v-model="currentNonConforming.disposal" rows="3" />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="disposalDate">处理日期</label>
          <InputText id="disposalDate" v-model="currentNonConforming.disposalDate" placeholder="YYYY-MM-DD" />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="handler">处理人</label>
          <InputText id="handler" v-model="currentNonConforming.handler" />
        </div>
      </div>
      <template #footer>
        <div>
          <Button label="取消" @click="showEditDialog = false" />
          <Button label="保存" @click="saveNonConforming" class="p-mr-2" />
        </div>
      </template>
    </Dialog>
  </Panel>
</template>

<script setup>
import { ref, computed } from 'vue'

const nonConformingData = ref([
  {
    id: 1,
    productName: '保湿面霜',
    batchNumber: '20230115001',
    inspectionItem: '微生物',
    testValue: 150,
    standardValue: '<100',
    inspectionDate: '2023-01-20',
    inspector: '张三',
    reason: '',
    disposal: '',
    disposalDate: '',
    handler: ''
  },
  {
    id: 2,
    productName: '美白精华',
    batchNumber: '20230220002',
    inspectionItem: '重金属',
    testValue: 12,
    standardValue: '<10',
    inspectionDate: '2023-02-25',
    inspector: '李四',
    reason: '原材料问题',
    disposal: '已召回批次产品',
    disposalDate: '2023-02-28',
    handler: '王五'
  },
  {
    id: 3,
    productName: '洗发水',
    batchNumber: '20230310003',
    inspectionItem: 'pH值',
    testValue: 9.2,
    standardValue: '4.0-8.5',
    inspectionDate: '2023-03-15',
    inspector: '王五',
    reason: '生产工艺问题',
    disposal: '调整生产工艺',
    disposalDate: '2023-03-18',
    handler: '赵六'
  }
])

const searchQuery = ref('')
const showEditDialog = ref(false)
const currentNonConforming = ref({})

const filteredNonConforming = computed(() => {
  if (!searchQuery.value) return nonConformingData.value
  return nonConformingData.value.filter(data => 
    data.productName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    data.inspectionItem.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    data.batchNumber.includes(searchQuery.value) ||
    data.inspector.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const editNonConforming = (data) => {
  currentNonConforming.value = { ...data }
  showEditDialog.value = true
}

const saveNonConforming = () => {
  const index = nonConformingData.value.findIndex(d => d.id === currentNonConforming.value.id)
  if (index > -1) {
    nonConformingData.value[index] = { ...currentNonConforming.value }
  }
  showEditDialog.value = false
}

const resetDialog = () => {
  currentNonConforming.value = {}
}
</script>

<style scoped>
.non-conforming {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
<template>
  <Panel header="不合格信息汇总" class="non-conforming">
    <div class="p-grid p-mb-4">
      <div class="p-col-12 p-md-4">
        <InputText v-model="searchQuery" placeholder="搜索不合格信息..." class="p-w-full" />
      </div>
      <div class="p-col-12 p-md-4">
        <Button label="导出报告" icon="pi pi-file-pdf" severity="warning" />
      </div>
    </div>

    <DataTable :value="filteredNonConforming" paginator :rows="10" responsiveLayout="scroll">
      <Column field="productName" header="产品名称" />
      <Column field="batchNumber" header="产品批次" />
      <Column field="inspectionItem" header="检验项目" />
      <Column field="testValue" header="检测值" />
      <Column field="standardValue" header="标准值" />
      <Column field="inspectionDate" header="检验日期" />
      <Column field="inspector" header="检验员" />
      <Column field="reason" header="不合格原因" />
      <Column field="disposal" header="处理措施" />
      <Column header="操作" style="text-align: center">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" @click="editNonConforming(data)" class="p-mr-2" />
        </template>
      </Column>
    </DataTable>

    <!-- Edit Dialog -->
    <Dialog header="编辑不合格信息" v-model:visible="showEditDialog" @hide="resetDialog">
      <div class="p-fluid p-formgrid p-grid">
        <div class="p-field p-col-12">
          <label for="productName">产品名称</label>
          <InputText id="productName" v-model="currentNonConforming.productName" disabled />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="batchNumber">产品批次</label>
          <InputText id="batchNumber" v-model="currentNonConforming.batchNumber" disabled />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="inspectionItem">检验项目</label>
          <InputText id="inspectionItem" v-model="currentNonConforming.inspectionItem" disabled />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="testValue">检测值</label>
          <InputNumber id="testValue" v-model="currentNonConforming.testValue" :min="0" disabled />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="standardValue">标准值</label>
          <InputText id="standardValue" v-model="currentNonConforming.standardValue" disabled />
        </div>
        <div class="p-field p-col-12">
          <label for="reason">不合格原因</label>
          <Textarea id="reason" v-model="currentNonConforming.reason" rows="3" />
        </div>
        <div class="p-field p-col-12">
          <label for="disposal">处理措施</label>
          <Textarea id="disposal" v-model="currentNonConforming.disposal" rows="3" />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="disposalDate">处理日期</label>
          <InputText id="disposalDate" v-model="currentNonConforming.disposalDate" placeholder="YYYY-MM-DD" />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="handler">处理人</label>
          <InputText id="handler" v-model="currentNonConforming.handler" />
        </div>
      </div>
      <template #footer>
        <div>
          <Button label="取消" @click="showEditDialog = false" />
          <Button label="保存" @click="saveNonConforming" class="p-mr-2" />
        </div>
      </template>
    </Dialog>
  </Panel>
</template>

<script setup>
import { ref, computed } from 'vue'

const nonConformingData = ref([
  {
    id: 1,
    productName: '保湿面霜',
    batchNumber: '20230115001',
    inspectionItem: '微生物',
    testValue: 150,
    standardValue: '<100',
    inspectionDate: '2023-01-20',
    inspector: '张三',
    reason: '',
    disposal: '',
    disposalDate: '',
    handler: ''
  },
  {
    id: 2,
    productName: '美白精华',
    batchNumber: '20230220002',
    inspectionItem: '重金属',
    testValue: 12,
    standardValue: '<10',
    inspectionDate: '2023-02-25',
    inspector: '李四',
    reason: '原材料问题',
    disposal: '已召回批次产品',
    disposalDate: '2023-02-28',
    handler: '王五'
  },
  {
    id: 3,
    productName: '洗发水',
    batchNumber: '20230310003',
    inspectionItem: 'pH值',
    testValue: 9.2,
    standardValue: '4.0-8.5',
    inspectionDate: '2023-03-15',
    inspector: '王五',
    reason: '生产工艺问题',
    disposal: '调整生产工艺',
    disposalDate: '2023-03-18',
    handler: '赵六'
  }
])

const searchQuery = ref('')
const showEditDialog = ref(false)
const currentNonConforming = ref({})

const filteredNonConforming = computed(() => {
  if (!searchQuery.value) return nonConformingData.value
  return nonConformingData.value.filter(data => 
    data.productName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    data.inspectionItem.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    data.batchNumber.includes(searchQuery.value) ||
    data.inspector.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const editNonConforming = (data) => {
  currentNonConforming.value = { ...data }
  showEditDialog.value = true
}

const saveNonConforming = () => {
  const index = nonConformingData.value.findIndex(d => d.id === currentNonConforming.value.id)
  if (index > -1) {
    nonConformingData.value[index] = { ...currentNonConforming.value }
  }
  showEditDialog.value = false
}

const resetDialog = () => {
  currentNonConforming.value = {}
}
</script>

<style scoped>
.non-conforming {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
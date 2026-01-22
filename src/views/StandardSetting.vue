<template>
  <Panel header="标准制定" class="standard-setting">
    <div class="p-grid p-mb-4">
      <div class="p-col-12 p-md-4">
        <InputText v-model="searchQuery" placeholder="搜索标准..." class="p-w-full" />
      </div>
      <div class="p-col-12 p-md-4">
        <Button label="添加标准" icon="pi pi-plus" @click="showAddDialog = true" class="p-mr-2" />
        <Button label="导入" icon="pi pi-upload" />
      </div>
    </div>

    <DataTable :value="filteredStandards" paginator :rows="10" responsiveLayout="scroll">
      <Column field="id" header="标准ID" />
      <Column field="name" header="标准名称" />
      <Column field="type" header="标准类型" />
      <Column field="version" header="版本" />
      <Column field="effectiveDate" header="生效日期" />
      <Column field="status" header="状态" />
      <Column header="操作" style="text-align: center">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" @click="editStandard(data)" class="p-mr-2" />
          <Button icon="pi pi-trash" @click="deleteStandard(data)" severity="danger" />
        </template>
      </Column>
    </DataTable>

    <!-- Add/Edit Dialog -->
    <Dialog :header="editMode ? '编辑标准' : '添加标准'" v-model:visible="showAddDialog" @hide="resetDialog">
      <div class="p-fluid p-formgrid p-grid">
        <div class="p-field p-col-12">
          <label for="name">标准名称</label>
          <InputText id="name" v-model="currentStandard.name" />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="type">标准类型</label>
          <InputText id="type" v-model="currentStandard.type" />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="version">版本</label>
          <InputText id="version" v-model="currentStandard.version" />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="effectiveDate">生效日期</label>
          <InputText id="effectiveDate" v-model="currentStandard.effectiveDate" placeholder="YYYY-MM-DD" />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="status">状态</label>
          <SelectButton :options="statusOptions" v-model="currentStandard.status" />
        </div>
        <div class="p-field p-col-12">
          <label for="content">标准内容</label>
          <Textarea id="content" v-model="currentStandard.content" rows="5" />
        </div>
      </div>
      <template #footer>
        <div>
          <Button label="取消" @click="showAddDialog = false" />
          <Button label="保存" @click="saveStandard" class="p-mr-2" />
        </div>
      </template>
    </Dialog>
  </Panel>
</template>

<script setup>
import { ref, computed } from 'vue'

const standards = ref([
  { id: 1, name: '化妆品安全技术规范', type: '国家强制标准', version: '2022版', effectiveDate: '2022-01-01', status: '有效', content: '化妆品安全技术规范内容...' },
  { id: 2, name: '保湿化妆品保湿效果测试方法', type: '行业标准', version: '2021版', effectiveDate: '2021-06-01', status: '有效', content: '保湿效果测试方法内容...' },
  { id: 3, name: '防晒化妆品防晒效果测试方法', type: '行业标准', version: '2020版', effectiveDate: '2020-03-01', status: '有效', content: '防晒效果测试方法内容...' }
])

const searchQuery = ref('')
const showAddDialog = ref(false)
const editMode = ref(false)
const currentStandard = ref({})

const statusOptions = [
  { label: '有效', value: '有效' },
  { label: '无效', value: '无效' },
  { label: '草稿', value: '草稿' }
]

const filteredStandards = computed(() => {
  if (!searchQuery.value) return standards.value
  return standards.value.filter(standard => 
    standard.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    standard.type.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    standard.version.includes(searchQuery.value)
  )
})

const editStandard = (standard) => {
  editMode.value = true
  currentStandard.value = { ...standard }
  showAddDialog.value = true
}

const deleteStandard = (standard) => {
  if (confirm('确定要删除这个标准吗？')) {
    const index = standards.value.findIndex(s => s.id === standard.id)
    if (index > -1) {
      standards.value.splice(index, 1)
    }
  }
}

const saveStandard = () => {
  if (editMode.value) {
    const index = standards.value.findIndex(s => s.id === currentStandard.value.id)
    if (index > -1) {
      standards.value[index] = { ...currentStandard.value }
    }
  } else {
    currentStandard.value.id = standards.value.length + 1
    standards.value.push({ ...currentStandard.value })
  }
  showAddDialog.value = false
}

const resetDialog = () => {
  editMode.value = false
  currentStandard.value = {}
}
</script>

<style scoped>
.standard-setting {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
<template>
  <Panel header="标准制定" class="standard-setting">
    <div class="p-grid p-mb-4">
      <div class="p-col-12 p-md-4">
        <InputText v-model="searchQuery" placeholder="搜索标准..." class="p-w-full" />
      </div>
      <div class="p-col-12 p-md-4">
        <Button label="添加标准" icon="pi pi-plus" @click="showAddDialog = true" class="p-mr-2" />
        <Button label="导入" icon="pi pi-upload" />
      </div>
    </div>

    <DataTable :value="filteredStandards" paginator :rows="10" responsiveLayout="scroll">
      <Column field="id" header="标准ID" />
      <Column field="name" header="标准名称" />
      <Column field="type" header="标准类型" />
      <Column field="version" header="版本" />
      <Column field="effectiveDate" header="生效日期" />
      <Column field="status" header="状态" />
      <Column header="操作" style="text-align: center">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" @click="editStandard(data)" class="p-mr-2" />
          <Button icon="pi pi-trash" @click="deleteStandard(data)" severity="danger" />
        </template>
      </Column>
    </DataTable>

    <!-- Add/Edit Dialog -->
    <Dialog :header="editMode ? '编辑标准' : '添加标准'" v-model:visible="showAddDialog" @hide="resetDialog">
      <div class="p-fluid p-formgrid p-grid">
        <div class="p-field p-col-12">
          <label for="name">标准名称</label>
          <InputText id="name" v-model="currentStandard.name" />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="type">标准类型</label>
          <InputText id="type" v-model="currentStandard.type" />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="version">版本</label>
          <InputText id="version" v-model="currentStandard.version" />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="effectiveDate">生效日期</label>
          <InputText id="effectiveDate" v-model="currentStandard.effectiveDate" placeholder="YYYY-MM-DD" />
        </div>
        <div class="p-field p-col-12 p-md-6">
          <label for="status">状态</label>
          <SelectButton :options="statusOptions" v-model="currentStandard.status" />
        </div>
        <div class="p-field p-col-12">
          <label for="content">标准内容</label>
          <Textarea id="content" v-model="currentStandard.content" rows="5" />
        </div>
      </div>
      <template #footer>
        <div>
          <Button label="取消" @click="showAddDialog = false" />
          <Button label="保存" @click="saveStandard" class="p-mr-2" />
        </div>
      </template>
    </Dialog>
  </Panel>
</template>

<script setup>
import { ref, computed } from 'vue'

const standards = ref([
  { id: 1, name: '化妆品安全技术规范', type: '国家强制标准', version: '2022版', effectiveDate: '2022-01-01', status: '有效', content: '化妆品安全技术规范内容...' },
  { id: 2, name: '保湿化妆品保湿效果测试方法', type: '行业标准', version: '2021版', effectiveDate: '2021-06-01', status: '有效', content: '保湿效果测试方法内容...' },
  { id: 3, name: '防晒化妆品防晒效果测试方法', type: '行业标准', version: '2020版', effectiveDate: '2020-03-01', status: '有效', content: '防晒效果测试方法内容...' }
])

const searchQuery = ref('')
const showAddDialog = ref(false)
const editMode = ref(false)
const currentStandard = ref({})

const statusOptions = [
  { label: '有效', value: '有效' },
  { label: '无效', value: '无效' },
  { label: '草稿', value: '草稿' }
]

const filteredStandards = computed(() => {
  if (!searchQuery.value) return standards.value
  return standards.value.filter(standard => 
    standard.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    standard.type.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    standard.version.includes(searchQuery.value)
  )
})

const editStandard = (standard) => {
  editMode.value = true
  currentStandard.value = { ...standard }
  showAddDialog.value = true
}

const deleteStandard = (standard) => {
  if (confirm('确定要删除这个标准吗？')) {
    const index = standards.value.findIndex(s => s.id === standard.id)
    if (index > -1) {
      standards.value.splice(index, 1)
    }
  }
}

const saveStandard = () => {
  if (editMode.value) {
    const index = standards.value.findIndex(s => s.id === currentStandard.value.id)
    if (index > -1) {
      standards.value[index] = { ...currentStandard.value }
    }
  } else {
    currentStandard.value.id = standards.value.length + 1
    standards.value.push({ ...currentStandard.value })
  }
  showAddDialog.value = false
}

const resetDialog = () => {
  editMode.value = false
  currentStandard.value = {}
}
</script>

<style scoped>
.standard-setting {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
<template>
  <div class="app-container">
    <Menubar :model="menuItems" />
    <div class="main-content">
      <router-view />
    </div>
    <Toast :position="'bottom-right'" :life="3000" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Toast from 'primevue/toast'

const router = useRouter()

const menuItems = [
  {
    label: '产品管理',
    icon: 'pi pi-box',
    command: () => router.push('/')
  },
  {
    label: '检验项目管理',
    icon: 'pi pi-list',
    command: () => router.push('/inspection-items')
  },
  {
      label: '检验管理',
      icon: 'pi pi-check-square',
      command: () => router.push('/inspection-management')
    },

    {
      label: '不合格品管理',
      icon: 'pi pi-exclamation-circle',
      command: () => router.push('/non-conforming')
    },
  {
    label: '报告管理',
    icon: 'pi pi-file-pdf',
    command: () => router.push('/report-management')
  },
  {
    label: '检验报告模板系统',
    icon: 'pi pi-file-alt',
    command: () => router.push('/inspection-report-template')
  },
  {
    label: '质量分析',
    icon: 'pi pi-chart-line',
    command: () => router.push('/quality-analysis')
  }
]
</script>

<style>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 2rem;
  background-color: #f5f5f5;
}

.p-menubar {
  background-color: #2c3e50 !important;
  color: white !important;
}

.p-menubar .p-menuitem-text {
  color: white !important;
}
</style>

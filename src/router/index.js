import { createRouter, createWebHistory } from 'vue-router'
import ProductManagement from '../views/ProductManagement.vue'
import InspectionItemManagement from '../views/InspectionItemManagement.vue'
import InspectionManagement from '../views/InspectionManagement.vue'

import NonConformingProduct from '../views/NonConformingProduct.vue'
import ReportManagement from '../views/ReportManagement.vue'
import QualityAnalysis from '../views/QualityAnalysis.vue'
import InspectionReportTemplate from '../components/InspectionReportTemplate.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'product-management',
      component: ProductManagement
    },
    {
      path: '/inspection-items',
      name: 'inspection-items',
      component: InspectionItemManagement
    },
    {
      path: '/inspection-management',
      name: 'inspection-management',
      component: InspectionManagement
    },

    {
      path: '/non-conforming',
      name: 'non-conforming',
      component: NonConformingProduct
    },
    {
      path: '/report-management',
      name: 'report-management',
      component: ReportManagement
    },

    {
      path: '/quality-analysis',
      name: 'quality-analysis',
      component: QualityAnalysis
    },
    {
      path: '/inspection-report-template',
      name: 'inspection-report-template',
      component: InspectionReportTemplate
    }
  ]
})

export default router

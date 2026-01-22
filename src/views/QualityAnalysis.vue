<template>
  <Panel header="质量分析" class="quality-analysis">
    <Toolbar>
      <template #start>
        <select v-model="analysisType" placeholder="选择分析类型" class="p-inputtext p-mr-2" style="width: 180px">
          <option v-for="type in analysisTypes" :key="type" :value="type">{{ type }}</option>
        </select>
        <select v-model="filterProduct" placeholder="筛选产品" class="p-inputtext p-mr-2" style="width: 180px">
          <option value="">全部产品</option>
          <option v-for="product in productNames" :key="product" :value="product">{{ product }}</option>
        </select>
        <select v-model="filterPeriod" placeholder="时间范围" class="p-inputtext p-mr-2" style="width: 150px">
          <option v-for="period in timePeriods" :key="period" :value="period">{{ period }}</option>
        </select>
        <Button label="刷新数据" icon="pi pi-refresh" @click="refreshAnalysis" />
      </template>
      <template #end>
        <Button label="导出分析报告" icon="pi pi-download" @click="exportReport" class="p-mr-2" />
        <Button label="保存分析" icon="pi pi-save" @click="saveAnalysis" />
      </template>
    </Toolbar>

    <!-- 质量指标概览 -->
    <div class="metrics-grid">
      <Card class="metric-card">
        <div class="metric-content">
          <div class="metric-icon quality-rate">
            <i class="pi pi-check-circle"></i>
          </div>
          <div class="metric-info">
            <h3>产品合格率</h3>
            <div class="metric-value">{{ qualityRate }}%</div>
            <div class="metric-trend positive">+2.5% 较上月</div>
          </div>
        </div>
      </Card>
      <Card class="metric-card">
        <div class="metric-content">
          <div class="metric-icon non-conforming">
            <i class="pi pi-exclamation-circle"></i>
          </div>
          <div class="metric-info">
            <h3>不合格品率</h3>
            <div class="metric-value">{{ nonConformingRate }}%</div>
            <div class="metric-trend negative">-1.2% 较上月</div>
          </div>
        </div>
      </Card>
      <Card class="metric-card">
        <div class="metric-content">
          <div class="metric-icon inspection-count">
            <i class="pi pi-chart-bar"></i>
          </div>
          <div class="metric-info">
            <h3>检验批次</h3>
            <div class="metric-value">{{ inspectionCount }}</div>
            <div class="metric-trend positive">+15 较上月</div>
          </div>
        </div>
      </Card>
      <Card class="metric-card">
        <div class="metric-content">
          <div class="metric-icon customer-complaint">
            <i class="pi pi-comments"></i>
          </div>
          <div class="metric-info">
            <h3>客户投诉</h3>
            <div class="metric-value">{{ customerComplaint }}</div>
            <div class="metric-trend positive">-3 较上月</div>
          </div>
        </div>
      </Card>
    </div>

    <Divider />

    <!-- 分析内容 -->
    <div class="analysis-content">
      <div v-if="analysisType === '不合格品分析'">
        <h3>不合格品原因分析</h3>
        <DataTable :value="nonConformingAnalysis" responsiveLayout="scroll">
          <Column field="reason" header="不合格原因" />
          <Column field="count" header="数量" />
          <Column field="percentage" header="占比" />
          <Column field="source" header="来源" />
        </DataTable>
      </div>

      <div v-else-if="analysisType === '产品质量趋势'">
        <h3>产品质量趋势分析</h3>
        <div class="trend-chart">
          <canvas ref="qualityTrendChart" width="800" height="400"></canvas>
        </div>
      </div>

      <div v-else-if="analysisType === '检验项目分析'">
        <h3>检验项目合格率分析</h3>
        <DataTable :value="inspectionItemAnalysis" responsiveLayout="scroll">
          <Column field="item" header="检验项目" />
          <Column field="qualifiedCount" header="合格次数" />
          <Column field="totalCount" header="总次数" />
          <Column field="qualifiedRate" header="合格率" />
        </DataTable>
      </div>

      <div v-else-if="analysisType === '供应商质量分析'">
        <h3>供应商质量分析</h3>
        <DataTable :value="supplierAnalysis" responsiveLayout="scroll">
          <Column field="supplier" header="供应商" />
          <Column field="supplyCount" header="供货次数" />
          <Column field="qualifiedCount" header="合格次数" />
          <Column field="qualifiedRate" header="合格率" />
          <Column field="nonConformingCount" header="不合格次数" />
        </DataTable>
      </div>

      <div v-else>
        <h3>综合质量分析</h3>
        <div class="comprehensive-analysis">
          <p>本系统提供了全面的质量分析功能，您可以选择不同的分析类型查看详细数据。</p>
          <p>通过质量分析，您可以：</p>
          <ul>
            <li>了解产品质量趋势，及时发现质量问题</li>
            <li>分析不合格品原因，采取针对性改进措施</li>
            <li>评估供应商质量，优化供应链管理</li>
            <li>监控检验项目合格率，提高检验效率</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 分析结论与建议 -->
    <div class="analysis-conclusion">
      <Card>
        <template #header>
          <h3>分析结论与建议</h3>
        </template>
        <div class="conclusion-content">
          <div class="conclusion-section">
            <h4>分析结论</h4>
            <p>{{ analysisConclusion }}</p>
          </div>
          <div class="conclusion-section">
            <h4>改进建议</h4>
            <ul>
              <li v-for="(suggestion, index) in improvementSuggestions" :key="index">{{ suggestion }}</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  </Panel>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'

// 状态定义
const analysisType = ref('不合格品分析')
const filterProduct = ref('')
const filterPeriod = ref('近6个月')
const qualityTrendChart = ref(null)
let chartInstance = null

const analysisTypes = ['不合格品分析', '产品质量趋势', '检验项目分析', '供应商质量分析', '综合分析']
const timePeriods = ['本周', '本月', '近3个月', '近6个月', '本年', '自定义']

// 从localStorage加载检验报告数据
const loadInspectionReports = () => {
  // 检查localStorage中是否有数据
  const savedReports = localStorage.getItem('inspectionReports')
  if (savedReports) {
    return JSON.parse(savedReports)
  } else {
    // 如果没有数据，创建一些示例数据
    const defaultReports = [
      {
        id: 1,
        reportName: '测试检验报告1',
        reportCode: 'TESTQ1234',
        reportType: '检验报告',
        productName: '测试产品1',
        batchNumber: 'TEST20260120',
        createDate: '2026-01-01',
        status: '已审批',
        author: '测试用户',
        approver: '审批人',
        summary: '测试检验报告',
        reportContent: '测试内容',
        originalInspectionData: {
          id: 1,
          inspectionDate: '2026-01-01',
          deliveryDate: '2026-01-01',
          inspectionNumber: 'TESTQ1234',
          deliveryNumber: 'T1234',
          materialCode: 'TEST001',
          materialName: '测试产品1',
          batchNumber: 'TEST20260120',
          originalBatchNumber: 'ORIG20260120',
          inspectionType: 'PC',
          standardCode: '企标',
          specification: '测试规格',
          inspectionMethod: '抽样',
          inspectionStatus: '已检验',
          unqualifiedRate: '0.00%',
          sampleQuantity: '3',
          inspector: '测试用户',
          manufacturer: '测试厂商',
          agent: '测试代理商',
          validUntil: '2026-12-31',
          conclusion: 'pass',
          defectHandling: '合格',
          handlingQuantities: {
            scrap: 0,
            stock: 0,
            rework: 0,
            reinspect: 0
          },
          inspectionItems: [
            {
              itemName: 'pH值',
              standard: '5.5-7.5',
              actualValue: '6.5',
              result: '符合',
              defectItem: '',
              recordNumber: '',
              measurementTool: 'pH计',
              criticalItem: '是',
              remark: ''
            },
            {
              itemName: '微生物',
              standard: '<100 CFU/g',
              actualValue: '50',
              result: '符合',
              defectItem: '',
              recordNumber: '',
              measurementTool: '微生物培养箱',
              criticalItem: '是',
              remark: ''
            }
          ]
        },
        remarks: ''
      },
      {
        id: 2,
        reportName: '测试检验报告2',
        reportCode: 'TESTQ1235',
        reportType: '检验报告',
        productName: '测试产品2',
        batchNumber: 'TEST20260121',
        createDate: '2026-01-10',
        status: '待审批',
        author: '测试用户',
        approver: '',
        summary: '测试检验报告',
        reportContent: '测试内容',
        originalInspectionData: {
          id: 2,
          inspectionDate: '2026-01-10',
          deliveryDate: '2026-01-10',
          inspectionNumber: 'TESTQ1235',
          deliveryNumber: 'T1235',
          materialCode: 'TEST002',
          materialName: '测试产品2',
          batchNumber: 'TEST20260121',
          originalBatchNumber: 'ORIG20260121',
          inspectionType: 'PC',
          standardCode: '企标',
          specification: '测试规格',
          inspectionMethod: '抽样',
          inspectionStatus: '已检验',
          unqualifiedRate: '10.00%',
          sampleQuantity: '3',
          inspector: '测试用户',
          manufacturer: '测试厂商',
          agent: '测试代理商',
          validUntil: '2026-12-31',
          conclusion: 'reject',
          defectHandling: '不合格',
          handlingQuantities: {
            scrap: 1,
            stock: 0,
            rework: 0,
            reinspect: 0
          },
          inspectionItems: [
            {
              itemName: 'pH值',
              standard: '5.5-7.5',
              actualValue: '8.0',
              result: '不符合',
              defectItem: 'pH值超标',
              recordNumber: '',
              measurementTool: 'pH计',
              criticalItem: '是',
              remark: '超过标准范围'
            },
            {
              itemName: '微生物',
              standard: '<100 CFU/g',
              actualValue: '50',
              result: '符合',
              defectItem: '',
              recordNumber: '',
              measurementTool: '微生物培养箱',
              criticalItem: '是',
              remark: ''
            }
          ]
        },
        remarks: ''
      },
      {
        id: 3,
        reportName: '测试检验报告3',
        reportCode: 'TESTQ1236',
        reportType: '检验报告',
        productName: '测试产品1',
        batchNumber: 'TEST20260122',
        createDate: '2026-01-20',
        status: '已审批',
        author: '测试用户',
        approver: '审批人',
        summary: '测试检验报告',
        reportContent: '测试内容',
        originalInspectionData: {
          id: 3,
          inspectionDate: '2026-01-20',
          deliveryDate: '2026-01-20',
          inspectionNumber: 'TESTQ1236',
          deliveryNumber: 'T1236',
          materialCode: 'TEST001',
          materialName: '测试产品1',
          batchNumber: 'TEST20260122',
          originalBatchNumber: 'ORIG20260122',
          inspectionType: 'PC',
          standardCode: '企标',
          specification: '测试规格',
          inspectionMethod: '抽样',
          inspectionStatus: '已检验',
          unqualifiedRate: '0.00%',
          sampleQuantity: '3',
          inspector: '测试用户',
          manufacturer: '测试厂商',
          agent: '测试代理商',
          validUntil: '2026-12-31',
          conclusion: 'pass',
          defectHandling: '合格',
          handlingQuantities: {
            scrap: 0,
            stock: 0,
            rework: 0,
            reinspect: 0
          },
          inspectionItems: [
            {
              itemName: 'pH值',
              standard: '5.5-7.5',
              actualValue: '6.8',
              result: '符合',
              defectItem: '',
              recordNumber: '',
              measurementTool: 'pH计',
              criticalItem: '是',
              remark: ''
            },
            {
              itemName: '微生物',
              standard: '<100 CFU/g',
              actualValue: '40',
              result: '符合',
              defectItem: '',
              recordNumber: '',
              measurementTool: '微生物培养箱',
              criticalItem: '是',
              remark: ''
            }
          ]
        },
        remarks: ''
      }
    ]
    
    // 保存默认数据到localStorage
    localStorage.setItem('inspectionReports', JSON.stringify(defaultReports))
    return defaultReports
  }
}

// 检验报告数据
const inspectionReports = ref([])

// 获取所有产品名称
const productNames = computed(() => {
  const names = new Set()
  inspectionReports.value.forEach(report => {
    // 检查是否有originalInspectionData，如果有则使用materialName，否则使用productName
    if (report.originalInspectionData?.materialName) {
      names.add(report.originalInspectionData.materialName)
    } else if (report.productName) {
      names.add(report.productName)
    }
  })
  return Array.from(names)
})

// 过滤后的报告数据
const filteredReports = computed(() => {
  let filtered = [...inspectionReports.value]
  
  // 按产品筛选
  if (filterProduct.value) {
    filtered = filtered.filter(report => {
      const productName = report.originalInspectionData?.materialName || report.productName
      return productName === filterProduct.value
    })
  }
  
  // 按时间范围筛选
  if (filterPeriod.value) {
    const now = new Date()
    let startDate
    
    switch (filterPeriod.value) {
      case '本周':
        startDate = new Date(now.setDate(now.getDate() - now.getDay()))
        break
      case '本月':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case '近3个月':
        startDate = new Date(now.setMonth(now.getMonth() - 3))
        break
      case '近6个月':
        startDate = new Date(now.setMonth(now.getMonth() - 6))
        break
      case '本年':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        return filtered
    }
    
    filtered = filtered.filter(report => {
      const reportDate = new Date(report.createDate)
      return reportDate >= startDate
    })
  }
  
  return filtered
})

// 质量指标计算
const qualityRate = computed(() => {
  if (filteredReports.value.length === 0) return 0
  const qualifiedCount = filteredReports.value.filter(report => report.status === '已审批').length
  return ((qualifiedCount / filteredReports.value.length) * 100).toFixed(1)
})

const nonConformingRate = computed(() => {
  if (filteredReports.value.length === 0) return 0
  const nonConformingCount = filteredReports.value.filter(report => report.status !== '已审批').length
  return ((nonConformingCount / filteredReports.value.length) * 100).toFixed(1)
})

const inspectionCount = computed(() => {
  return filteredReports.value.length
})

// 暂时使用模拟值
const customerComplaint = ref(8)

// 不合格品分析
const nonConformingAnalysis = computed(() => {
  const analysis = [
    { reason: 'pH值超标', count: 0, percentage: '0%', source: '成品检验' },
    { reason: '微生物超标', count: 0, percentage: '0%', source: '原材料检验' },
    { reason: '有效成分不足', count: 0, percentage: '0%', source: '成品检验' },
    { reason: '外观不合格', count: 0, percentage: '0%', source: '过程检验' },
    { reason: '其他原因', count: 0, percentage: '0%', source: '其他' }
  ]
  
  // 统计不合格原因
  filteredReports.value.forEach(report => {
    if (report.status !== '已审批' && report.inspectionItems) {
      report.inspectionItems.forEach(item => {
        if (item.result === '不符合') {
          // 根据实际情况匹配原因
          if (item.itemName.includes('pH值')) {
            analysis[0].count++
          } else if (item.itemName.includes('微生物')) {
            analysis[1].count++
          } else if (item.itemName.includes('有效成分')) {
            analysis[2].count++
          } else if (item.itemName.includes('外观')) {
            analysis[3].count++
          } else {
            analysis[4].count++
          }
        }
      })
    }
  })
  
  // 计算百分比
  const totalCount = analysis.reduce((sum, item) => sum + item.count, 0)
  analysis.forEach(item => {
    if (totalCount > 0) {
      item.percentage = ((item.count / totalCount) * 100).toFixed(1) + '%'
    }
  })
  
  // 按数量排序
  return analysis.sort((a, b) => b.count - a.count)
})

// 检验项目分析
const inspectionItemAnalysis = computed(() => {
  const itemStats = new Map()
  
  // 统计各检验项目的合格情况
  filteredReports.value.forEach(report => {
    if (report.originalInspectionData?.inspectionItems) {
      report.originalInspectionData.inspectionItems.forEach(item => {
        const itemName = item.itemName
        if (!itemStats.has(itemName)) {
          itemStats.set(itemName, { qualifiedCount: 0, totalCount: 0 })
        }
        
        const stats = itemStats.get(itemName)
        stats.totalCount++
        if (item.result === '符合') {
          stats.qualifiedCount++
        }
        itemStats.set(itemName, stats)
      })
    }
  })
  
  // 转换为数组格式
  const analysis = []
  itemStats.forEach((stats, itemName) => {
    analysis.push({
      item: itemName,
      qualifiedCount: stats.qualifiedCount,
      totalCount: stats.totalCount,
      qualifiedRate: ((stats.qualifiedCount / stats.totalCount) * 100).toFixed(1) + '%'
    })
  })
  
  // 按合格率排序
  return analysis.sort((a, b) => parseFloat(b.qualifiedRate) - parseFloat(a.qualifiedRate))
})

// 供应商质量分析
const supplierAnalysis = computed(() => {
  const supplierStats = new Map()
  
  // 统计各供应商的质量情况
  filteredReports.value.forEach(report => {
    const supplier = report.originalInspectionData?.manufacturer
    if (supplier) {
      if (!supplierStats.has(supplier)) {
        supplierStats.set(supplier, { supplyCount: 0, qualifiedCount: 0, nonConformingCount: 0 })
      }
      
      const stats = supplierStats.get(supplier)
      stats.supplyCount++
      if (report.status === '已审批') {
        stats.qualifiedCount++
      } else {
        stats.nonConformingCount++
      }
      supplierStats.set(supplier, stats)
    }
  })
  
  // 转换为数组格式
  const analysis = []
  supplierStats.forEach((stats, supplier) => {
    analysis.push({
      supplier: supplier,
      supplyCount: stats.supplyCount,
      qualifiedCount: stats.qualifiedCount,
      qualifiedRate: stats.supplyCount > 0 ? ((stats.qualifiedCount / stats.supplyCount) * 100).toFixed(1) + '%' : '0%',
      nonConformingCount: stats.nonConformingCount
    })
  })
  
  // 按合格率排序
  return analysis.sort((a, b) => parseFloat(b.qualifiedRate) - parseFloat(a.qualifiedRate))
})

// 分析结论
const analysisConclusion = computed(() => {
  const totalReports = filteredReports.value.length
  if (totalReports === 0) {
    return '没有找到符合条件的检验报告数据'
  }
  
  const qualifiedRate = qualityRate.value
  const nonConformingRate = nonConformingRate.value
  const topReason = nonConformingAnalysis.value[0]
  
  let conclusion = `根据${filterPeriod.value}的质量数据统计，共分析了${totalReports}份检验报告，产品整体合格率为${qualifiedRate}%，不合格率为${nonConformingRate}%。`
  
  if (topReason && topReason.count > 0) {
    conclusion += ` 不合格品主要集中在${topReason.reason}，占比${topReason.percentage}。`
  }
  
  const lowQualitySupplier = supplierAnalysis.value.find(s => parseFloat(s.qualifiedRate) < 90)
  if (lowQualitySupplier) {
    conclusion += ` 供应商${lowQualitySupplier.supplier}的合格率较低（${lowQualitySupplier.qualifiedRate}），需要重点关注。`
  }
  
  return conclusion
})

// 改进建议
const improvementSuggestions = computed(() => {
  const suggestions = []
  
  // 根据不合格原因生成建议
  const topReasons = nonConformingAnalysis.value.slice(0, 2)
  topReasons.forEach(reason => {
    if (reason.count > 0) {
      if (reason.reason.includes('pH值')) {
        suggestions.push('针对pH值超标问题，建议优化生产工艺参数，加强过程监控')
      } else if (reason.reason.includes('微生物')) {
        suggestions.push('加强原材料微生物检测，确保生产环境符合卫生标准')
      } else if (reason.reason.includes('有效成分')) {
        suggestions.push('加强有效成分含量的检测，确保产品功效符合标准要求')
      } else if (reason.reason.includes('外观')) {
        suggestions.push('优化包装和生产过程，减少外观不合格品')
      }
    }
  })
  
  // 供应商相关建议
  const lowQualitySupplier = supplierAnalysis.value?.find(s => parseFloat(s.qualifiedRate) < 90)
  if (lowQualitySupplier) {
    suggestions.push(`与供应商${lowQualitySupplier.supplier}沟通，要求其提高产品质量，增加入厂检验频次`)
  }
  
  // 通用建议
  suggestions.push('定期组织质量培训，提高操作人员的质量意识和操作技能')
  suggestions.push('建立质量预警机制，对关键质量指标进行实时监控')
  
  return suggestions
})

// 刷新分析数据
const refreshAnalysis = () => {
  inspectionReports.value = loadInspectionReports()
  console.log('刷新分析数据', inspectionReports.value.length)
}

// 导出报告功能
const exportReport = () => {
  const reportData = {
    title: '质量分析报告',
    generatedDate: new Date().toISOString().split('T')[0],
    filterConditions: {
      analysisType: analysisType.value,
      product: filterProduct.value,
      period: filterPeriod.value
    },
    qualityMetrics: {
      qualityRate: qualityRate.value + '%',
      nonConformingRate: nonConformingRate.value + '%',
      inspectionCount: inspectionCount.value,
      customerComplaint: customerComplaint.value
    },
    analysisResults: {
      nonConformingAnalysis: nonConformingAnalysis.value,
      inspectionItemAnalysis: inspectionItemAnalysis.value,
      supplierAnalysis: supplierAnalysis.value
    },
    conclusion: analysisConclusion.value,
    suggestions: improvementSuggestions.value
  }
  
  // 将报告数据转换为JSON格式
  const jsonData = JSON.stringify(reportData, null, 2)
  
  // 创建下载链接
  const blob = new Blob([jsonData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `质量分析报告_${new Date().toISOString().split('T')[0]}.json`
  
  // 触发下载
  document.body.appendChild(a)
  a.click()
  
  // 清理
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
  
  alert('质量分析报告已成功导出')
}

// 保存分析功能
const saveAnalysis = () => {
  const savedAnalysis = {
    id: Date.now(),
    name: `${analysisType.value}_${new Date().toISOString().split('T')[0]}`,
    createdAt: new Date().toISOString(),
    filterConditions: {
      analysisType: analysisType.value,
      product: filterProduct.value,
      period: filterPeriod.value
    }
  }
  
  // 从localStorage加载已保存的分析配置
  const savedAnalyses = JSON.parse(localStorage.getItem('savedQualityAnalyses') || '[]')
  
  // 添加新的分析配置
  savedAnalyses.push(savedAnalysis)
  
  // 保存到localStorage
  localStorage.setItem('savedQualityAnalyses', JSON.stringify(savedAnalyses))
  
  alert('分析配置已成功保存')
}

// 生成趋势图数据
const generateTrendData = () => {
  const reports = filteredReports.value
  if (reports.length === 0) {
    return { labels: [], data: [] }
  }
  
  // 按月份分组
  const monthlyData = new Map()
  
  reports.forEach(report => {
    const date = new Date(report.createDate)
    const month = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0')
    
    if (!monthlyData.has(month)) {
      monthlyData.set(month, { total: 0, qualified: 0 })
    }
    
    const stats = monthlyData.get(month)
    stats.total++
    if (report.status === '已审批') {
      stats.qualified++
    }
    monthlyData.set(month, stats)
  })
  
  // 转换为图表所需格式
  const months = Array.from(monthlyData.keys()).sort()
  const qualifiedRates = months.map(month => {
    const stats = monthlyData.get(month)
    return ((stats.qualified / stats.total) * 100).toFixed(1)
  })
  
  return { labels: months, data: qualifiedRates }
}

// 初始化或更新趋势图
const updateTrendChart = () => {
  if (!qualityTrendChart.value) return
  
  const trendData = generateTrendData()
  
  // 销毁现有图表
  if (chartInstance) {
    chartInstance.destroy()
  }
  
  // 创建新图表
  const ctx = qualityTrendChart.value.getContext('2d')
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: trendData.labels,
      datasets: [{
        label: '产品合格率 (%)',
        data: trendData.data,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        fill: true,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: '合格率 (%)'
          }
        },
        x: {
          title: {
            display: true,
            text: '月份'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: '产品质量趋势图'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `合格率: ${context.parsed.y}%`
            }
          }
        }
      }
    }
  })
}

// 监听分析类型变化，更新图表
watch(
  [() => analysisType.value, () => filteredReports.value.length],
  () => {
    if (analysisType.value === '产品质量趋势') {
      // 延迟执行，确保DOM已更新
      setTimeout(() => {
        updateTrendChart()
      }, 100)
    }
  }
)

// 组件挂载时加载数据
onMounted(() => {
  refreshAnalysis()
})
</script>

<style scoped>
.quality-analysis {
  max-width: 1200px;
  margin: 0 auto;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 2rem;
}

.metric-card {
  height: 100%;
}

.metric-content {
  display: flex;
  align-items: center;
  padding: 1rem;
}

.metric-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-right: 1rem;
  color: white;
}

.metric-icon.quality-rate {
  background-color: #28a745;
}

.metric-icon.non-conforming {
  background-color: #dc3545;
}

.metric-icon.inspection-count {
  background-color: #007bff;
}

.metric-icon.customer-complaint {
  background-color: #ffc107;
}

.metric-info h3 {
  margin: 0;
  font-size: 1rem;
  color: #666;
}

.metric-value {
  font-size: 2rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.metric-trend {
  font-size: 0.8rem;
  font-weight: bold;
}

.metric-trend.positive {
  color: #28a745;
}

.metric-trend.negative {
  color: #dc3545;
}

.analysis-content {
  margin-bottom: 2rem;
}

.analysis-content h3 {
  margin-bottom: 1rem;
  color: #333;
}

.trend-chart {
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 400px;
}

/* 空数据状态样式 */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #ccc;
}

/* 加载状态样式 */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  color: #666;
}

.loading-state i {
  font-size: 2rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #666;
}

.chart-placeholder i {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #007bff;
}

.chart-data {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  width: 100%;
  height: 200px;
  margin-top: 2rem;
}

.chart-bar {
  width: 50px;
  background-color: #007bff;
  margin: 0 10px;
  border-radius: 4px 4px 0 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
  padding-bottom: 5px;
  transition: height 0.3s ease;
}

.analysis-conclusion {
  margin-top: 2rem;
}

.conclusion-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.conclusion-section h4 {
  margin-top: 0;
  color: #333;
}

.conclusion-section ul {
  padding-left: 1.5rem;
}

.conclusion-section li {
  margin-bottom: 0.5rem;
}
</style>

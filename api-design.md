# 化妆品检验系统后端API设计

## 1. 数据模型

### 1.1 用户模型(User)
```javascript
{
  id: String,           // 用户ID
  username: String,     // 用户名
  password: String,     // 密码（加密存储）
  name: String,         // 真实姓名
  email: String,        // 邮箱
  phone: String,        // 电话
  role: String,         // 角色：admin, inspector, approver, quality_manager
  department: String,   // 部门
  status: String,       // 状态：active, inactive
  createdAt: Date,      // 创建时间
  updatedAt: Date       // 更新时间
}
```

### 1.2 产品模型(Product)
```javascript
{
  id: String,           // 产品ID
  productName: String,  // 产品名称
  productCode: String,  // 产品代码
  specification: String,// 规格
  standardCode: String, // 标准代码
  manufacturer: String, // 制造商
  supplier: String,     // 供应商
  status: String,       // 状态：active, inactive
  createdAt: Date,      // 创建时间
  updatedAt: Date       // 更新时间
}
```

### 1.3 检验项目模型(InspectionItem)
```javascript
{
  id: String,           // 检验项目ID
  itemName: String,     // 项目名称
  standard: String,     // 检验标准
  method: String,       // 检验方法
  measurementTool: String, // 测量工具
  criticalItem: Boolean, // 是否关键项目
  unit: String,         // 单位
  minValue: Number,     // 最小值（可选）
  maxValue: Number,     // 最大值（可选）
  referenceValue: String, // 参考值（可选）
  status: String,       // 状态：active, inactive
  createdAt: Date,      // 创建时间
  updatedAt: Date       // 更新时间
}
```

### 1.4 检验报告模型(InspectionReport)
```javascript
{
  id: String,           // 报告ID
  inspectionNumber: String, // 检验编号
  productName: String,  // 产品名称
  batchNumber: String,  // 批次号
  originalBatchNumber: String, // 原批次号
  inspectionDate: Date, // 检验日期
  deliveryDate: Date,   // 交货日期
  inspectionType: String, // 检验类型：IQC, IPQC, FQC, OQC
  standardCode: String, // 标准代码
  specification: String,// 规格
  inspectionMethod: String, // 检验方法
  sampleQuantity: Number, // 抽样数量
  inspectionQuantity: Number, // 检验数量
  unqualifiedRate: String, // 不合格率
  conclusion: String,   // 结论：pass, fail
  defectHandling: String, // 缺陷处理方式
  handlingQuantities: Object, // 处理数量
  status: String,       // 状态：draft, submitted, approved, rejected
  author: String,       // 编制人
  approver: String,     // 审批人
  inspector: String,    // 检验员
  manufacturer: String, // 制造商
  agent: String,        // 代理商
  validUntil: Date,     // 有效期至
  inspectionItems: Array, // 检验项目列表
  createdAt: Date,      // 创建时间
  updatedAt: Date       // 更新时间
}
```

### 1.5 报告模板模型(ReportTemplate)
```javascript
{
  id: String,           // 模板ID
  templateName: String, // 模板名称
  templateCode: String, // 模板编号
  templateType: String, // 模板类型
  templateContent: String, // 模板内容（HTML格式）
  templateDescription: String, // 模板描述
  creator: String,      // 创建人
  usageCount: Number,   // 使用次数
  status: String,       // 状态：active, inactive
  createdAt: Date,      // 创建时间
  updatedAt: Date       // 更新时间
}
```

### 1.6 检验任务模型(InspectionTask)
```javascript
{
  id: String,           // 任务ID
  taskName: String,     // 任务名称
  taskCode: String,     // 任务编号
  productName: String,  // 产品名称
  batchNumber: String,  // 批次号
  inspectionType: String, // 检验类型
  assignedTo: String,   // 分配给
  assignedBy: String,   // 分配人
  dueDate: Date,        // 截止日期
  status: String,       // 状态：pending, in_progress, completed, overdue
  priority: String,     // 优先级：low, medium, high
  inspectionReportId: String, // 关联的检验报告ID
  createdAt: Date,      // 创建时间
  updatedAt: Date       // 更新时间
}
```

## 2. API端点设计

### 2.1 认证与授权
```
POST /api/auth/login              # 用户登录
POST /api/auth/logout             # 用户登出
POST /api/auth/register           # 用户注册
POST /api/auth/reset-password     # 重置密码
GET  /api/auth/profile            # 获取当前用户信息
PUT  /api/auth/profile            # 更新用户信息
```

### 2.2 产品管理
```
GET    /api/products              # 获取产品列表
GET    /api/products/:id          # 获取产品详情
POST   /api/products              # 创建产品
PUT    /api/products/:id          # 更新产品
DELETE /api/products/:id          # 删除产品
```

### 2.3 检验项目管理
```
GET    /api/inspection-items              # 获取检验项目列表
GET    /api/inspection-items/:id          # 获取检验项目详情
POST   /api/inspection-items              # 创建检验项目
PUT    /api/inspection-items/:id          # 更新检验项目
DELETE /api/inspection-items/:id          # 删除检验项目
```

### 2.4 检验报告管理
```
GET    /api/inspection-reports              # 获取检验报告列表
GET    /api/inspection-reports/:id          # 获取检验报告详情
POST   /api/inspection-reports              # 创建检验报告
PUT    /api/inspection-reports/:id          # 更新检验报告
DELETE /api/inspection-reports/:id          # 删除检验报告
POST   /api/inspection-reports/:id/approve  # 审批检验报告
POST   /api/inspection-reports/:id/reject   # 驳回检验报告
```

### 2.5 报告模板管理
```
GET    /api/report-templates              # 获取报告模板列表
GET    /api/report-templates/:id          # 获取报告模板详情
POST   /api/report-templates              # 创建报告模板
PUT    /api/report-templates/:id          # 更新报告模板
DELETE /api/report-templates/:id          # 删除报告模板
POST   /api/report-templates/:id/preview  # 预览报告模板
```

### 2.6 检验任务管理
```
GET    /api/inspection-tasks              # 获取检验任务列表
GET    /api/inspection-tasks/:id          # 获取检验任务详情
POST   /api/inspection-tasks              # 创建检验任务
PUT    /api/inspection-tasks/:id          # 更新检验任务
DELETE /api/inspection-tasks/:id          # 删除检验任务
POST   /api/inspection-tasks/:id/start    # 开始检验任务
POST   /api/inspection-tasks/:id/complete # 完成检验任务
```

### 2.7 数据导入导出
```
POST   /api/import/products              # 导入产品数据
POST   /api/import/inspection-items      # 导入检验项目数据
POST   /api/import/inspection-reports    # 导入检验报告数据
GET    /api/export/products              # 导出产品数据
GET    /api/export/inspection-items      # 导出检验项目数据
GET    /api/export/inspection-reports    # 导出检验报告数据
GET    /api/export/inspection-reports/:id/pdf # 导出PDF报告
```

## 3. 技术栈

- **后端框架**: Node.js + Express
- **数据库**: MongoDB
- **认证**: JWT (JSON Web Tokens)
- **ORM**: Mongoose
- **文件上传**: Multer
- **PDF生成**: Puppeteer or PDFKit
- **Excel处理**: xlsx

## 4. 安全考虑

1. **密码加密**: 使用bcrypt对密码进行加密存储
2. **API认证**: 所有API请求（除了登录和注册）都需要JWT认证
3. **权限控制**: 基于角色的访问控制(RBAC)
4. **输入验证**: 对所有用户输入进行验证和清洗
5. **错误处理**: 统一的错误处理机制，避免泄露敏感信息
6. **日志记录**: 记录所有关键操作和错误日志
7. **CORS配置**: 适当配置CORS，允许前端访问API

## 5. 性能优化

1. **数据库索引**: 为常用查询字段添加索引
2. **分页处理**: 对列表查询结果进行分页
3. **缓存机制**: 对频繁访问的数据进行缓存
4. **批量操作**: 支持批量导入导出功能
5. **异步处理**: 对耗时操作采用异步处理

## 6. API版本控制

采用URL路径版本控制:
```
/api/v1/products
/api/v1/inspection-reports
```
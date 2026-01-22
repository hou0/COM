// API服务封装

const API_BASE_URL = 'http://localhost:3000/api';

// 通用请求方法
const request = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      ...options
    });

    if (!response.ok) {
      // 检查响应是否为JSON格式
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || '请求失败');
        } catch {
          throw new Error(`请求失败: ${response.status} ${response.statusText}`);
        }
      } else {
        throw new Error(`请求失败: ${response.status} ${response.statusText}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
};

// 认证相关API
export const authAPI = {
  // 用户登录
  login: async (username, password) => {
    return await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  // 用户注册
  register: async (userData) => {
    return await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  // 获取用户信息
  getProfile: async () => {
    return await request('/auth/profile');
  },

  // 更新用户信息
  updateProfile: async (userData) => {
    return await request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }
};

// 产品相关API
export const productAPI = {
  // 获取产品列表
  getProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await request(`/products${queryString ? `?${queryString}` : ''}`);
  },

  // 获取产品详情
  getProduct: async (id) => {
    return await request(`/products/${id}`);
  },

  // 创建产品
  createProduct: async (productData) => {
    return await request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },

  // 更新产品
  updateProduct: async (id, productData) => {
    return await request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },

  // 删除产品
  deleteProduct: async (id) => {
    return await request(`/products/${id}`, {
      method: 'DELETE'
    });
  }
};

// 检验项目相关API
export const inspectionItemAPI = {
  // 获取检验项目列表
  getInspectionItems: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await request(`/inspection-items${queryString ? `?${queryString}` : ''}`);
  },

  // 获取检验项目详情
  getInspectionItem: async (id) => {
    return await request(`/inspection-items/${id}`);
  },

  // 创建检验项目
  createInspectionItem: async (itemData) => {
    return await request('/inspection-items', {
      method: 'POST',
      body: JSON.stringify(itemData)
    });
  },

  // 更新检验项目
  updateInspectionItem: async (id, itemData) => {
    return await request(`/inspection-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData)
    });
  },

  // 删除检验项目
  deleteInspectionItem: async (id) => {
    return await request(`/inspection-items/${id}`, {
      method: 'DELETE'
    });
  }
};

// 检验报告相关API
export const inspectionReportAPI = {
  // 获取检验报告列表
  getInspectionReports: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await request(`/inspection-reports${queryString ? `?${queryString}` : ''}`);
  },

  // 获取检验报告详情
  getInspectionReport: async (id) => {
    return await request(`/inspection-reports/${id}`);
  },

  // 创建检验报告
  createInspectionReport: async (reportData) => {
    return await request('/inspection-reports', {
      method: 'POST',
      body: JSON.stringify(reportData)
    });
  },

  // 更新检验报告
  updateInspectionReport: async (id, reportData) => {
    return await request(`/inspection-reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reportData)
    });
  },

  // 审批检验报告
  approveInspectionReport: async (id, taskId) => {
    return await request(`/inspection-reports/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ taskId })
    });
  },

  // 驳回检验报告
  rejectInspectionReport: async (id) => {
    return await request(`/inspection-reports/${id}/reject`, {
      method: 'POST'
    });
  },

  // 删除检验报告
  deleteInspectionReport: async (id) => {
    return await request(`/inspection-reports/${id}`, {
      method: 'DELETE'
    });
  }
};

// 报告相关API
export const reportAPI = {
  // 获取报告列表
  getReports: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await request(`/reports${queryString ? `?${queryString}` : ''}`);
  },

  // 获取报告详情
  getReport: async (id) => {
    return await request(`/reports/${id}`);
  },

  // 创建报告
  createReport: async (reportData) => {
    return await request('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData)
    });
  },

  // 更新报告
  updateReport: async (id, reportData) => {
    return await request(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reportData)
    });
  },

  // 删除报告
  deleteReport: async (id) => {
    return await request(`/reports/${id}`, {
      method: 'DELETE'
    });
  }
};

// 导出相关API
export const exportAPI = {
  // 导出产品数据
  exportProducts: async () => {
    const response = await fetch(`${API_BASE_URL}/export/products`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('导出失败');
    }

    const blob = await response.blob();
    return blob;
  },

  // 导出检验项目数据
  exportInspectionItems: async () => {
    const response = await fetch(`${API_BASE_URL}/export/inspection-items`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('导出失败');
    }

    const blob = await response.blob();
    return blob;
  },

  // 导出检验报告数据
  exportInspectionReports: async () => {
    const response = await fetch(`${API_BASE_URL}/export/inspection-reports`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('导出失败');
    }

    const blob = await response.blob();
    return blob;
  },

  // 导出PDF报告
  exportPDFReport: async (id) => {
    const response = await fetch(`${API_BASE_URL}/export/inspection-reports/${id}/pdf`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('导出失败');
    }

    const blob = await response.blob();
    return blob;
  }
};

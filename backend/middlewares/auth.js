import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// 生成JWT令牌
export const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// 认证中间件
export const authMiddleware = async (req, res, next) => {
  try {
    // 从请求头获取token
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: '缺少认证令牌' });
    }
    
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查找用户
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }
    
    // 检查用户状态
    if (user.status !== 'active') {
      return res.status(401).json({ error: '用户账号已被禁用' });
    }
    
    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: '认证令牌已过期' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: '无效的认证令牌' });
    }
    return res.status(401).json({ error: '认证失败' });
  }
};

// 角色权限中间件
export const roleMiddleware = (requiredRoles) => {
  return (req, res, next) => {
    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({ error: '权限不足' });
    }
    next();
  };
};

import express from 'express';
import User from '../models/User.js';
import { generateToken, authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, email, phone, role, department } = req.body;
    
    // 检查用户名是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' });
    }
    
    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: '邮箱已被注册' });
    }
    
    // 创建新用户
    const user = new User({
      username,
      password,
      name,
      email,
      phone,
      role,
      department
    });
    
    await user.save();
    
    // 生成令牌
    const token = generateToken(user);
    
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 查找用户
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 验证密码
    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 检查用户状态
    if (user.status !== 'active') {
      return res.status(401).json({ error: '用户账号已被禁用' });
    }
    
    // 生成令牌
    const token = generateToken(user);
    
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取当前用户信息
router.get('/profile', authMiddleware, (req, res) => {
  res.json(req.user);
});

// 更新用户信息
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, department } = req.body;
    
    // 检查邮箱是否已被其他用户使用
    if (email && email !== req.user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ error: '邮箱已被注册' });
      }
    }
    
    // 更新用户信息
    req.user.name = name || req.user.name;
    req.user.email = email || req.user.email;
    req.user.phone = phone || req.user.phone;
    req.user.department = department || req.user.department;
    
    await req.user.save();
    
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新密码
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    // 验证旧密码
    const isPasswordValid = await req.user.verifyPassword(oldPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ error: '旧密码错误' });
    }
    
    // 更新密码
    req.user.password = newPassword;
    await req.user.save();
    
    res.json({ message: '密码更新成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

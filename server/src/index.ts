import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './db';
import { redis } from './redis';
import { CONFIG } from './config';
import { generateTokens, authenticateToken } from './auth';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ---------------------- 认证模块 ----------------------

// 注册
app.post('/auth/register', async (req, res) => {
  const { email, password, nickname } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nickname: nickname || '新用户',
      },
    });
    res.json({ message: '注册成功', userId: user.id });
  } catch (error) {
    res.status(400).json({ error: '注册失败，邮箱可能已被使用' });
  }
});

// 登录
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: '用户不存在' });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).json({ error: '密码错误' });

  // 生成 Token
  const tokens = generateTokens(user.id);
  
  // 将 Refresh Token 存入 Redis 白名单，绑定用户设备
  // Key: `refresh_token:${userId}`, Value: token
  await redis.set(`refresh_token:${user.id}`, tokens.refreshToken);

  res.json({
    ...tokens,
    user: { id: user.id, email: user.email, nickname: user.nickname }
  });
});

// 刷新 Token (无感续签)
app.post('/auth/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.sendStatus(401);

  // 1. 验证 Token 签名是否合法
  jwt.verify(refreshToken, CONFIG.JWT_REFRESH_SECRET, async (err: any, decoded: any) => {
    if (err) return res.status(403).json({ error: 'Invalid Refresh Token' });

    const userId = decoded.userId;

    // 2. 查 Redis：这个 Token 是不是我们要的那个？
    const storedToken = await redis.get(`refresh_token:${userId}`);
    if (storedToken !== refreshToken) {
      return res.status(403).json({ error: 'Token 已失效或被撤销' });
    }

    // 3. 签发新的 Access Token
    const accessToken = jwt.sign({ userId }, CONFIG.JWT_ACCESS_SECRET, {
      expiresIn: CONFIG.ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    res.json({ accessToken });
  });
});

// 退出登录
app.post('/auth/logout', authenticateToken, async (req, res) => {
  const userId = req.user!.userId;
  // 从 Redis 删除 Refresh Token，强制下线
  await redis.del(`refresh_token:${userId}`);
  res.json({ message: '已退出登录' });
});

// ---------------------- 业务模块 ----------------------

// 获取用户信息 & 资产概况
app.get('/users/me', authenticateToken, async (req, res) => {
  const userId = req.user!.userId;
  
  // 并行查询：用户信息 + 本月收支
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [user, incomeAgg, expenseAgg] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.transaction.aggregate({
      where: { userId, type: 'income', date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amount: true }
    }),
    prisma.transaction.aggregate({
      where: { userId, type: 'expense', date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amount: true }
    })
  ]);

  // 计算总资产 (这里简化为历史总收入 - 历史总支出，或者您可以单独存一个 balance 字段)
  const totalIncome = await prisma.transaction.aggregate({ where: { userId, type: 'income' }, _sum: { amount: true } });
  const totalExpense = await prisma.transaction.aggregate({ where: { userId, type: 'expense' }, _sum: { amount: true } });
  
  const balance = (totalIncome._sum.amount || 0) - (totalExpense._sum.amount || 0);

  res.json({
    user: {
      id: user?.id,
      nickname: user?.nickname,
      email: user?.email
    },
    stats: {
      balance,
      monthlyIncome: incomeAgg._sum.amount || 0,
      monthlyExpense: expenseAgg._sum.amount || 0
    }
  });
});

// 记一笔
app.post('/transactions', authenticateToken, async (req, res) => {
  const userId = req.user!.userId;
  const { amount, type, categoryId, categoryName, date, note } = req.body;

  const transaction = await prisma.transaction.create({
    data: {
      amount: parseFloat(amount),
      type,
      categoryId,
      categoryName,
      date: new Date(date),
      note,
      userId
    }
  });

  res.json(transaction);
});

// 获取近期交易列表
app.get('/transactions', authenticateToken, async (req, res) => {
  const userId = req.user!.userId;
  const list = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 20 // 只取最近 20 条
  });
  res.json(list);
});

// 获取分类统计数据
app.get('/stats/category', authenticateToken, async (req, res) => {
  const userId = req.user!.userId;
  
  // 聚合查询：按分类分组求和
  const group = await prisma.transaction.groupBy({
    by: ['categoryId', 'categoryName'],
    where: { userId, type: 'expense' }, // 只统计支出
    _sum: {
      amount: true,
    },
    orderBy: {
      _sum: {
        amount: 'desc'
      }
    }
  });
  
  // 计算总支出以算出百分比
  const totalExpense = group.reduce((acc, curr) => acc + (curr._sum.amount || 0), 0);

  const result = group.map(g => ({
    categoryId: g.categoryId,
    categoryName: g.categoryName,
    amount: g._sum.amount || 0,
    percentage: totalExpense ? Math.round(((g._sum.amount || 0) / totalExpense) * 100) : 0
  }));

  res.json({ totalExpense, details: result });
});


// 启动服务
app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});

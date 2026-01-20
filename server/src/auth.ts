import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { CONFIG } from './config';

interface TokenPayload {
  userId: string;
}

// 扩展 Express Request 类型，以便在中间件中传递 user 信息
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string };
    }
  }
}

// 生成双 Token
export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, CONFIG.JWT_ACCESS_SECRET, {
    expiresIn: CONFIG.ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
  
  const refreshToken = jwt.sign({ userId }, CONFIG.JWT_REFRESH_SECRET, {
    expiresIn: CONFIG.REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

  return { accessToken, refreshToken };
};

// 验证 Access Token 的中间件
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: '未提供访问令牌' });
  }

  jwt.verify(token, CONFIG.JWT_ACCESS_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: '令牌无效或已过期' });
    }
    req.user = user as { userId: string };
    next();
  });
};

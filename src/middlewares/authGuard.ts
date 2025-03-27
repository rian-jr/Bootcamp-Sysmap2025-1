// src/middlewares/authGuard.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authGuard = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const [, token] = authHeader.split(' '); // Bearer <token>

  try {
    const decoded = jwt.verify(token, 'seuSegredoJWT') as { id: string };
    req.userId = decoded.id; // Agora não dá mais erro de tipo!
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export default authGuard;
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido.' });
    }

    try {
        const decoded = jwt.verify(token, 'seuSegredoJWT');
        req.userId = (decoded as { id: any }).id;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido.' });
    }
};

export default authMiddleware;
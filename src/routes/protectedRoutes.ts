// src/routes/protectedRoutes.ts
import express, { Request, Response, NextFunction } from 'express';
import { authGuard } from '../middlewares/authGuard';

const router = express.Router();

interface CustomRequest extends Request {
    userId?: string;
}


router.get('/profile', authGuard, (req: CustomRequest, res: Response) => {
    if (!req.userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    res.json({ userId: req.userId, message: 'Perfil carregado com sucesso!' });
});

export default router;

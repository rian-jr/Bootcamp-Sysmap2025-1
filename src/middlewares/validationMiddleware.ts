// src/middlewares/validationMiddleware.ts
import { Request, Response, NextFunction } from 'express';

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    next();
};

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
    const { name, email, cpf, password } = req.body;

    if (!name || !email || !cpf || !password) {
        return res.status(400).json({ error: 'Nome, e-mail, CPF e senha são obrigatórios.' });
    }

    next();
};

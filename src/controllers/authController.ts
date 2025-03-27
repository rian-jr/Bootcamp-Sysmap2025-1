import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();


export const register = async (req: Request, res: Response) => {
    const { name, email, cpf, password } = req.body;

    try {
        // Verifica se o e-mail ou CPF já existem
        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { cpf }] },
        });

        if (existingUser) {
            return res.status(400).json({ error: 'E-mail ou CPF já cadastrado.' });
        }

        // Criptografa a senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Cria o usuário
        const user = await prisma.user.create({
            data: { name, email, cpf, password: hashedPassword },
        });

        res.status(201).json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao registrar usuário.' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        // Busca o usuário pelo e-mail
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
        }

        // Verifica a senha
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
        }

        // Gera o token JWT
        const token = jwt.sign({ id: user.id }, 'seuSegredoJWT', { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao fazer login.' });
    }
}; export default { register, login }

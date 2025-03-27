import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { S3Client } from '@aws-sdk/client-s3'
import multer from 'multer';
import multerS3 from 'multer-s3';
import AWS from 'aws-sdk';



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
};




export const updateProfile = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const userId = req.userId

    try {
        let hashedPassword;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        res.status(200).json({ user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar perfil.' });
    }


};


AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3Config = new S3Client({
    region: 'us-west-1',
    credentials: {
        accessKeyId: '',
        secretAccessKey: ''
    }
})


const upload = multer({
    storage: multerS3({
        s3: s3Config,
        bucket: 'bucket-name',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString())
        }
    })
})

export const uploadProfilePhoto = [
    upload.single('photo'),
    async (req: Request, res: Response) => {
        const userId = req.userId
        const file = req.file as Express.MulterS3.File

        try {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { profilePhoto: file.location },
            })

            res.status(200).json({ user: updatedUser })
        } catch (error) {
            res.status(500).json({ error: 'Erro ao fazer o upload da foto de perfil' })
        }
    }
]


export const updateInterests = async (req: Request, res: Response) => {
    const { interests } = req.body;
    const userId = req.userId

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                interests,
            },
        });

        res.status(200).json({ user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: 'Erro na atualização de interesses.' });
    }
}

export const deactivateAccount = async (req: Request, res: Response) => {
    const userId = req.userId
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                isActive: false,
            },
        });

        res.status(200).json({ message: 'Parabéns, usuário desativado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao desativar usuário' });
    }
}

export const addExperience = async (req: Request, res: Response) => {
    const { experience } = req.body;
    const userId = req.userId

    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { experience: { increament: experience } },
        });

        const levels = [100, 200, 300, 600, 1000]
        let newLevel = user.level
        for (let i = 0; i < levels.length; i++) {
            if (user.experience >= levels[i]) {
                newLevel = i + 2
            }
        }

        if (newLevel !== user.level) {
            await prisma.user.update({
                where: { id: userId },
                data: { level: newLevel },
            })
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao adicionar experiência.' });
    }
}

export const addAchievement = async (req: Request, res: Response) => {
    const { achievement } = req.body;
    const userId = req.userId

    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { achievements: { push: achievement } },
        });

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao adicionar conquista.' });
    }
}










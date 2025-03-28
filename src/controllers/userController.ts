import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';


const prisma = new PrismaClient();

export const updateProfile = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const userId = req.userId; // Obtido do middleware de autenticação

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



const s3 = new S3Client({
    endpoint: 'http://localhost:4566',
    region: 'us-east-1',
    credentials: {
        accessKeyId: 'user',
        secretAccessKey: 'password',
    },
    forcePathStyle: true
});

const upload = multer({
    storage: multerS3({
        s3,
        bucket: 'profile-photos',
        acl: 'public-read',
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            cb(null, `${Date.now().toString()}-${file.originalname}`);
        },
    }),
});

export const uploadProfilePhoto = [
    upload.single('photo'),
    async (req: Request, res: Response) => {
        const userId = req.userId;
        const file = req.file as Express.MulterS3.File;

        try {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { profilePhoto: file.location },
            });

            res.status(200).json({ user: updatedUser });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao fazer upload da foto.' });
        }
    },
];

export const updateInterests = async (req: Request, res: Response) => {
    const { interests } = req.body;
    const userId = req.userId;

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { interests },
        });

        res.status(200).json({ user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar interesses.' });
    }
};

export const deactivateAccount = async (req: Request, res: Response) => {
    const userId = req.userId;

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { isActive: false },
        });

        res.status(200).json({ message: 'Conta desativada com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao desativar conta.' });
    }
};

export const addExperience = async (req: Request, res: Response) => {
    const { experience } = req.body;
    const userId = req.userId;

    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { experience: { increment: experience } },
        });

        // Verifica se o usuário subiu de nível
        const levels = [100, 300, 600, 1000];
        let newLevel = user.level;

        for (let i = 0; i < levels.length; i++) {
            if (user.experience >= levels[i]) {
                newLevel = i + 2;
            }
        }

        if (newLevel !== user.level) {
            await prisma.user.update({
                where: { id: userId },
                data: { level: newLevel },
            });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao adicionar experiência.' });
    }
};

export const addAchievement = async (req: Request, res: Response) => {
    const { achievementId } = req.body;
    const userId = req.userId;

    try {
        // Verifica se a conquista existe
        const achievement = await prisma.achievement.findUnique({
            where: { id: achievementId },
        });

        if (!achievement) {
            return res.status(404).json({ error: 'Conquista não encontrada.' });
        }

        // Adiciona a conquista ao usuário
        await prisma.userAchievement.create({
            data: { userId, achievementId },
        });

        res.status(200).json({ message: 'Conquista adicionada com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao adicionar conquista.' });
    }
};


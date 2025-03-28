import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
    // Níveis
    await prisma.level.createMany({
        data: [
            { name: 'Bronze', experienceRequired: 0 },
            { name: 'Prata', experienceRequired: 100 },
            { name: 'Ouro', experienceRequired: 300 },
            { name: 'Platina', experienceRequired: 600 },
        ],
    });

    // Conquistas
    await prisma.achievement.createMany({
        data: [
            { name: 'Primeira Atividade', description: 'Participou da primeira atividade.' },
            { name: 'Criador de Atividades', description: 'Criou a primeira atividade.' },
            { name: 'Experiente', description: 'Alcançou 100 pontos de experiência.' },
        ],
    });

    console.log('Dados iniciais inseridos com sucesso.');
}

seed()
    .catch((error) => {
        console.error(error);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
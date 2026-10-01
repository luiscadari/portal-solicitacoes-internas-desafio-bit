import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SEED_USERS, generateRequests } from './seed-data';

const prisma = new PrismaClient();

async function main() {
  const userIds: Record<string, number> = {};

  for (const user of SEED_USERS) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    const saved = await prisma.user.upsert({
      where: { username: user.username },
      update: {},
      create: { username: user.username, name: user.name, passwordHash, role: user.role },
    });
    userIds[user.username] = saved.id;
  }

  // Solicitações fictícias só são criadas em um banco vazio (seed idempotente).
  if ((await prisma.request.count()) > 0) {
    console.log(`🌱 Seed: ${SEED_USERS.length} usuários garantidos; solicitações já existentes, nada a fazer.`);
    return;
  }

  const requests = generateRequests();

  await prisma.$transaction(
    requests.map((item) =>
      prisma.request.create({
        data: {
          title: item.title,
          description: item.description,
          category: item.category,
          status: item.status,
          requesterId: userIds[item.requester],
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          history: {
            create: item.history.map((entry) => ({
              fromStatus: entry.fromStatus,
              toStatus: entry.toStatus,
              changedById: userIds[entry.changedBy],
              changedAt: entry.changedAt,
            })),
          },
        },
      }),
    ),
  );

  const byStatus = requests.reduce<Record<string, number>>(
    (acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }),
    {},
  );
  console.log(`🌱 Seed concluído: ${SEED_USERS.length} usuários e ${requests.length} solicitações`, byStatus);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

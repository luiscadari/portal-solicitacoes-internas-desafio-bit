import { Category, PrismaClient, RequestStatus, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const users = [
  { username: 'colaborador', name: 'Carlos Colaborador', password: 'colaborador123', role: Role.COLABORADOR },
  { username: 'maria', name: 'Maria Souza', password: 'maria123', role: Role.COLABORADOR },
  { username: 'atendente', name: 'Ana Atendente', password: 'atendente123', role: Role.ATENDENTE },
];

type SeedRequest = {
  title: string;
  description: string;
  category: Category;
  status: RequestStatus;
  requester: string;
  daysAgo: number;
};

const requests: SeedRequest[] = [
  {
    title: 'Notebook não liga',
    description: 'Meu notebook não liga desde ontem, mesmo conectado na tomada.',
    category: Category.TI,
    status: RequestStatus.ABERTO,
    requester: 'colaborador',
    daysAgo: 1,
  },
  {
    title: 'Acesso à VPN',
    description: 'Preciso de acesso à VPN para trabalhar remotamente às sextas.',
    category: Category.TI,
    status: RequestStatus.EM_ATENDIMENTO,
    requester: 'maria',
    daysAgo: 3,
  },
  {
    title: 'Atualização de dados bancários',
    description: 'Gostaria de atualizar a conta para recebimento do salário.',
    category: Category.RH,
    status: RequestStatus.CONCLUIDO,
    requester: 'colaborador',
    daysAgo: 20,
  },
  {
    title: 'Solicitação de férias',
    description: 'Solicito férias de 15 dias a partir do próximo mês.',
    category: Category.RH,
    status: RequestStatus.ABERTO,
    requester: 'maria',
    daysAgo: 2,
  },
  {
    title: 'Compra de monitores',
    description: 'A equipe de design precisa de 3 monitores 27 polegadas.',
    category: Category.COMPRAS,
    status: RequestStatus.EM_ATENDIMENTO,
    requester: 'colaborador',
    daysAgo: 7,
  },
  {
    title: 'Cadeira ergonômica',
    description: 'Solicito uma cadeira ergonômica conforme laudo médico anexado ao RH.',
    category: Category.COMPRAS,
    status: RequestStatus.ABERTO,
    requester: 'maria',
    daysAgo: 5,
  },
  {
    title: 'Reembolso de viagem',
    description: 'Reembolso das despesas da viagem a São Paulo (hotel e alimentação).',
    category: Category.FINANCEIRO,
    status: RequestStatus.CONCLUIDO,
    requester: 'maria',
    daysAgo: 30,
  },
  {
    title: 'Adiantamento para evento',
    description: 'Adiantamento para participação no evento de tecnologia.',
    category: Category.FINANCEIRO,
    status: RequestStatus.ABERTO,
    requester: 'colaborador',
    daysAgo: 0,
  },
  {
    title: 'Ar-condicionado com defeito',
    description: 'O ar-condicionado da sala de reuniões 2 está pingando.',
    category: Category.INFRAESTRUTURA,
    status: RequestStatus.EM_ATENDIMENTO,
    requester: 'colaborador',
    daysAgo: 10,
  },
  {
    title: 'Troca de lâmpadas',
    description: 'Lâmpadas queimadas no corredor do 3º andar.',
    category: Category.INFRAESTRUTURA,
    status: RequestStatus.CONCLUIDO,
    requester: 'maria',
    daysAgo: 15,
  },
];

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

async function main() {
  const userIds: Record<string, number> = {};

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    const saved = await prisma.user.upsert({
      where: { username: user.username },
      update: {},
      create: { username: user.username, name: user.name, passwordHash, role: user.role },
    });
    userIds[user.username] = saved.id;
  }

  // Solicitações de exemplo só são criadas em um banco vazio (seed idempotente).
  if ((await prisma.request.count()) > 0) {
    console.log('🌱 Seed: usuários garantidos; solicitações já existentes, nada a fazer.');
    return;
  }

  const attendantId = userIds.atendente;

  const HOUR = 60 * 60 * 1000;

  for (const item of requests) {
    const createdAt = daysAgo(item.daysAgo);
    const requesterId = userIds[item.requester];
    // Transições simuladas: atendimento iniciado 2h após a abertura e concluído 1 dia depois (sem passar de agora).
    const startedAt = new Date(Math.min(createdAt.getTime() + 2 * HOUR, Date.now()));
    const finishedAt = new Date(Math.min(createdAt.getTime() + 26 * HOUR, Date.now()));

    const history: {
      fromStatus: RequestStatus | null;
      toStatus: RequestStatus;
      changedById: number;
      changedAt: Date;
    }[] = [{ fromStatus: null, toStatus: RequestStatus.ABERTO, changedById: requesterId, changedAt: createdAt }];
    if (item.status !== RequestStatus.ABERTO) {
      history.push({
        fromStatus: RequestStatus.ABERTO,
        toStatus: RequestStatus.EM_ATENDIMENTO,
        changedById: attendantId,
        changedAt: startedAt,
      });
    }
    if (item.status === RequestStatus.CONCLUIDO) {
      history.push({
        fromStatus: RequestStatus.EM_ATENDIMENTO,
        toStatus: RequestStatus.CONCLUIDO,
        changedById: attendantId,
        changedAt: finishedAt,
      });
    }

    await prisma.request.create({
      data: {
        title: item.title,
        description: item.description,
        category: item.category,
        status: item.status,
        requesterId,
        createdAt,
        updatedAt: history[history.length - 1].changedAt,
        history: { create: history },
      },
    });
  }

  console.log(`🌱 Seed concluído: ${users.length} usuários e ${requests.length} solicitações.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

/**
 * Dados fictícios de demonstração usados pelo seed.
 *
 * A geração é determinística (PRNG com semente fixa): toda subida de um banco
 * vazio produz o mesmo conjunto de usuários e solicitações, relativo à data atual.
 * O módulo não acessa o banco, o que permite testá-lo isoladamente.
 */
import { Category, RequestStatus, Role } from '@prisma/client';

export interface SeedUser {
  username: string;
  name: string;
  password: string;
  role: Role;
}

export interface SeedHistoryEntry {
  fromStatus: RequestStatus | null;
  toStatus: RequestStatus;
  changedBy: string;
  changedAt: Date;
}

export interface SeedRequest {
  title: string;
  description: string;
  category: Category;
  status: RequestStatus;
  requester: string;
  createdAt: Date;
  updatedAt: Date;
  history: SeedHistoryEntry[];
}

/** Senha padrão dos usuários fictícios adicionais. */
export const DEFAULT_PASSWORD = 'senha123';

export const SEED_USERS: SeedUser[] = [
  // Usuários de teste documentados no README
  { username: 'colaborador', name: 'Carlos Colaborador', password: 'colaborador123', role: Role.COLABORADOR },
  { username: 'maria', name: 'Maria Souza', password: 'maria123', role: Role.COLABORADOR },
  { username: 'atendente', name: 'Ana Atendente', password: 'atendente123', role: Role.ATENDENTE },
  // Usuários fictícios adicionais
  { username: 'bruno.lima', name: 'Bruno Lima', password: DEFAULT_PASSWORD, role: Role.ATENDENTE },
  { username: 'joao.pereira', name: 'João Pereira', password: DEFAULT_PASSWORD, role: Role.COLABORADOR },
  { username: 'fernanda.alves', name: 'Fernanda Alves', password: DEFAULT_PASSWORD, role: Role.COLABORADOR },
  { username: 'ricardo.santos', name: 'Ricardo Santos', password: DEFAULT_PASSWORD, role: Role.COLABORADOR },
  { username: 'juliana.costa', name: 'Juliana Costa', password: DEFAULT_PASSWORD, role: Role.COLABORADOR },
  { username: 'paulo.mendes', name: 'Paulo Mendes', password: DEFAULT_PASSWORD, role: Role.COLABORADOR },
  { username: 'camila.rocha', name: 'Camila Rocha', password: DEFAULT_PASSWORD, role: Role.COLABORADOR },
  { username: 'lucas.martins', name: 'Lucas Martins', password: DEFAULT_PASSWORD, role: Role.COLABORADOR },
  { username: 'beatriz.oliveira', name: 'Beatriz Oliveira', password: DEFAULT_PASSWORD, role: Role.COLABORADOR },
];

type Template = { title: string; description: string };

/** Modelos de demandas por categoria. */
export const TEMPLATES: Record<Category, Template[]> = {
  [Category.TI]: [
    {
      title: 'Notebook não liga',
      description:
        'O notebook não liga desde ontem, mesmo conectado na tomada. A luz do carregador acende normalmente.',
    },
    {
      title: 'Acesso à VPN',
      description: 'Preciso de acesso à VPN corporativa para trabalhar remotamente às sextas-feiras.',
    },
    {
      title: 'Instalação do pacote Office',
      description: 'Solicito a instalação do pacote Office no meu novo computador.',
    },
    {
      title: 'Reset de senha do e-mail',
      description: 'Esqueci a senha do e-mail corporativo e estou sem acesso desde hoje cedo.',
    },
    {
      title: 'Impressora do 2º andar não imprime',
      description: 'Os documentos ficam presos na fila de impressão e nada sai na impressora do 2º andar.',
    },
    {
      title: 'Acesso ao sistema ERP',
      description: 'Fui transferido para o time de compras e preciso de perfil de acesso ao ERP.',
    },
    {
      title: 'Troca de mouse e teclado',
      description: 'O teclado está com teclas falhando e o mouse com o clique duplo travando.',
    },
    {
      title: 'Lentidão no computador',
      description: 'O computador demora mais de 10 minutos para iniciar e trava ao abrir planilhas grandes.',
    },
    {
      title: 'Configuração de segundo monitor',
      description: 'Recebi um segundo monitor, mas o computador não o reconhece.',
    },
  ],
  [Category.RH]: [
    { title: 'Solicitação de férias', description: 'Solicito 15 dias de férias a partir do início do próximo mês.' },
    {
      title: 'Atualização de dados bancários',
      description: 'Gostaria de atualizar a conta para recebimento do salário.',
    },
    {
      title: 'Declaração de vínculo empregatício',
      description: 'Preciso de uma declaração de vínculo para apresentar no banco.',
    },
    {
      title: 'Inclusão de dependente no plano de saúde',
      description: 'Quero incluir meu filho recém-nascido como dependente no plano de saúde.',
    },
    {
      title: 'Dúvida sobre banco de horas',
      description: 'O saldo do banco de horas no holerite não confere com meus registros de ponto.',
    },
    {
      title: 'Ajuste de registro de ponto',
      description: 'Esqueci de registrar a saída na última quinta-feira e preciso ajustar o ponto.',
    },
    {
      title: 'Inscrição em treinamento',
      description: 'Gostaria de me inscrever no treinamento de liderança oferecido pela empresa.',
    },
  ],
  [Category.COMPRAS]: [
    { title: 'Compra de monitores', description: 'A equipe de design precisa de 3 monitores de 27 polegadas.' },
    {
      title: 'Cadeira ergonômica',
      description: 'Solicito uma cadeira ergonômica conforme recomendação médica enviada ao RH.',
    },
    {
      title: 'Licenças de software de design',
      description: 'Precisamos de 5 licenças anuais de software de design para o time de marketing.',
    },
    {
      title: 'Material de escritório',
      description: 'Reposição de canetas, blocos de notas, grampeadores e pastas para o setor financeiro.',
    },
    {
      title: 'Headsets para o atendimento',
      description: 'A central de atendimento precisa de 10 headsets com cancelamento de ruído.',
    },
    {
      title: 'Notebooks para novos colaboradores',
      description: 'Quatro colaboradores iniciam no próximo mês e precisam de notebooks.',
    },
    {
      title: 'Cafeteira para a copa',
      description: 'A cafeteira da copa do 3º andar quebrou e precisa ser substituída.',
    },
  ],
  [Category.FINANCEIRO]: [
    {
      title: 'Reembolso de viagem',
      description: 'Reembolso das despesas da viagem a São Paulo (hotel e alimentação). Notas fiscais em anexo.',
    },
    {
      title: 'Adiantamento para evento',
      description: 'Adiantamento para participação no evento de tecnologia em Belo Horizonte.',
    },
    {
      title: 'Pagamento de fornecedor em atraso',
      description: 'O fornecedor de limpeza informou que a nota fiscal do mês passado não foi paga.',
    },
    {
      title: 'Reembolso de quilometragem',
      description: 'Reembolso dos deslocamentos de carro próprio para visitas a clientes.',
    },
    {
      title: 'Emissão de nota fiscal',
      description: 'Solicito a emissão da nota fiscal referente ao contrato com o cliente Alfa.',
    },
    {
      title: 'Revisão de centro de custo',
      description: 'As despesas do projeto Beta estão lançadas no centro de custo errado.',
    },
  ],
  [Category.INFRAESTRUTURA]: [
    {
      title: 'Ar-condicionado com defeito',
      description: 'O ar-condicionado da sala de reuniões 2 está pingando e não resfria.',
    },
    { title: 'Troca de lâmpadas', description: 'Há lâmpadas queimadas no corredor do 3º andar.' },
    {
      title: 'Reserva de auditório',
      description: 'Reserva do auditório para o treinamento trimestral, com projetor e microfone.',
    },
    { title: 'Vazamento no banheiro', description: 'Há um vazamento na pia do banheiro masculino do 1º andar.' },
    {
      title: 'Cópia de chave da sala',
      description: 'Preciso de uma cópia da chave do almoxarifado para o novo responsável.',
    },
    { title: 'Manutenção da porta de vidro', description: 'A porta de vidro da recepção está emperrando ao fechar.' },
    {
      title: 'Mudança de layout da sala',
      description: 'O time comercial vai crescer e precisamos reorganizar as mesas da sala 5.',
    },
  ],
};

/** Gerador pseudoaleatório determinístico (mulberry32). */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/**
 * Status provável conforme a idade da solicitação: as antigas tendem a estar
 * concluídas e as recentes, abertas ou em atendimento.
 */
function pickStatus(ageInDays: number, random: () => number): RequestStatus {
  const roll = random();
  if (ageInDays > 30)
    return roll < 0.8 ? RequestStatus.CONCLUIDO : roll < 0.93 ? RequestStatus.EM_ATENDIMENTO : RequestStatus.ABERTO;
  if (ageInDays > 7)
    return roll < 0.45 ? RequestStatus.CONCLUIDO : roll < 0.8 ? RequestStatus.EM_ATENDIMENTO : RequestStatus.ABERTO;
  return roll < 0.15 ? RequestStatus.CONCLUIDO : roll < 0.5 ? RequestStatus.EM_ATENDIMENTO : RequestStatus.ABERTO;
}

export interface GenerateOptions {
  count?: number;
  days?: number;
  now?: Date;
  seed?: number;
}

/** Gera as solicitações fictícias com histórico de status coerente, ordenadas por data de abertura. */
export function generateRequests({
  count = 80,
  days = 90,
  now = new Date(),
  seed = 20261001,
}: GenerateOptions = {}): SeedRequest[] {
  const random = createRandom(seed);
  const pick = <T>(items: T[]): T => items[Math.floor(random() * items.length)];

  const requesters = SEED_USERS.filter((u) => u.role === Role.COLABORADOR).map((u) => u.username);
  const attendants = SEED_USERS.filter((u) => u.role === Role.ATENDENTE).map((u) => u.username);
  const categories = Object.values(Category);
  const nowMs = now.getTime();

  const requests: SeedRequest[] = [];

  for (let i = 0; i < count; i++) {
    const category = pick(categories);
    const template = pick(TEMPLATES[category]);
    const requester = pick(requesters);

    // Abertura em horário comercial (8h às 18h) dentro da janela de dias.
    const opened = new Date(nowMs - Math.floor(random() * days) * DAY);
    opened.setHours(8 + Math.floor(random() * 10), Math.floor(random() * 60), 0, 0);
    const createdAt = new Date(Math.min(opened.getTime(), nowMs - HOUR));

    const ageInDays = (nowMs - createdAt.getTime()) / DAY;
    const status = pickStatus(ageInDays, random);
    const attendant = pick(attendants);

    const history: SeedHistoryEntry[] = [
      { fromStatus: null, toStatus: RequestStatus.ABERTO, changedBy: requester, changedAt: createdAt },
    ];

    if (status !== RequestStatus.ABERTO) {
      // Atendimento inicia entre 1h e 2 dias após a abertura (nunca no futuro).
      const startedMs = Math.min(createdAt.getTime() + HOUR + random() * 2 * DAY, nowMs - 30 * 60 * 1000);
      const startedAt = new Date(Math.max(startedMs, createdAt.getTime() + 60 * 1000));
      history.push({
        fromStatus: RequestStatus.ABERTO,
        toStatus: RequestStatus.EM_ATENDIMENTO,
        changedBy: attendant,
        changedAt: startedAt,
      });

      if (status === RequestStatus.CONCLUIDO) {
        // Conclusão entre 2h e 7 dias após o início do atendimento.
        const finishedMs = Math.min(startedAt.getTime() + 2 * HOUR + random() * 7 * DAY, nowMs - 60 * 1000);
        const finishedAt = new Date(Math.max(finishedMs, startedAt.getTime() + 60 * 1000));
        history.push({
          fromStatus: RequestStatus.EM_ATENDIMENTO,
          toStatus: RequestStatus.CONCLUIDO,
          changedBy: attendant,
          changedAt: finishedAt,
        });
      }
    }

    requests.push({
      title: template.title,
      description: template.description,
      category,
      status,
      requester,
      createdAt,
      updatedAt: history[history.length - 1].changedAt,
      history,
    });
  }

  return requests.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

import type { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, type DeepMockProxy } from 'jest-mock-extended';
import { prisma } from '../src/lib/prisma';

// Substitui o PrismaClient real por um mock profundo: os testes não dependem de banco de dados.
jest.mock('../src/lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
  // $transaction com array: resolve cada operação na ordem.
  prismaMock.$transaction.mockImplementation(((operations: unknown) =>
    Promise.all(operations as Promise<unknown>[])) as never);
});

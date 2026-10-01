/**
 * Erro de domínio com status HTTP associado.
 * Lançado pelos services e convertido em resposta pelo errorHandler.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

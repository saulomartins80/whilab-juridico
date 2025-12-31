// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../core/errors/AppError';
import logger from '../utils/logger';

interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  details?: any;
  stack?: string;
  timestamp: string;
  path: string;
  method: string;
}

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const timestamp = new Date().toISOString();
  const errorResponse: ErrorResponse = {
    success: false,
    message: 'Erro interno no servidor',
    timestamp,
    path: req.path,
    method: req.method,
  };

  // Redação de dados sensíveis antes do log
  const redact = (obj: any) => {
    try {
      const clone = JSON.parse(JSON.stringify(obj || {}));
      const redactKeys = ['authorization', 'token', 'password', 'senha', 'access_token', 'refresh_token'];
      const walk = (o: any) => {
        if (!o || typeof o !== 'object') return;
        for (const k of Object.keys(o)) {
          const v = o[k];
          if (redactKeys.includes(k.toLowerCase())) {
            o[k] = 'REDACTED';
          } else if (typeof v === 'object') {
            walk(v);
          }
        }
      };
      walk(clone);
      return clone;
    } catch {
      return undefined;
    }
  };

  // Log detalhado do erro (com redação)
  logger.error('API Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: redact(req.body),
    params: redact(req.params),
    query: redact(req.query),
    headers: redact({ authorization: req.get('authorization') })
  });

  // Tratamento específico para diferentes tipos de erro
  if (error instanceof AppError) {
    errorResponse.message = error.message;
    errorResponse.details = error.details;

    res.status(error.statusCode).json(errorResponse);
    return;
  }

  // Erros de validação
  if (error.name === 'ValidationError') {
    errorResponse.message = 'Dados de entrada inválidos';
    errorResponse.error = 'VALIDATION_ERROR';
    errorResponse.details = error.message;

    res.status(400).json(errorResponse);
    return;
  }

  // Erros de banco de dados
  if (error.message.includes('Could not find the table') ||
      error.message.includes('relation') ||
      error.message.includes('does not exist')) {
    errorResponse.message = 'Erro de configuração do banco de dados';
    errorResponse.error = 'DATABASE_ERROR';

    res.status(503).json(errorResponse);
    return;
  }

  // Erros de autenticação/autorização
  if (error.message.includes('auth') || error.message.includes('token')) {
    errorResponse.message = 'Erro de autenticação';
    errorResponse.error = 'AUTH_ERROR';

    res.status(401).json(errorResponse);
    return;
  }

  // Erro genérico - apenas mostrar em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
  }

  // Em produção, não expor detalhes internos
  if (process.env.NODE_ENV === 'production') {
    errorResponse.message = 'Erro interno no servidor';
    errorResponse.error = 'INTERNAL_ERROR';
  } else {
    errorResponse.message = error.message;
    errorResponse.error = 'INTERNAL_ERROR';
  }

  res.status(500).json(errorResponse);
}

// Middleware para capturar erros 404
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error = new Error(`Rota não encontrada: ${req.originalUrl}`);
  res.status(404);
  next(error);
}
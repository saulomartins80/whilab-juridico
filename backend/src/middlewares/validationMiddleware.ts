// src/middlewares/validationMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import logger from '../utils/logger';

// Validações comuns
export const validateLogin = [
  body('email')
    .isLength({ min: 5, max: 255 })
    .withMessage('Email deve ter entre 5 e 255 caracteres')
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .withMessage('Email deve ter formato válido (exemplo@dominio.com)'),

  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Senha deve ter entre 6 e 128 caracteres'),
];

export const validateRegistration = [
  body('email')
    .isLength({ min: 5, max: 255 })
    .withMessage('Email deve ter entre 5 e 255 caracteres')
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .withMessage('Email deve ter formato válido (exemplo@dominio.com)'),

  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Senha deve ter entre 8 e 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra minúscula, maiúscula e um número'),

  body('display_name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),

  body('fazenda_nome')
    .isLength({ min: 2, max: 255 })
    .withMessage('Nome da fazenda deve ter entre 2 e 255 caracteres'),
];

export const validateAnimal = [
  body('brinco')
    .isLength({ min: 1, max: 50 })
    .withMessage('Brinco deve ter entre 1 e 50 caracteres')
    .matches(/^[A-Za-z0-9\-]+$/)
    .withMessage('Brinco deve conter apenas letras, números e hífen'),

  body('raca')
    .isLength({ min: 2, max: 100 })
    .withMessage('Raça deve ter entre 2 e 100 caracteres'),

  body('sexo')
    .isIn(['macho', 'femea'])
    .withMessage('Sexo deve ser macho ou femea'),

  body('data_nascimento')
    .isISO8601()
    .withMessage('Data de nascimento deve ser válida'),

  body('peso_nascimento')
    .optional()
    .isNumeric()
    .withMessage('Peso de nascimento deve ser numérico'),

  body('peso_atual')
    .optional()
    .isNumeric()
    .withMessage('Peso atual deve ser numérico'),

  body('categoria')
    .optional()
    .isIn(['bezerro', 'novilho', 'boi', 'bezerra', 'novilha', 'vaca'])
    .withMessage('Categoria inválida'),

  body('valor_compra')
    .optional()
    .isNumeric()
    .withMessage('Valor de compra deve ser numérico'),

  body('lote')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Lote deve ter entre 1 e 100 caracteres'),

  body('pasto')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Pasto deve ter entre 1 e 100 caracteres'),
];

export const validateManejo = [
  body('animal_id')
    .isUUID()
    .withMessage('ID do animal deve ser um UUID válido'),

  body('tipo_manejo')
    .isIn(['vacinacao', 'vermifugacao', 'pesagem', 'reproducao', 'tratamento'])
    .withMessage('Tipo de manejo inválido'),

  body('data_manejo')
    .isISO8601()
    .withMessage('Data do manejo deve ser válida'),

  body('custo')
    .optional()
    .isNumeric()
    .withMessage('Custo deve ser numérico'),

  body('produto_usado')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Produto deve ter entre 1 e 255 caracteres'),

  body('dosagem')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Dosagem deve ter entre 1 e 100 caracteres'),

  body('observacoes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Observações deve ter no máximo 1000 caracteres'),
];

// Middleware de validação geral
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    logger.warn('Dados de entrada inválidos', {
      errors: errors.array(),
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(400).json({
      success: false,
      message: 'Dados de entrada inválidos',
      errors: errors.array().map(error => ({
        field: (error as any).path || (error as any).param || 'unknown',
        message: error.msg,
        value: (error as any).value || undefined,
      })),
    });
    return;
  }

  next();
};

// Middleware para sanitizar dados de entrada
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  // Remover espaços em branco do início e fim de strings
  const sanitizeStrings = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.trim();
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitizeStrings);
    }

    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeStrings(value);
      }
      return sanitized;
    }

    return obj;
  };

  req.body = sanitizeStrings(req.body);
  // Evitar reatribuir req.query/req.params (somente mutação segura)
  try {
    const sanitizedQuery = sanitizeStrings(req.query);
    if (sanitizedQuery && typeof sanitizedQuery === 'object') {
      Object.assign(req.query as any, sanitizedQuery);
    }
  } catch {}
  try {
    const sanitizedParams = sanitizeStrings(req.params);
    if (sanitizedParams && typeof sanitizedParams === 'object') {
      Object.assign(req.params as any, sanitizedParams);
    }
  } catch {}

  next();
};

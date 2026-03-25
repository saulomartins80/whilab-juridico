import winston from 'winston';
import path from 'path';

// FormataÃ§Ã£o personalizada
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }

    if (stack) {
      log += `\n${stack}`;
    }

    return log;
  })
);

// ConfiguraÃ§Ã£o de logs baseada no ambiente
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// ConfiguraÃ§Ã£o dos transports
const transports: winston.transport[] = [];

// Console - sempre ativo, mas diferente para produÃ§Ã£o
if (isDevelopment) {
  transports.push(
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      )
    })
  );
} else {
  transports.push(
    new winston.transports.Console({
      level: 'info',
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      )
    })
  );
}

// Arquivo de erro - sempre ativo
transports.push(
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  })
);

// Arquivo geral - apenas em produÃ§Ã£o
if (isProduction) {
  transports.push(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    })
  );
}

const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
      format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports,
  exitOnError: false,
});

// FunÃ§Ãµes de log convenientes
export const logError = (message: string, error: Error | any, meta?: any): void => {
  logger.error(message, {
    error: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
    ...meta,
  });
};

export const logInfo = (message: string, meta?: any): void => {
  logger.info(message, meta);
};

export const logWarning = (message: string, meta?: any): void => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: any): void => {
  if (isDevelopment) {
    logger.debug(message, meta);
  }
};

export const logSubscriptionEvent = (event: string, data: any): void => {
  logger.info(`Subscription Event: ${event}`, {
    event,
    data,
  });
};

// Logs especÃ­ficos para WHILAB
export const logDatabaseOperation = (operation: string, table: string, meta?: any): void => {
  logger.info(`Database Operation: ${operation}`, {
    operation,
    table,
    ...meta,
  });
};

export const logApiRequest = (method: string, url: string, statusCode: number, duration?: number): void => {
  const level = statusCode >= 400 ? 'warn' : 'info';
  logger.log(level, 'API Request', {
    method,
    url,
    statusCode,
    duration,
  });
};

export const logChatbotInteraction = (userId: string, message: string, response: string, meta?: any): void => {
  logger.info('Chatbot Interaction', {
    userId,
    message,
    responseLength: response.length,
    ...meta,
  });
};

export default logger; 

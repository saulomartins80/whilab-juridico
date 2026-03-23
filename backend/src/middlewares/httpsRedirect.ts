import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para forcar redirecionamento HTTPS em producao.
 * Em plataformas como Railway, o healthcheck interno pode chegar via HTTP.
 */
export const httpsRedirect = (req: Request, res: Response, next: NextFunction): void => {
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  // Nao redireciona probes internos do orquestrador.
  if (req.path === '/health' || req.originalUrl === '/health') {
    return next();
  }

  const isHttps =
    req.secure ||
    req.headers['x-forwarded-proto'] === 'https' ||
    (req.socket && (req.socket as { encrypted?: boolean }).encrypted);

  if (!isHttps) {
    const httpsUrl = `https://${req.get('host')}${req.originalUrl}`;
    console.log(`[HTTPS] Redirecting ${req.originalUrl} to ${httpsUrl}`);
    return res.redirect(301, httpsUrl);
  }

  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Forwarded-Proto', 'https');

  next();
};

/**
 * Middleware para adicionar headers de seguranca relacionados ao HTTPS.
 */
export const httpsSecurityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Content-Security-Policy', 'upgrade-insecure-requests');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  }

  next();
};

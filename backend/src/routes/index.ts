import express from 'express';
import whilabRoutes from './whilabRoutes';
import { authRoutes } from './authRoutes';
import chatbotRoutes from './optimizedChatbotRoutes';
import automatedActionsRoutes from './automatedActions';
import { authenticateToken } from '../middlewares/auth';
import { createRateLimiters, sanitizeInput, validateMessageSize, validateOrigin, auditMiddleware, attackProtection } from '../middlewares/securityMiddleware';
import marketRoutes from './marketRoutes';
import encomendasRoutes from './encomendasRoutes';
import { BRAND_TEXT } from '../config/aiPrompts';

const router = express.Router();

// ==================== ROTAS PÃšBLICAS ====================
router.use('/api/auth', authRoutes);

// Health check pÃºblico
router.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: BRAND_TEXT.healthMessage,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Middleware de seguranÃ§a para o namespace do chatbot (aplicado antes das rotas autenticadas)
const { chatbotLimiter } = createRateLimiters();
router.use(
  '/api/chatbot',
  validateOrigin,
  chatbotLimiter,
  sanitizeInput,
  validateMessageSize,
  attackProtection,
  auditMiddleware
);

// ==================== ROTAS DO CHATBOT ====================
router.use('/api/chatbot', chatbotRoutes);
router.use('/api/automated-actions', automatedActionsRoutes);
router.use('/api', marketRoutes);
router.use('/api/encomendas', authenticateToken, encomendasRoutes);

// ==================== ROTAS PROTEGIDAS ====================
// Todas as rotas abaixo deste middleware requerem autenticaÃ§Ã£o
router.use('/api', authenticateToken, whilabRoutes);

export default router;


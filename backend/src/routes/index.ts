import express from 'express';
import bovinextRoutes from './bovinextRoutes';
import { authRoutes } from './authRoutes';
import chatbotRoutes from './optimizedChatbotRoutes';
import automatedActionsRoutes from './automatedActions';
import { authenticateToken } from '../middlewares/auth';
import { createRateLimiters, sanitizeInput, validateMessageSize, validateOrigin, auditMiddleware, attackProtection } from '../middlewares/securityMiddleware';
import marketRoutes from './marketRoutes';

const router = express.Router();

// ==================== ROTAS PÚBLICAS ====================
router.use('/api/auth', authRoutes);

// Health check público
router.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'BOVINEXT Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Middleware de segurança para o namespace do chatbot (aplicado antes das rotas autenticadas)
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

// ==================== ROTAS DO BOVI CHATBOT ====================
router.use('/api/chatbot', chatbotRoutes);
router.use('/api/automated-actions', automatedActionsRoutes);
router.use('/api', marketRoutes);

// ==================== ROTAS PROTEGIDAS ====================
// Todas as rotas abaixo deste middleware requerem autenticação
router.use('/api', authenticateToken, bovinextRoutes);

export default router;
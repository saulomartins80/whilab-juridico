import { Router } from 'express';
import { handleAutomatedActions, executeAction } from '../controllers/automatedActionsController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Rota para detectar e processar ações automatizadas
router.post('/detect', authenticateToken, handleAutomatedActions);

// Rota para executar ações confirmadas
router.post('/execute', authenticateToken, executeAction);

export default router;

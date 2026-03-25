import express from 'express';
import { AppError } from '../core/errors/AppError';
import { encomendasService } from '../services/EncomendasService';
import { AuthRequest } from '../types/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = express.Router();

const requireAuthenticatedUserId = (req: AuthRequest): string => {
  const userId = req.user?.uid;
  if (!userId) {
    throw new AppError(401, 'Nao autenticado');
  }

  return String(userId);
};

router.get(
  '/overview',
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = requireAuthenticatedUserId(req);
    const result = await encomendasService.getOverview(userId);
    res.json({ success: true, ...result });
  })
);

router.get(
  '/customers',
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = requireAuthenticatedUserId(req);
    const result = await encomendasService.listCustomers(userId);
    res.json({ success: true, ...result });
  })
);

router.post(
  '/customers',
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = requireAuthenticatedUserId(req);
    const customer = await encomendasService.createCustomer(userId, req.body || {});
    res.status(201).json({ success: true, data: customer });
  })
);

router.get(
  '/products',
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = requireAuthenticatedUserId(req);
    const result = await encomendasService.listProducts(userId);
    res.json({ success: true, ...result });
  })
);

router.post(
  '/products',
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = requireAuthenticatedUserId(req);
    const product = await encomendasService.createProduct(userId, req.body || {});
    res.status(201).json({ success: true, data: product });
  })
);

router.get(
  '/orders',
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = requireAuthenticatedUserId(req);
    const result = await encomendasService.listOrders(userId);
    res.json({ success: true, ...result });
  })
);

router.post(
  '/orders',
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = requireAuthenticatedUserId(req);
    const order = await encomendasService.createOrder(userId, req.body || {});
    res.status(201).json({ success: true, data: order });
  })
);

router.patch(
  '/orders/:id/status',
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = requireAuthenticatedUserId(req);
    const status = req.body?.status;
    const order = await encomendasService.updateOrderStatus(userId, String(req.params.id), status);
    res.json({ success: true, data: order });
  })
);

router.get(
  '/charges',
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = requireAuthenticatedUserId(req);
    const result = await encomendasService.listCharges(userId);
    res.json({ success: true, ...result });
  })
);

export default router;

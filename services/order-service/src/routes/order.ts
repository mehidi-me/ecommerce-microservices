import { Router } from 'express';
import { createOrder, getMyOrders, getOrder, updateOrderStatus } from '../controllers/orderController';

const router = Router();

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrder);
router.put('/:id/status', updateOrderStatus);

export default router;

import { Router } from 'express';
import express from 'express';
import { createPaymentIntent, stripeWebhook } from '../controllers/paymentController';

const router = Router();

// Webhook needs raw body — bypass json parser
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

router.post('/intent', createPaymentIntent);

export default router;

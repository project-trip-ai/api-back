import express from 'express';
import {checkout, webhook} from '../controllers/payementController';
const router = express.Router();
router.post('/checkout', checkout);
router.post('/webhook', webhook);
export default router;

import express from 'express';
import {checkout, webhook} from '../controllers/payementController';
const emailController = require('../controllers/emailController');
const router = express.Router();
router.post('/checkout', checkout);
router.post('/webhook', webhook);
router.post('/new-email', emailController.sendEmail);

export default router;

import express from 'express';
import {checkout, webhook} from '../controllers/payementController';
import {generateActivities} from '../controllers/aiController';
const emailController = require('../controllers/emailController');
const router = express.Router();
router.post('/checkout', checkout);
router.post('/webhook', webhook);
router.post('/new-email', emailController.sendEmail);
router.get('/ai/activities/:location', generateActivities);

export default router;

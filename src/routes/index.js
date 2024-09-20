import express from 'express';
import {checkout, webhook} from '../controllers/payementController';
import {
  getActivities,
  enrichItineraryWithPlaceDetails,
} from '../controllers/aiController';
const emailController = require('../controllers/emailController');
const router = express.Router();
router.post('/checkout', checkout);
router.post('/webhook', webhook);
router.post('/new-email', emailController.sendEmail);
router.get('/ai/generateActivities/:location', enrichItineraryWithPlaceDetails);
router.get('/ai/getActivities/:location/:type', getActivities);
export default router;

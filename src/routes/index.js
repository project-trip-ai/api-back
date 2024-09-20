const express = require('express');
const {checkout, webhook} = require('../controllers/payementController');
const {
  getActivities,
  enrichItineraryWithPlaceDetails,
} = require('../controllers/aiController');
const emailController = require('../controllers/emailController');
const router = express.Router();
router.post('/checkout', checkout);
router.post('/webhook', webhook);
router.post('/new-email', emailController.sendEmail);
router.get('/ai/generateActivities/:location', enrichItineraryWithPlaceDetails);
router.get('/ai/getActivities/:location/:type', getActivities);
module.exports = router;

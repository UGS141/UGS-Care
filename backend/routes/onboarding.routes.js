const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboarding.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All onboarding routes require authentication
router.use(authenticate);

// Get onboarding status and requirements
router.get('/status', onboardingController.getOnboardingStatus);
router.get('/requirements/:role', onboardingController.getOnboardingRequirements);
router.patch('/step', onboardingController.updateOnboardingStep);

// Role-specific onboarding endpoints
router.post('/patient', authorize('patient'), onboardingController.patientOnboarding);
router.post('/doctor', authorize('doctor'), onboardingController.doctorOnboarding);
router.post('/pharmacy', authorize('pharmacy'), onboardingController.pharmacyOnboarding);
router.post('/hospital', authorize('hospital'), onboardingController.hospitalOnboarding);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
    generateDiagnosticTest,
    submitTest,
    getImprovementPlan,
    createCustomTest,
    getTestById,
    getUserProfile,
    getTopics,
    updateProfile,
    reportQuestion,
    getDayQuestions,
    getUserAttempts,
    getTestAttemptDetails,
    getCodingPracticeQuestions,
    generateQuestionExplanation,
    advanceDSAProgression,
    submitPracticeQuestion
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { trackActivity } = require('../middleware/activityTracker'); // New

router.use(protect);
router.use(trackActivity); // Track activity on all student routes

router.get('/profile', getUserProfile);
router.get('/topics', getTopics);
router.get('/test/diagnostic', generateDiagnosticTest);
router.post('/test/custom', createCustomTest);
router.get('/test/:id', getTestById);
router.post('/test/submit', submitTest);
router.get('/plan', getImprovementPlan);
router.get('/plan/day/:dayNumber/questions', getDayQuestions);
router.get('/attempts', getUserAttempts);
router.get('/attempt/:attemptId', getTestAttemptDetails);
router.get('/practice/coding', getCodingPracticeQuestions);
router.post('/practice/submit', submitPracticeQuestion);
router.post('/question/report', reportQuestion);
router.post('/question/:id/explain', generateQuestionExplanation);
router.get('/documentation/:id', require('../controllers/studentController').getDocumentationById);
router.post('/activity/update', require('../controllers/studentController').updateActivityStats);
router.get('/activity/log', require('../controllers/studentController').getActivityLog);
router.put('/profile', updateProfile);
router.post('/dsa/advance', advanceDSAProgression);

module.exports = router;

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
    getTestAttemptDetails
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

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
router.post('/question/report', reportQuestion);
router.get('/documentation/:id', require('../controllers/studentController').getDocumentationById);
router.post('/activity/update', require('../controllers/studentController').updateActivityStats);
router.get('/activity/log', require('../controllers/studentController').getActivityLog);
router.put('/profile', updateProfile);

module.exports = router;

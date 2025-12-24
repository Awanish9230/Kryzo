const express = require('express');
const router = express.Router();
const {
    generateDiagnosticTest,
    submitTest,
    getImprovementPlan,
    createCustomTest,
    getTestById,
    getUserProfile,
    getTopics
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

module.exports = router;

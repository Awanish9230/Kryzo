const express = require('express');
const router = express.Router();
const {
    getStats,
    getDetailedStats, // New
    createQuestion,
    getQuestions,
    updateQuestion,
    deleteQuestion,
    getAllUsers,
    deleteUser,
    updateUser,
    createUser,
    getQuestionById,
    createDocumentation,
    getAllDocumentation,
    deleteDocumentation,
    getAdminQuestionStats,
    bulkUploadQuestions,
    getQuestionReports,
    updateReportStatus,
    getPainPointAnalytics
} = require('../controllers/adminController');
const {
    getSettings,
    updateSettings
} = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);
router.use(admin);

router.get('/stats', getStats);
router.get('/detailed-stats', getDetailedStats); // New

router.route('/questions')
    .post(createQuestion)
    .get(getQuestions);

router.post('/questions/bulk', bulkUploadQuestions);

router.route('/questions/:id')
    .get(getQuestionById)
    .put(updateQuestion)
    .delete(deleteQuestion);

router.get('/questions/reports', getQuestionReports);
router.put('/questions/reports/:id', updateReportStatus);

router.route('/users')
    .get(getAllUsers)
    .post(createUser);

router.route('/users/:id')
    .put(updateUser)
    .delete(deleteUser);

router.get('/my-stats', getAdminQuestionStats);
router.get('/analytics/pain-points', getPainPointAnalytics);

router.route('/documentation')
    .get(getAllDocumentation)
    .post(createDocumentation);

router.delete('/documentation/:id', deleteDocumentation);

// System Settings
router.route('/settings')
    .get(getSettings)
    .put(updateSettings);

module.exports = router;

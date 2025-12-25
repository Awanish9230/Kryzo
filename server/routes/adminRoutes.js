const express = require('express');
const router = express.Router();
const {
    getStats,
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
    getAdminQuestionStats
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);
router.use(admin);

router.get('/stats', getStats);

router.route('/questions')
    .post(createQuestion)
    .get(getQuestions);

router.post('/questions/bulk', bulkUploadQuestions);

router.route('/questions/:id')
    .get(getQuestionById)
    .put(updateQuestion)
    .delete(deleteQuestion);

router.route('/users')
    .get(getAllUsers)
    .post(createUser);

router.route('/users/:id')
    .put(updateUser)
    .delete(deleteUser);

router.get('/my-stats', getAdminQuestionStats);

router.route('/documentation')
    .get(getAllDocumentation)
    .post(createDocumentation);

router.delete('/documentation/:id', deleteDocumentation);

module.exports = router;

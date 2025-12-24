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
    getQuestionById
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);
router.use(admin);

router.get('/stats', getStats);

router.route('/questions')
    .post(createQuestion)
    .get(getQuestions);

router.route('/questions/:id')
    .get(getQuestionById)
    .put(updateQuestion)
    .delete(deleteQuestion);

router.route('/users')
    .get(getAllUsers);

router.route('/users/:id')
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;

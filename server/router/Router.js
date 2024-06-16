const Router = require('express');
const userController = require('../controllers/user-controller');
const lectionController = require('../controllers/lection-controller');
const testController = require('../controllers/test-controller');
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/auth-middleware');
const roleMiddleware = require('../middlewares/role-middleware');
const statisticsController = require('../controllers/statistics-controller');

const router = new Router();

router.post('/registration',
    body('email').isEmail(),
    body('password').isLength({ min: 3, max: 32 }),
    userController.registration
);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.post('/refresh', userController.refresh);
router.get('/refresh', userController.refresh); // Added this route
router.get('/activate/:link', userController.activate);
router.get('/users', authMiddleware, userController.getUsers);

router.post('/createLections',
    authMiddleware,
    roleMiddleware(['teacher']),
    body('title').notEmpty().withMessage('Title is required'),
    body('theme').notEmpty().withMessage('Theme is required'),
    body('body').notEmpty().withMessage('Body is required'),
    lectionController.createLection
);
router.delete('/deleteLection/:lectionId', authMiddleware, roleMiddleware(['teacher']), lectionController.deleteLection);
router.put('/updateLections/:lectionId',
    authMiddleware,
    roleMiddleware(['teacher']),
    body('title').optional().notEmpty(),
    body('theme').optional().notEmpty(),
    lectionController.updateLection
);
router.get('/getLections', lectionController.getAllLections);
router.get('/getlection/:lectionId', lectionController.getLection);

router.post('/lections/:lectionId/tests/:testId', lectionController.addTestToLection);

router.get('/tests/:testId', testController.getTestById);
router.get('/tests', testController.getTestsByLection);
router.post('/tests', authMiddleware, roleMiddleware(['teacher']), testController.createTest);
router.post('/tests/:testId/questions', authMiddleware, roleMiddleware(['teacher']), testController.addQuestion);
router.post('/tests/:testId/answers', authMiddleware, roleMiddleware(['student']), testController.saveStudentAnswers);
router.put('/tests/:testId', authMiddleware, roleMiddleware(['teacher']), testController.updateTest);
router.post('/tests/:testId/questions', authMiddleware, roleMiddleware(['teacher']), testController.addQuestion);
router.delete('/tests/:testId/questions/:questionId', authMiddleware, roleMiddleware(['teacher']), testController.deleteQuestion);
router.get('/lections/:lectionId/tests', testController.getTestsByLection);
router.get('/tests', testController.getAllTests);
router.get('/tests/:testId', testController.getTestById);

router.get('/tests/:testId/questions', testController.getQuestionsByTestId);

router.post('/tests/:testId/answers', authMiddleware, roleMiddleware(['student']), testController.saveStudentAnswers);
router.get('/tests/:testId/answers/:studentId', authMiddleware, roleMiddleware(['teacher']), testController.getStudentAnswers);

router.get('/statistics', authMiddleware, roleMiddleware(['teacher']), statisticsController.getStatistics);
router.get('/student-answers/:studentId', authMiddleware, roleMiddleware(['teacher']), statisticsController.getStudentAnswers);

module.exports = router;

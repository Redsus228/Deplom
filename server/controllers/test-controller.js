const TestService = require('../service/test-service.js');
const apiError = require('../exceptions/api-error.js');
const { validationResult } = require('express-validator');

class TestController {
    async createTest(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(apiError.BadRequest('Ошибка создания теста', errors.array()));
            }
            console.log('Received test data:', req.body);  // Логирование полученных данных
            const newTest = await TestService.createTest(req.body, req.user.id);
            res.json(newTest);
        } catch (error) {
            console.error('Error creating test:', error);  // Логирование ошибки
            next(apiError.BadRequest(error.message));
        }
    }
    
    async deleteTest(req, res, next) {
        try {
            const test = await TestService.deleteTest(req.params.testId);
            if (!test) {
                return next(apiError.BadRequest('Тест не найден!'));
            }
            res.json(test);
            console.log('test deleted!');
        } catch (error) {
            console.log(error);
            next(apiError.BadRequest(error.message));
        }
    }

    async addQuestion(req, res, next) {
        try {
            const { testId } = req.params;
            const questionData = req.body;
            console.log(`Добавление вопроса к тесту с ID: ${testId}`);
            console.log(`Данные вопроса: ${JSON.stringify(questionData)}`);
            const updatedTest = await TestService.addQuestionToTest(testId, questionData);
            res.json(updatedTest);
        } catch (error) {
            console.error(`Ошибка при добавлении вопроса: ${error.message}`);
            next(apiError.BadRequest('Ошибка при добавлении вопроса', error.message));
        }
    }

    async deleteQuestion(req, res, next) {
        try {
            const { testId, questionId } = req.params;
            console.log(`Deleting question ${questionId} from test ${testId}`);
            const result = await TestService.deleteQuestionFromTest(testId, questionId);
            if (!result) {
                return next(apiError.BadRequest('Вопрос не найден или уже удален!'));
            }
            res.status(200).json({ message: 'Вопрос удален' });
        } catch (error) {
            console.error('Error deleting question:', error);
            next(apiError.BadRequest('Ошибка при удалении вопроса'));
        }
    }

    async getQuestionsByTestId(req, res, next) {
        try {
            const { testId } = req.params;
            console.log(`Получение вопросов для теста с ID: ${testId}`);
            const questions = await TestService.getQuestionsByTestId(testId);
            res.json(questions);
        } catch (error) {
            console.error(`Ошибка при получении вопросов: ${error.message}`);
            next(apiError.BadRequest(error.message));
        }
    }

    async updateTest(req, res, next) {
        try {
            const test = await TestService.updateTest(req.params.testId, req.body);
            res.json(test);
            console.log('test updated!');
        } catch (error) {
            console.log(error);
            next(apiError.BadRequest(error.message));
        }
    }
    async getTestsByLection(req, res, next) {
        try {
            const tests = await TestService.getTestsByLection(req.params.lectionId);
            res.json(tests);
            console.log('tests fetched!');
        } catch (error) {
            next(apiError.BadRequest(error.message));
        }
    }

    async getTestById(req, res, next) {
        const { testId } = req.params;
        console.log(`Fetching test with ID: ${testId}`);
        try {
            const test = await TestService.getTestById(testId);
            if (!test) {
                console.log(`Test not found with ID: ${testId}`);
                return res.status(404).json({ message: 'Test not found' });
            }
            console.log("Fetched test:", test);
            return res.json(test);
        } catch (error) {
            console.error("Error fetching test by ID:", error);
            return next(apiError.BadRequest('Error fetching test by ID', error.message));
        }
    }

    async getAllTests(req, res, next) {
        try {
            const tests = await TestService.getAllTests();
            res.json(tests);
            console.log('all tests fetched!');
        } catch (error) {
            next(error);
        }
    }

    async saveStudentAnswers(req, res, next) {
        try {
            const { testId } = req.params;
            const { answers, group } = req.body; // Получаем группу из тела запроса
            const studentId = req.user.id;

            console.log('Полученные п��раметры:', req.params);
            console.log('Полученные ответы:', answers);
            console.log('ID студента:', studentId);
            console.log('Группа студента:', group); // Логирование группы студента

            if (!answers || !Array.isArray(answers)) {
                console.error('Ответы не предоставлены или имеют неверный формат');
                return next(apiError.BadRequest('Ответы не предоставлены или имеют неверный формат'));
            }

            const result = await TestService.saveStudentAnswers(testId, studentId, answers, group);
            res.json(result);
        } catch (error) {
            console.error('Ошибка при сохранении ответов:', error);
            next(apiError.BadRequest('Ошибка при сохранении ответов'));
        }
    }

    async getStudentAnswers(req, res, next) {
        try {
            const { studentId } = req.params;
            console.log(`Получение ответов для студента с ID: ${studentId}`);
            const result = await TestService.getStudentAnswers(studentId);
            console.log(`Успешно получены ответы для студента с ID: ${studentId}`, result);
            res.json(result);
        } catch (error) {
            console.error('Ошибка при получении ответов:', error);
            next(apiError.BadRequest('Ошибка при получении ответов'));
        }
    }

    async getStatistics(req, res, next) {
        try {
            const statistics = await TestService.getStatistics();
            res.json(statistics);
        } catch (error) {
            next(apiError.BadRequest('Ошибка при получении статистики', error.message));
        }
    }

    
}   

module.exports = new TestController();

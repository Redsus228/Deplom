const TestService = require('../service/test-service');
const ApiError = require('../exceptions/api-error');

class StatisticsController {
    async getStatistics(req, res, next) {
        try {
            const statistics = await TestService.getStatistics();
            res.json(statistics);
        } catch (error) {
            next(ApiError.BadRequest('Ошибка при получении статистики', error.message));
        }
    }

    async getStudentAnswers(req, res, next) {
        try {
            const { studentId } = req.params;
            const answers = await TestService.getStudentAnswers(studentId);
            res.json(answers);
        } catch (error) {
            next(ApiError.BadRequest('Ошибка при получении ответов студента', error.message));
        }
    }
}

module.exports = new StatisticsController();

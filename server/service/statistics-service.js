const CouchDB = require('../nano-coachDB');

class StatisticsService {
    async getStatisticsByGroup(groupId) {
        try {
            const statistics = await CouchDB.getStatisticsByGroupId(groupId);
            return statistics;
        } catch (error) {
            console.error('Ошибка при получении статистики:', error);
            throw new Error('Ошибка при получении статистики');
        }
    }
}
module.exports = StatisticsService;



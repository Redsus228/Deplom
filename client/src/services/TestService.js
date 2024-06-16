import $api from "../http";

class TestService {
    async createTest(test) {
        return $api.post('/tests', test);
    }
    async deleteTest(testId) {
        return $api.delete(`/tests/${testId}`);
    }
    async addQuestion(testId, questionData) {
        return $api.post(`/tests/${testId}/questions`, questionData);
    }
    async getQuestionsByTestId(testId) {
        return $api.get(`/tests/${testId}/questions`);
    }
    async deleteQuestion(testId, questionId) {
        return $api.delete(`/tests/${testId}/questions/${questionId}`);
    }
    async updateTest(testId, test) {
        return $api.put(`/tests/${testId}`, test);
    }
    async getTestsByLection(lectionId) {
        return $api.get(`/lections/${lectionId}/tests`);
    }
    async getTestById(testId) {
        return $api.get(`/tests/${testId}`);
    }
    async saveStudentAnswers(testId, answers, group) {
        return $api.post(`/tests/${testId}/answers`, { answers, group });
    }
   

    async getStatistics() {
        return $api.get('/statistics');
    }

    async getStudentAnswers(studentId) {
        return $api.get(`/student-answers/${studentId}`);
    }
}

export default new TestService();



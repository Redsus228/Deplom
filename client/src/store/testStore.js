import { makeAutoObservable, runInAction } from 'mobx';
import TestService from '../services/TestService';

class TestStore {
    _tests = [];
    isLoading = false;
    error = null;
    currentTest = null;
    statistics = [];

    constructor() {
        makeAutoObservable(this);
    }

    getTestById = async (testId) => {
        this.isLoading = true;
        this.error = null;
        try {
            const response = await TestService.getTestById(testId);
            runInAction(() => {
                this.currentTest = response.data;
            });
            return response.data;
        } catch (error) {
            runInAction(() => {
                this.error = error.toString();
            });
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    };

    updateTest = async (testId, updatedData) => {
        try {
            const response = await TestService.updateTest(testId, updatedData);
            runInAction(() => {
                const index = this._tests.findIndex(test => test._id === testId);
                if (index !== -1) {
                    this._tests[index] = response.data;
                }
                if (this.currentTest && this.currentTest._id === testId) {
                    this.currentTest = response.data;
                }
            });
            return response.data;
        } catch (error) {
            runInAction(() => {
                this.error = error.toString();
            });
            return null;
        }
    };

    deleteQuestion = async (testId, questionId) => {
        console.log("Received testId:", testId, "and questionId:", questionId);
        try {
            const response = await TestService.deleteQuestion(testId, questionId);
            console.log("Delete response:", response);
            runInAction(() => {
                if (this.currentTest) {
                    this.currentTest.questions = this.currentTest.questions.filter(q => q.id !== questionId);
                }
            });
            return response;
        } catch (error) {
            console.error("Error deleting question:", error);
            runInAction(() => {
                this.error = error.toString();
            });
            return null;
        }
    };

    addQuestion = async (testId, questionData) => {
        try {
            const response = await TestService.addQuestion(testId, questionData);
            runInAction(() => {
                if (this.currentTest && this.currentTest._id === testId) {
                    this.currentTest.questions.push(response.data);
                }
            });
            return response.data;
        } catch (error) {
            runInAction(() => {
                this.error = error.toString();
            });
            return null;
        }
    };

    getQuestionsByTestId = async (testId) => {
        this.isLoading = true;
        this.error = null;
        try {
            const response = await TestService.getQuestionsByTestId(testId);
            runInAction(() => {
                this.currentTest = response.data;
            });
            return response.data;
        } catch (error) {
            runInAction(() => {
                this.error = error.toString();
            });
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    };

    getTestsByLection = async (lectionId) => {
        this.isLoading = true;
        this.error = null;
        try {
            const response = await TestService.getTestsByLection(lectionId);
            runInAction(() => {
                this._tests = response.data || [];
            });
        } catch (error) {
            runInAction(() => {
                this.error = error.toString();
            });
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    };

    createTest = async (testData) => {
        try {
            const response = await TestService.createTest(testData);
            runInAction(() => {
                if (this._tests.length === 0) {
                    this._tests = [];
                }
                this._tests.push(response.data);
            });
        } catch (error) {
            runInAction(() => {
                this.error = error.toString();
            });
        }
    };

    async deleteTest(testId) {
        try {
            const response = await TestService.deleteTest(testId);
            console.log('Test deleted:', response.data); // Логирование ответа
            return response.data;
        } catch (error) {
            console.error('Error deleting test:', error.response?.data?.message || error.message);
            throw error;
        }
    }
    async saveStudentAnswers(testId, studentId, firstName, middleName, lastName, answers, group) {
        try {
            const response = await TestService.saveStudentAnswers(testId, studentId, answers, group);
            runInAction(() => {
                // Найдите тест в массиве и обновите его, вместо добавления нового
                const index = this._tests.findIndex(test => test._id === testId);
                if (index !== -1) {
                    this._tests[index] = { ...this._tests[index], ...response.data };
                } else {
                    this._tests.push(response.data);
                }
            });
            return response.data;
        } catch (error) {
            console.error('Ошибка при сохранении ответов:', error);
        }
    }

    async getStudentAnswers(testId, studentId) {
        try {
            const response = await TestService.getStudentAnswers(testId, studentId);
            console.log('Received data:', response.data);  // Добавьте логирование для отладки
            return response.data;
        } catch (error) {
            console.error('Ошибка при получении ответов студента:', error);
        }
    }

    async getStatistics() {
        try {
            const response = await TestService.getStatistics();
            console.log('Data from TestService:', response); // Логирование данных
            runInAction(() => {
                this.statistics = Array.isArray(response.data) ? response.data : [];
            });
            return response;
        } catch (error) {
            console.error('Ошибка при получении статистики:', error);
            runInAction(() => {
                this.statistics = [];
            });
        }
    }

    async getStudentAnswers(studentId) {
        try {
            const response = await TestService.getStudentAnswers(studentId);
            console.log('Received data:', response.data);  // Добавьте логирование для отладки
            return response.data;
        } catch (error) {
            console.error('Ошибка при получении ответов студента:', error);
        }
    }
}

const testStoreInstance = new TestStore();
export default testStoreInstance;

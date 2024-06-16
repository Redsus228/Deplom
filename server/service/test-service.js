const TestModel = require('../models/test-model');
const QuestionModel = require('../models/question-model');
const { v4: uuidv4 } = require('uuid');
const coachDB = require('../nano-coachDB.js');
const LectionModel = require('../models/lection-model');
const TestResultModel = require('../models/TestResultModel');
const User = require('../models/user-model'); // Импорт модели пользователя

class TestService {
    async createTest(testData) {
        try {
            const id = uuidv4(); 
            console.log("Creating test with lectionId:", testData.lectionId); 
            const newTest = new TestModel({
                id: id,
                title: testData.title, 
                lectionId: testData.lectionId,
                questions: testData.questions
            });
            const test = await coachDB.insert(newTest);

            
            const lection = await coachDB.get(testData.lectionId);
            if (lection) {
                lection.tests = lection.tests || [];
                if (!lection.tests.includes(test.id)) { // Проверка на наличие ID те
                    lection.tests.push(test.id);
                    await coachDB.insert(lection);
                }
            }

            return test;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async deleteTest(testId) {
        try {
            const test = await coachDB.get(testId);
            return await coachDB.destroy(testId, test._rev);
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async addQuestionToTest(testId, questionData) {
        try {
            const test = await coachDB.get(testId);
            const question = {
                id: uuidv4(),
                question: questionData.question,
                options: questionData.options,
                correctIndex: questionData.correctIndex,
                points: 1 // По умолчанию 1 балл
            };
            test.questions.push(question);
            const updatedTest = {
                ...test,
                _rev: test._rev 
            };
            await coachDB.insert(updatedTest);
            return question;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async updateTest(testId, testData) {
        try {
            const test = await coachDB.get(testId);
            const updatedTest = {
                ...test,
                ...testData,
                _rev: test._rev
            };
            await coachDB.insert(updatedTest);
            return updatedTest; 
        } catch (error) {
            console.log(error);
            throw new Error('Ошибка при обновлении теста');
        }
    }

    async deleteQuestionFromTest(testId, questionId) {
        try {
            const test = await coachDB.get(testId);
            if (!test) {
                throw new Error('Тест не найден');
            }
            console.log(`Initial questions length: ${test.questions.length}`);
            const initialLength = test.questions.length;
            test.questions = test.questions.filter(question => question.id !== questionId);
            console.log(`Updated questions length: ${test.questions.length}`);
            if (test.questions.length === initialLength) {
                throw new Error('Вопрос не найден');
            }
            await coachDB.insert(test);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async getQuestionsByTestId(testId) {
        try {
            const test = await coachDB.get(testId);
            return test.questions;
            console.log('questions fetched!');
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    

    async getTestsByLection(lectionId) {
        try {
            console.log("Fetching tests for lectionId:", lectionId); 
            const tests = await coachDB.find({
                selector: {
                    lectionId: lectionId,
                    type: 'test'
                }
            });
            if (tests.docs.length === 0) {
                console.log("No tests found for this lection or type mismatch");
                return null;
            }
            return tests.docs; 
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async getTestById(testId) {
        try {
            console.log("Fetching test with ID:", testId);
            const test = await coachDB.get(testId);
            if (!test || !test.title || !test.type || test.type !== 'test') {
                console.log("Test not found, does not have a title, or type is not 'test'");
                return null; 
            }
            return test;
        } catch (error) {
            console.log("Error fetching test with ID:", testId, error);
            return null;
        }
    }

    async getAllTests() {
        return await coachDB.find({});
    }

    async saveStudentAnswers(testId, studentId, answers, group) {
        try {
            const test = await coachDB.get(testId);
            if (!test) throw new Error('Тест не найден');

            const user = await User.findByPk(studentId);
            if (!user) throw new Error('Пользователь не найден');

            console.log('User group:', user.group); // Логирование группы пользователя

            const testTitle = test.title;

            const score = test.questions.reduce((acc, question, index) => {
                return question.correctIndex === answers[index] ? acc + 1 : acc;
            }, 0);

            const testResult = {
                type: 'result',
                studentId,
                firstName: user.firstName,
                middleName: user.middleName,
                lastName: user.lastName,
                testId,
                testTitle,
                lectionId: test.lectionId,
                score,
                passed: score >= test.questions.length / 2,
                date: new Date(),
                totalQuestions: test.questions.length,
                group: group || user.group // би��сь, что поле group передается и сохраняется
            };
            await coachDB.insert(testResult);

            return testResult;
        } catch (error) {
            console.error('Ошибка при сохранении ответов:', error);
            throw new Error('Ошибка при сохранении ответов');
        }
    }

    async getStudentAnswers(studentId) {
        try {
            console.log(`Запрос к базе данных для получения ответов студента с ID: ${studentId}`);
            const results = await coachDB.find({
                selector: {
                    type: 'result',
                    studentId: parseInt(studentId, 10) // Преобразование studentId в число
                }
            });
            console.log(`Успешно получены результаты из базы данных для студента с ID: ${studentId}`, results);
            if (results.docs.length === 0) {
                console.log(`Нет результатов для студента с ID: ${studentId}`);
                return { answers: [], averageScore: 0 };
            }
            const studentAnswers = results.docs.map(result => {
                const score = result.score;
                return {
                    testId: result.testId,
                    testTitle: result.testTitle,
                    date: new Date(result.date).toLocaleDateString(),
                    score,
                    passed: score >= result.totalQuestions / 2,
                    totalQuestions: result.totalQuestions,
                    firstName: result.firstName,
                    middleName: result.middleName,
                    lastName: result.lastName,
                    group: result.group
                };
            });
            const averageScore = studentAnswers.reduce((acc, answer) => acc + (answer.score / answer.totalQuestions) * 100, 0) / studentAnswers.length;
            console.log(`Успешно обработаны ответы для студента с ID: ${studentId}`, { answers: studentAnswers, averageScore });
            return { answers: studentAnswers, averageScore, firstName: studentAnswers[0].firstName, middleName: studentAnswers[0].middleName, lastName: studentAnswers[0].lastName, group: studentAnswers[0].group };
        } catch (error) {
            console.error('Ошибка при получении ответов студента:', error);
            throw new Error('Ошибка при получении ответов студента');
        }
    }

    async getStatistics() {
        try {
            const results = await coachDB.find({ selector: { type: 'result' } });
            const statistics = results.docs.map(result => ({
                studentId: result.studentId,
                studentEmail: result.studentId,
                testTitle: result.testTitle,
                date: new Date(result.date).toLocaleDateString(),
                score: result.score,
                averageScore: (result.score / 10) * 100,
                group: result.group,
                fullName: `${result.firstName} ${result.middleName} ${result.lastName}` // Добавьте ФИО
            }));
            return statistics;
        } catch (error) {
            console.error('Ошибка при получении статистики:', error);
            return [];
        }
    }
}

module.exports = new TestService();

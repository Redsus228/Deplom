const { v4: uuidv4 } = require('uuid');

class TestResultModel {
    constructor({ studentId, firstName, middleName, lastName, testId, lectionId, score, passed, date, totalQuestions, group }) {
        this._id = uuidv4();
        this.type = 'result';
        this.studentId = studentId;
        this.firstName = firstName;
        this.middleName = middleName;
        this.lastName = lastName;
        this.testId = testId;
        this.lectionId = lectionId;
        this.score = score;
        this.passed = passed;
        this.date = date;
        this.totalQuestions = totalQuestions;
        this.group = group; // Added group field
    }
}

module.exports = TestResultModel;
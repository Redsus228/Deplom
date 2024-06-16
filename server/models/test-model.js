const coachDB = require('../nano-coachDB.js');

class TestModel {
    constructor(testData) {
        this.id = testData.id;
        this.type = "test";
        this.title = testData.title;
        this.questions = testData.questions || [];
        this.lectionId = testData.lectionId;  // Теперь lectionId корректно инициализируется
        this.createdBy = testData.createdBy; // Added createdBy field
    }
}

module.exports = TestModel;


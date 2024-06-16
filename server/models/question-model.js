const { CoachDB } = require('../nano-coachDB.js');

class QuestionModel {
    constructor(id, questionText, options, correctOptionIndex) {
        this.id = id;
        this.type = "question";
        this.questionText = questionText;
        this.options = options;
        this.correctOptionIndex = correctOptionIndex;
    }
}


module.exports = QuestionModel;



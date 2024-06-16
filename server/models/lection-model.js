const coachDB = require('../nano-coachDB.js');

class LectionModel {
    constructor(data) {
        this._id = data._id; 
        this.type = "lection";
        this.title = data.title; 
        this.theme = data.theme; 
        this.body = data.body; 
        this.tests = data.tests || [];
    }
    
}

module.exports = LectionModel;

const LectionModel = require('../models/lection-model.js');
const { v4: uuidv4 } = require('uuid');
const coachDB = require('../nano-coachDB.js'); 

class LectionService {
    async createLection(lectionData) {
        try {
            const lectionId = uuidv4();
            const lection = new LectionModel({
                _id: lectionId,
                type: "lection",
                title: lectionData.title,
                theme: lectionData.theme,
                body: lectionData.body,
                tests: lectionData.tests || []
            });
            console.log(lection); 
            return await coachDB.insert(lection);
        } catch (error) {
            console.log(error);
            throw new Error('Ошибка при создании лекции');
        }
    }

    async deleteLection(lectionId) {
        try {
           
            const lection = await coachDB.get(lectionId);
            if (!lection) {
                console.error("Lection not found");
                return null;
            }

            
            if (lection.tests && lection.tests.length > 0) {
                for (const testId of lection.tests) {
                    const test = await coachDB.get(testId);
                    if (test) {
                        await coachDB.destroy(testId, test._rev); 
                    }
                }
            }

            
            return await coachDB.destroy(lectionId, lection._rev);
        } catch (error) {
            console.log(error);
            throw error; 
        }
    }

    async updateLection(lectionId, updateData) {
        try {

            const lection = await coachDB.get(lectionId);
            const updatedLection = {
                ...lection,
                ...updateData,
                _rev: lection._rev 
            };
            return await coachDB.insert(updatedLection); 
        } catch (error) {
            console.log(error);
        }
    }

    async getAllLections() {
        try {
            const result = await coachDB.list({ include_docs: true });
            return result.rows
                .filter(row => row.doc.type === "lection") 
                .map(row => row.doc);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getLection(lectionId) {
        try {
            return await coachDB.get(lectionId, "lection");
        } catch (error) {
            console.log(error);
        }
    }

    async addTestToLection(lectionId, testId) {
        const lection = await coachDB.get(lectionId);
        if (!lection) {
            return null; 
        }
        lection.tests.push(testId);
        const updatedLection = {
            ...lection,
            _rev: lection._rev
        };
        await coachDB.insert(updatedLection);
        return updatedLection;
    }
    
}

module.exports = new LectionService();


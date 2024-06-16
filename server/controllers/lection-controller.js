const lectionService = require('../service/lection-service.js');
const apiError = require('../exceptions/api-error.js');
const { validationResult } = require('express-validator');

class LectionController {
    async createLection(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(apiError.BadRequest('Ошибка создания лекции!', errors.array()));
            }
            const lectionData = req.body; // Получаем все данные лекции из тела запроса
            const lection = await lectionService.createLection(lectionData, req.user.id);
            res.status(201).json(lection);
        } catch (error) {
            next(error);
        }
    }

    async deleteLection(req, res, next) {
        try {
            const { lectionId } = req.params;
            const lection = await lectionService.deleteLection(lectionId);
            if (!lection) {
                return next(apiError.BadRequest('Лекция не найдена!'));
            }
            res.status(200).json({ message: 'Лекция удалена.' });
        } catch (error) {
            next(error);
        }
    }

    async updateLection(req, res, next) {
        try {
            const { lectionId } = req.params;
            const updateData = req.body;
            const lection = await lectionService.updateLection(lectionId, updateData);
            if (!lection) {
                return next(apiError.BadRequest('Лекция не найдена!'));
            }
            res.status(200).json(lection);
        } catch (error) {
            next(error);
        }
    }

    async getAllLections(req, res, next) {
        try {
            const lections = await lectionService.getAllLections();
            res.status(200).json(lections);
        } catch (error) {
            next(error);
        }
    }

    async getLection(req, res, next) {
        try {
            const { lectionId } = req.params;
            const lection = await lectionService.getLection(lectionId);
            if (!lection) {
                return next(apiError.BadRequest('Лекция не найдена!'));
            }
            res.status(200).json(lection);
        } catch (error) {
            next(error);
        }
    }

    async addTestToLection(req, res, next) {
        try {
            const { lectionId, testId } = req.params;
            const updatedLection = await lectionService.addTestToLection(lectionId, testId);
            if (!updatedLection) {
                return next(apiError.BadRequest('Лекция не найдена!'));
            }
            res.status(200).json(updatedLection);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new LectionController();

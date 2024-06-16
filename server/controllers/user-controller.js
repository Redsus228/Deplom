const UserService = require('../service/user-service');
const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/api-error');

class UserController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Validation error', errors.array()));
            }
            const { email, password, role, group, firstName, lastName, middleName } = req.body;
            if (!email || !password || !firstName || !lastName || !role) {
                return next(ApiError.BadRequest('Все поля, кроме отчества, должны быть заполнены'));
            }
            const userData = await UserService.registration(email, password, firstName, lastName, middleName, role, group);
            res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const userData = await UserService.login(email, password);
            res.cookie('refreshToken', userData.refreshToken, { httpOnly: true, sameSite: 'None' });
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {
        try {
            
            const { authorization } = req.headers;
            console.log('Authorization header:', authorization); // Логирование заголовка авторизации

            if (!authorization) {
                console.error('Authorization header is missing');
                throw ApiError.UnauthorizedError('Authorization header is missing');
            }

            const refreshToken = authorization.split(' ')[1];
            console.log('Refresh token:', refreshToken); // Логирование refresh token

            if (!refreshToken) {
                console.error('Refresh token is missing');
                throw ApiError.UnauthorizedError('Refresh token is missing');
            }

            await UserService.logout(refreshToken);
            res.clearCookie('refreshToken');
            console.log('Logout successful'); // Логирование успешного выхода
            return res.status(200).json({ message: 'Logout successful' });
        } catch (error) {
            console.error('Logout error:', error); // Логирование ошибки
            next(error);
        }
    }

    async refresh(req, res, next) {
        try {
            console.log('Запрос на обновление токена получен');
            const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
            if (!refreshToken) {
                console.log('Отсутствует refreshToken');
                throw ApiError.UnauthorizedError('Refresh token is missing');
            }
            const userData = await UserService.refresh(refreshToken);
            console.log('Токен успешно обновлен', userData);
            res.cookie('refreshToken', userData.refreshToken, { httpOnly: true, sameSite: 'None', secure: true });
            return res.json(userData);
        } catch (error) {
            console.error(`Ошибка при обновлении токена: ${error.message}`);
            res.status(401).json({ message: 'Ошибка при обновлении токена' });
        }
    }

    async activate(req, res, next) {
        try {
            const activationLink = req.params.link;
            await UserService.activate(activationLink);
            return res.redirect(process.env.CLIENT_URL);
        } catch (e) {
            next(e);
        }
    }

    async getUsers(req, res, next) {
        try {
            const users = await UserService.getAllUsers();
            return res.json(users);
        } catch (e) {
            next(e);
        }
    }
}
module.exports = new UserController();

const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('../service/mail-service');
const tokenService = require('../service/token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');

class UserService {
    generateActivationLink() {
        return uuid.v4(); // Используем библиотеку uuid для генерации уникальной ссылки
    }

    async registration(email, password, firstName, lastName, middleName, role, group) {
        console.log('Регистрация пользователя:', email, role);
        const candidate = await UserModel.findOne({ where: { email } });
        if (candidate) {
            throw ApiError.BadRequest(`Пользователь с email ${email} уже существует`);
        }
        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = this.generateActivationLink(); // Используем новую функцию для генерации ссылки
        const user = await UserModel.create({ email, password: hashPassword, firstName, lastName, middleName, role, isActivated: false, activationLink, group });
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });
        await tokenService.saveToken(user.id, tokens.refreshToken);
        console.log('Пользователь зарегистрирован:', userDto);
        return { ...tokens, user: userDto };
    }

    async activate(activationLink) {
        const user = await UserModel.findOne({ where: { activationLink } });
        if (!user) {
            throw new ApiError.BadRequest('User not found');
        }
        user.isActivated = true;
        await user.save();
    }

    async login(email, password) {
        const user = await UserModel.findOne({ where: { email } });
        if (!user) {
            throw ApiError.BadRequest('Пользователь с таким email не найден');
        }
        const isPassEquals = await bcrypt.compare(password, user.password);
        if (!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль');
        }
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });
        await tokenService.saveToken(user.id, tokens.refreshToken);
        return { ...tokens, user: userDto };
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);
        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }
        const user = await UserModel.findByPk(userData.id);
        const tokens = tokenService.generateTokens({ id: user.id, role: user.role });
        await tokenService.saveToken(user.id, tokens.refreshToken);
        console.log('Токены обновлены:', tokens);
        return { ...tokens, user };
    }

    async getAllUsers() {
        const users = await UserModel.findAll();
        return users;
    }
}

module.exports = new UserService();

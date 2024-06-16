const ApiError = require('../exceptions/api-error');
const tokenService = require('../service/token-service');

module.exports = function (req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        console.error('Authorization header is missing');
        return next(ApiError.UnauthorizedError('Authorization header is missing'));
    }

    const accessToken = authHeader.split(' ')[1];
    if (!accessToken) {
        console.error('Access token is missing');
        return next(ApiError.UnauthorizedError('Access token is missing'));
    }

    try {
        const userData = tokenService.validateAccessToken(accessToken);
        console.log('Decoded token data:', userData); // Логирование расшифрованных данных токена

        if (!userData) {
            console.error('Access token is invalid');
            return next(ApiError.UnauthorizedError('Access token is invalid'));
        }

        req.user = userData;
        console.log('User data set in req.user:', req.user); // Логирование данных пользователя, установленных в req.user

        if (!req.user.role) {
            console.error('User role is missing in token data');
            return next(ApiError.UnauthorizedError('User role is missing'));
        }

        next();
    } catch (e) {
        console.error('Error validating access token:', e);
        return next(ApiError.UnauthorizedError('An error occurred during authentication'));
    }
};

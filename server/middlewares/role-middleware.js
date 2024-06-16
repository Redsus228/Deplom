const ApiError = require('../exceptions/api-error');

module.exports = function (roles) {
    return function (req, res, next) {
        console.log('User role from req.user:', req.user.role); // Логирование роли пользователя

        if (!req.user || !req.user.role) {
            console.error('User role is undefined or missing');
            return next(ApiError.Forbidden('User role is undefined'));
        }

        if (!roles.includes(req.user.role)) {
            console.error(`Access denied for role: ${req.user.role}`);
            return next(ApiError.Forbidden('Access denied'));
        }

        console.log(`Access granted for role: ${req.user.role}`);
        next();
    };
};

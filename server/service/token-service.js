const jwt = require('jsonwebtoken')
const TokenModel = require('../models/token-model')
class TokenService{
    generateTokens(payload){
        const accessToken = jwt.sign(payload,process.env.JWT_ACCESS_SECRET, {expiresIn:'15m'})
        const refreshToken = jwt.sign(payload,process.env.JWT_REFRESH_SECRET, {expiresIn:'30d'})
        return{
            accessToken,
            refreshToken
        }
    }

    validateAccessToken(token){
        try {
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            console.log('Validated access token data:', userData); // Логирование данных токена
            return userData;
        } catch (e) {
            console.error('Error validating access token:', e); // Логирование ошибки
            return null;
        }
    }

    validateRefreshToken(token){
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            console.log('Validated refresh token data:', userData); // Логирование данных токена
            return userData;
        } catch (e) {
            console.error('Error validating refresh token:', e); // Логирование ошибки
            return null;
        }
    }

    async saveToken(userId,refreshToken) {
        if (!refreshToken) {
            throw new Error("refreshToken is undefined");
        }
        const tokenData = await TokenModel.findOne({ where: { userId } });
        if(tokenData){
            tokenData.refreshToken = refreshToken;
            return await tokenData.save();

        }
        const token = await TokenModel.create({userId,refreshToken})
        return token;

    }
    async removeToken(refreshToken) {
        if (!refreshToken) {
            throw new Error('Refresh token is required');
        }
        const tokenData = await TokenModel.destroy({ where: { refreshToken } });
        return tokenData;
    }
    

    async findToken(refreshToken){
        if (refreshToken == null) {
            throw new Error("refreshToken is required");
        }
        const tokenData = await TokenModel.findOne({where:{refreshToken}});
        return tokenData;
    }
}

module.exports = new TokenService();

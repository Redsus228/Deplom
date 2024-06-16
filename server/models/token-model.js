const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize')
const UserModel = require('./user-model');

const TokenModel = sequelize.define('Token', {
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: UserModel,
      key: 'id'
    }
  },
  refreshToken: {
    type: DataTypes.STRING(1024), // Increased length to 1024 characters
    allowNull: false
  }
});

TokenModel.belongsTo(UserModel, { foreignKey: 'userId' });

module.exports = TokenModel;

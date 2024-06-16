const { Sequelize, DataTypes } = require('sequelize');

const sequelize = require('../sequelize')

const UserModel = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    required: true,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    required: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  middleName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActivated: {
    type: DataTypes.BOOLEAN,
    default: false
  },
  activationLink: {
    type: DataTypes.STRING
  },
  role: {
    type: DataTypes.ENUM('student', 'teacher'),
    allowNull: false
  },
  group: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = UserModel;


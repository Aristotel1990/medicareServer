'use strict'
module.exports = (sequelize, DataTypes) => {
  const Token = sequelize.define(
    'Token',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      token: {
        type: DataTypes.STRING(1234)
      },
      refreshToken: {
        type: DataTypes.STRING(1234)
      },
      createdAt: {
        type: DataTypes.DATE
      },
      expireAt: {
        type: DataTypes.DATE
      }
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true
    }
  )

  Token.associate = function (models) {
    Token.belongsTo(models.User, {
      foreignKey: 'usersId',
      target: 'id',
      as: 'user'
    })
  }

  return Token
}

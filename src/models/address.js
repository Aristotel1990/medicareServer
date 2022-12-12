"use strict";

module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define(
    "Address",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
      },
      cityId: {
        type: DataTypes.INTEGER,
      },
      isPrimary: {
        type: DataTypes.BOOLEAN,
      },
      zip: {
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.STRING,
      },
      address2: {
        type: DataTypes.STRING,
      },
      note: {
        type: DataTypes.TEXT,
      },
      phone: {
        type: DataTypes.STRING,
      },
      lat: {
        type: DataTypes.STRING,
      },
      lng: {
        type: DataTypes.STRING,
      },
      userId: {
        type: DataTypes.INTEGER,
      },
      accountId: {
        type: DataTypes.INTEGER,
      },
      createdAt: {
        type: DataTypes.DATE,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
      deletedAt: {
        type: DataTypes.DATE,
        defaultValue: null,
      },
      countryCode: {
        type: DataTypes.STRING,
        defaultValue: "albania",
      },
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    }
  );

  Address.associate = function (models) {
    Address.belongsTo(models.User, {
      foreignKey: "userId",
      target: "id",
      as: "user",
    });
  };

  return Address;
};

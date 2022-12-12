"use strict";

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      firstName: {
        type: DataTypes.STRING,
      },
      lastName: {
        type: DataTypes.STRING,
      },
      fullName: {
        type: DataTypes.VIRTUAL,
        get() {
          return `${this.firstName} ${this.lastName}`;
        },
        set(value) {
          throw new Error("Do not try to set the `fullName` value!");
        },
      },
      dactorName: {
        type: DataTypes.STRING,
      },
      doctorId: {
        type: DataTypes.INTEGER,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
      },
      nid: {
        type: DataTypes.STRING,
      },
      password: {
        type: DataTypes.STRING,
        get() {
          return () => this.getDataValue("password");
        },
      },
      firstLogin: {
        type: DataTypes.DATE,
      },
      loginAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      phone: {
        type: DataTypes.STRING,
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      insurance: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      alergies: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      medications: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      problems: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM,
        values: [
          "superAdmin",
          "admin",
          "branchManager",
          "courier",
          "finance",
          "companyAdmin",
          "companyBranch",
          "PF",
          "user",
        ],
      },
      salt: {
        type: DataTypes.STRING,
        get() {
          return () => this.getDataValue("salt");
        },
      },
      branchId: {
        type: DataTypes.INTEGER,
      },
      locked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    }
  );

  User.associate = function (models) {
    User.hasOne(models.Token, {
      foreignKey: "usersId",
      target: "id",
      as: "token",
    });

    User.hasMany(models.Appointment, {
      foreignKey: "createdBy",
      target: "id",
    });

    User.hasOne(models.Doctor, {
      foreignKey: "doctorId",
      target: "id",
      as: "doctor",
    });
  };
  return User;
};

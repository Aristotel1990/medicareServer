"use strict";

module.exports = (sequelize, DataTypes) => {
  const AppointmentHistory = sequelize.define(
    "AppointmentHistory",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      appointmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      interval: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      createdBy: {
        type: DataTypes.INTEGER,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    }
  );

  AppointmentHistory.associate = function (models) {
    AppointmentHistory.hasOne(models.Appointment, {
      foreignKey: "appointmentId",
      target: "id",
      as: "appointment",
    });
  };

  return AppointmentHistory;
};

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/config");
const STATUSBDS = {
  AVAILABLE: 1,
  SOLD: 2,
  PENDING: 3
};

// Định nghĩa model RealEstate
const RealEstate = sequelize.define(
  "RealEstates",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    price: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    area: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: STATUSBDS.AVAILABLE,
      validate: {
        isIn: [[STATUSBDS.AVAILABLE, STATUSBDS.SOLD, STATUSBDS.PENDING]], // Chỉ cho phép 1 (Available), 2 (Sold), 3 (Pending)
      },
    },
  }
);

module.exports = { RealEstate };

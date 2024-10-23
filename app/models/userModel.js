const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/config");
const ROLES = {
  ADMIN: 1,
  DEV: 2,
  CUSTOMER: 3,
};
// Định nghĩa model User
const User = sequelize.define(
  "Users",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: ROLES.CUSTOMER, // Mặc định là Sinh viên (3)
      validate: {
        isIn: [[ROLES.ADMIN, ROLES.DEV, ROLES.CUSTOMER]], // Chỉ cho phép 1 (Admin), 2 (Dev), hoặc 3 (Customer)
      },
    },
  }
);

module.exports = { User, ROLES };
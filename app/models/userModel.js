const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/config");
const ROLES = {
  ADMIN: 1,
  TEACHER: 2,
  STUDENT: 3,
};
// Định nghĩa model User
const User = sequelize.define(
  "User",
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
      defaultValue: ROLES.STUDENT, // Mặc định là Sinh viên (3)
      validate: {
        isIn: [[ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT]], // Chỉ cho phép 1 (Admin), 2 (Teacher), hoặc 3 (Student)
      },
    },
  },
  {
    tableName: "users",
  }
);

module.exports = { User, ROLES };
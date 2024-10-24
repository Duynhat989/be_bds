const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/config");
const STATUS = {
  ON: 1,
  OFF: 2
};
// Định nghĩa model User
const Lesson = sequelize.define(
  "Lessons",
  {
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    detail: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    indexRow: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    url_video: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: STATUS.ON, // Mặc định là Sinh viên (3)
      validate: {
        isIn: [[STATUS.ON, STATUS.OFF]], // Chỉ cho phép 1 (Admin), 2 (Dev), hoặc 3 (Customer)
      },
    },
  }
);
module.exports = { Lesson };
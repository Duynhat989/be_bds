const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/config");
const STATUS = {
  ON: 1,
  OFF: 2
};
// Định nghĩa model User
const courseUser = sequelize.define(
  "Course_users",
  {
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    watched: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue:"[]"
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: STATUS.ON, 
      validate: {
        isIn: [[STATUS.ON, STATUS.OFF]], 
      },
    },
  }
);
module.exports = { courseUser };
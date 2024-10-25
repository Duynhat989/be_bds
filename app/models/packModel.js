const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/config");
const STATUS = {
    ON: 1,
    OFF: 2
};
// Định nghĩa model User
const Package = sequelize.define(
    "Packages",
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: ""
        },
        price: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 1
        },
        features: {
            type: DataTypes.TEXT('long'),
            allowNull: false
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
module.exports = { Package };
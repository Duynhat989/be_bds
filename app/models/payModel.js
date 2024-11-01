const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/config");
const PAY_STATUS = {
    HOLD: 1,
    PAID: 2,
    CANCELED: 3
};
const STATUS = {
    ON: 1,
    OFF: 2
};
// Định nghĩa model User
const Pay = sequelize.define(
    "Pays",
    {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        package_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        extension_period: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1 //Số tháng muốn gia hạn
        },
        must_pay: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "" //Số tiền cần thanh toán
        },
        invoice_code: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "" //Mã số thanh toán
        },
        message_code: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "" //Nôi dung chuyển khoản
        },
        status_pay: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: PAY_STATUS.HOLD,
            validate: {
                isIn: [[PAY_STATUS.HOLD, PAY_STATUS.PAID, PAY_STATUS.CANCELED]], 
                // 1 đang chờ, 2 đã thanh toán, 3 hủy thanh toán
            },
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
module.exports = { Pay };
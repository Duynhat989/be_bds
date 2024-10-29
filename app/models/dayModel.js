const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/config");
const STATUS = {
    ON: 1,
    OFF: 2
};
// Định nghĩa model User
const Day = sequelize.define(
    "Days",
    {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW, // Mặc định là ngày hiện tại
        },
        count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1 //Số lượng câu hỏi trong 1 ngày
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
// Hàm addCount kiểm tra user_id và ngày hiện tại, nếu có thì tăng count, nếu chưa có thì thêm mới
const addDayCount = async (user_id) => {
    try {
        const today = new Date().toISOString().split('T')[0]; // Lấy ngày hiện tại dạng 'YYYY-MM-DD'
        // Tìm bản ghi với user_id và ngày hiện tại
        let dayRecord = await Day.findOne({
            where: {
                user_id: user_id,
                date: today
            }
        });
        if (dayRecord) {
            // Nếu có, tăng count thêm 1
            dayRecord.count += 1;
            await dayRecord.save(); // Lưu thay đổi
        } else {
            // Nếu chưa có, tạo bản ghi mới
            dayRecord = await Day.create({
                user_id: user_id,
                date: today,
                count: 1
            });
        }
        return dayRecord; // Trả về thông tin hàng vừa được cập nhật hoặc tạo mới
    } catch (error) {
        return null
    }
};
const checkLimit = async (objectData) => {
    // console.log(objectData);
    try {
        // Lấy ngày hiện tại
        const currentDate = new Date(objectData.date);
        const today = new Date();
        // Kiểm tra nếu ngày trong object đã hết hạn
        if (currentDate < today) {
            return false;
        }
        // Kiểm tra nếu count vượt quá ask
        if (objectData.day.count >= objectData.pack.ask) {
            return false;
        }
        // Nếu vẫn trong hạn và count chưa vượt quá ask
        return true;
    } catch (error) {
        return false;
    }
};

module.exports = { Day, addDayCount, checkLimit };
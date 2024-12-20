const { STATUS, License, User, Pay } = require("../models");
const { encryption, compare } = require('../utils/encode');
const { AssistaintModule } = require('../modules/assistaint.module')
const { Sequelize, Op } = require('sequelize');

//Kiểm tra số người dùng được dăng ksy hôm nay 
exports.getUserPackageSummary = async (req, res) => {
    try {
        const totalUsers = await User.count();
        const package1Users = await License.count({ where: { pack_id: 1 } });
        const package2Users = await License.count({ where: { pack_id: 2 } });
        const package3Users = await License.count({ where: { pack_id: 3 } });

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                package1Users,
                package2Users,
                package3Users,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Hàm kiểm tra số user đăng ký mới hôm nay và số user đăng ký hàng tháng trong 12 tháng gần nhất

exports.getUserRegistrationStats = async (req, res) => {
    try {
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const endOfToday = new Date(today.setHours(23, 59, 59, 999));

        // Số user đăng ký hôm nay
        const usersToday = await User.count({
            where: {
                createdAt: {
                    [Op.between]: [startOfToday, endOfToday],
                },
            },
        });

        // Số user đăng ký mỗi tháng trong 12 tháng gần nhất
        const monthlyStats = [];
        const now = new Date();
        for (let i = 0; i < 12; i++) {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

            const usersThisMonth = await User.count({
                where: {
                    createdAt: {
                        [Op.between]: [startOfMonth, endOfMonth],
                    },
                },
            });

            monthlyStats.push({
                month: `${startOfMonth.getFullYear()}-${startOfMonth.getMonth() + 1}`,
                users: usersThisMonth,
            });
        }

        res.status(200).json({
            success: true,
            data: {
                usersToday,
                monthlyStats,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Hàm tính tổng doanh thu hàng tháng trong 12 tháng gần nhất và doanh thu hôm nay/
exports.getRevenueStats = async (req, res) => {
    try {
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const endOfToday = new Date(today.setHours(23, 59, 59, 999));

        // Tổng doanh thu hôm nay (status_pay = 2)
        const revenueToday = await Pay.sum("must_pay", {
            where: {
                status_pay: 2, // Đã thanh toán
                createdAt: {
                    [Op.between]: [startOfToday, endOfToday],
                },
            },
        });

        // Tổng doanh thu hàng tháng trong 12 tháng gần nhất
        const monthlyRevenueStats = [];
        const now = new Date();
        for (let i = 0; i < 12; i++) {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

            const revenueThisMonth = await Pay.sum("must_pay", {
                where: {
                    status_pay: 2, // Đã thanh toán
                    createdAt: {
                        [Op.between]: [startOfMonth, endOfMonth],
                    },
                },
            });

            monthlyRevenueStats.push({
                month: `${startOfMonth.getFullYear()}-${startOfMonth.getMonth() + 1}`,
                revenue: revenueThisMonth || 0, // Nếu không có, trả về 0
            });
        }

        res.status(200).json({
            success: true,
            data: {
                revenueToday: revenueToday || 0,
                monthlyRevenueStats,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
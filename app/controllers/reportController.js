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
// hàm mới 
exports.getUserRegistrationStatsDay = async (req, res) => {
    try {
        const { days } = req.query; // Nhận tham số từ query (ví dụ: 3day, 7day, 30day, 60day)
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));

        const calculateDailyStats = async (days) => {
            const dailyStats = [];
            for (let i = 0; i < days; i++) {
                const startOfDay = new Date(startOfToday);
                startOfDay.setDate(startOfDay.getDate() - i);
                const endOfDay = new Date(startOfDay);
                endOfDay.setHours(23, 59, 59, 999);

                const usersThisDay = await User.count({
                    where: {
                        createdAt: {
                            [Op.between]: [startOfDay, endOfDay],
                        },
                    },
                });

                dailyStats.push({
                    date: `${startOfDay.getFullYear()}-${startOfDay.getMonth() + 1}-${startOfDay.getDate()}`,
                    users: usersThisDay,
                });
            }
            return dailyStats;
        };

        // Dựa trên tham số truyền lên, gọi hàm tính toán thống kê cho các ngày tương ứng
        let daysCount = 0;
        switch (days) {
            case '3day':
                daysCount = 3;
                break;
            case '7day':
                daysCount = 7;
                break;
            case '30day':
                daysCount = 30;
                break;
            case '60day':
                daysCount = 60;
                break;
            default:
                return res.status(400).json({ success: false, message: 'Invalid days parameter' });
        }

        const stats = await calculateDailyStats(daysCount);

        res.status(200).json({
            success: true,
            data: {
                stats,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// day
exports.getRevenueStatsDay = async (req, res) => {
    try {
        const { days } = req.query; // Nhận tham số từ query (ví dụ: 3day, 7day, 30day, 60day)
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));

        const calculateDailyRevenue = async (days) => {
            const dailyRevenueStats = [];
            for (let i = 0; i < days; i++) {
                const startOfDay = new Date(startOfToday);
                startOfDay.setDate(startOfDay.getDate() - i);
                const endOfDay = new Date(startOfDay);
                endOfDay.setHours(23, 59, 59, 999);

                const revenueThisDay = await Pay.sum("must_pay", {
                    where: {
                        status_pay: 2, // Đã thanh toán
                        createdAt: {
                            [Op.between]: [startOfDay, endOfDay],
                        },
                    },
                });

                dailyRevenueStats.push({
                    date: `${startOfDay.getFullYear()}-${startOfDay.getMonth() + 1}-${startOfDay.getDate()}`,
                    revenue: revenueThisDay || 0,
                });
            }
            return dailyRevenueStats;
        };

        // Dựa trên tham số truyền lên, gọi hàm tính toán doanh thu cho các ngày tương ứng
        let daysCount = 0;
        switch (days) {
            case '3day':
                daysCount = 3;
                break;
            case '7day':
                daysCount = 7;
                break;
            case '30day':
                daysCount = 30;
                break;
            case '60day':
                daysCount = 60;
                break;
            default:
                return res.status(400).json({ success: false, message: 'Invalid days parameter' });
        }

        const revenueStats = await calculateDailyRevenue(daysCount);

        res.status(200).json({
            success: true,
            data: {
                revenueStats,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const { ROLES, STATUS, User, License, courseUser } = require("../models");
const { encryption, compare } = require('../utils/encode');
const { Sequelize, Op } = require('sequelize');

// Lấy danh sách tất cả học sinh
exports.users = async (req, res) => {
    try {
        const { page = 1, limit = 10,search = '' } = req.query;
        const offset = parseInt(page - 1) * parseInt(limit) 
        const role = req.user.role
        // Phần tìm kiếm theo tên 
        let wge = {}
        if (search.length > 2) {
            wge.name = {
                [Op.like]: `%${search}%`
            }
        }
        let count = await User.count({
            where: wge,
        });
        
        const users = await User.findAll({
            where: wge,
            attributes: ['id', 'name', 'phone', 'email', 'role'],
            limit: parseInt(limit),
            offset: offset
        });
        res.status(200).json({
            success: true,
            message: `success.`,
            data: users,
            total:count,
            page:page,
            limit:limit
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.me = async (req, res) => {
    try {
        const user_id = req.user.id
        const users = await User.findAll({
            where: {
                id:user_id
            },
            attributes: ['id', 'name', 'phone', 'email', 'role']
        });
        res.status(200).json({
            success: true,
            data: users[0]
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.edit = async (req, res) => {
    try {
        const { name, phone, email } = req.body;
        const user_id = req.user.id
        // Tìm người dùng theo ID
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Cập nhật thông tin người dùng
        user.name = name || user.name;
        user.phone = phone || user.phone;
        user.email = email || user.email;

        // Lưu thay đổi
        await user.save();

        res.status(200).json({
            success: true,
            message: "Update success",
            data: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.find = async (req, res) => {
    try {
        const { id } = req.body
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({
            success: true,
            message: `Update success.`,
            data: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.update = async (req, res) => {
    try {
        const { id, name, phone, email, role } = req.body;

        // Tìm người dùng theo ID
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Cập nhật thông tin người dùng
        user.name = name || user.name;
        user.phone = phone || user.phone;
        user.email = email || user.email;
        user.role = role || user.role;

        // Lưu thay đổi
        await user.save();

        res.status(200).json({
            success: true,
            message: "Update success",
            data: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.body;

        // Tìm người dùng theo ID
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        try {
            await License.destroy({
                where: { user_id: user.id }
            });
        } catch (error) { }
        try {
            await courseUser.destroy({
                where: { user_id: user.id }
            });
        } catch (error) { }
        // Xóa người dùng
        await user.destroy();

        res.status(200).json({
            success: true,
            message: "Delete success"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

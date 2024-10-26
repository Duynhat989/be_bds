const { ROLES, STATUS, User } = require("../models");
const { encryption, compare } = require('../utils/encode');

// Lấy danh sách tất cả học sinh
exports.users = async (req, res) => {
    try {
        const users = await User.findAll({
            where: {},
            attributes: ['id', 'name', 'phone', 'email', 'role']
        });
        res.status(200).json({
            success: true,
            message: `Users success.`,
            data: users
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

// // Lấy danh sách tất cả giáo viên
// exports.getAllTeachers = async (req, res) => {
//     try {
//         const teachers = await User.findAll({
//             where: { role: ROLES.TEACHER },
//             attributes: ['id', 'name', 'phone', 'email', 'role']
//         });
//         res.status(200).json({
//             status: 1,
//             message: `${req.t('success.listUser')} - ${req.t('role.teacher')}.`,
//             data: teachers
//         });
//     } catch (error) {
//         return res.status(500).json({
//             status: 0,
//             message: req.t('errors.serverError'),
//         });
//     }
// };
// // Tìm giáo viên, học sinh
// exports.findUserById = async (req, res) => {
//     const { id } = req.params;

//     try {
//         const user = await User.findByPk(id);

//         if (!user) {
//             return res.status(404).json({ status: 0, message: req.t('errors.notFound')});
//         }
//         let role = "admin";
//         if (user.role === ROLES.STUDENT) role = req.t('role.student');
//         if (user.role === ROLES.TEACHER) role = req.t('role.teacher');
//         return res.json({
//             status: 1,
//             message: `${role} - ${req.t('found')}.`,
//             data: {
//                 id: user.id,
//                 name: user.name,
//                 phone: user.phone,
//                 email: user.email,
//                 role: user.role
//             }
//         });
//     } catch (error) {
//         return res.status(500).json({
//             status: 0,
//             message: req.t('errors.serverError'),
//             data: null
//         });
//     }
// };

// exports.updateUser = async (req, res) => {
//     const { id } = req.params;
//     const { name, email, password, phone, role } = req.body;
//     try {
//         const user = await User.findByPk(id);
//         if (!user) {
//             return res.status(404).json({ status: 0, message: req.t('errors.notFound')});
//         }
//         // Cập nhật user
//         user.name = name || user.name;
//         user.email = email || user.email;
//         user.phone = phone || user.phone;
//         user.role = role || user.role;

//         if (password) {
//             user.password = await encryption(password);
//         }
//         await user.save();

//         res.status(200).json({
//             success: true,
//             message:  req.t('success.updateSuccess'),
//             data: user
//         });
//         // cập nhật user
//     } catch (error) {
//         return res.status(500).json({
//             status: 0,
//             message: req.t('errors.serverError'),
//         });
//     }
// };
// exports.deleteUser = async (req, res) => {
//     const { id } = req.params;

//     try {
//         const user = await User.findByPk(id);

//         if (!user) {
//             return res.status(404).json({ status: 0, message: req.t('errors.notFound')});
//         }
//         let role = "admin";
//         if (user.role === ROLES.STUDENT) role =  req.t('role.teacher');
//         if (user.role === ROLES.TEACHER) role =  req.t('role.student');
//         await user.destroy();

//         return res.status(500).json({
//             status: 1,
//             message: `${role} - ${req.t('success.deleteSuccess')}`
//         });

//     } catch (error) {
//         return res.status(500).json({
//             status: 0,
//             message: req.t('errors.serverError'),
//         });
//     }
// };
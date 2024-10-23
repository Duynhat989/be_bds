const { ROLES, User } = require("../models");
const { encryption, compare } = require('../utils/encode');
const { createNewToken } = require('../middlewares/manageToken');
// Đăng kí tạo tài khoản
exports.register = async (req, res) => {
    const { name, email, phone, password } = req.body;
    const role = 3;
    try {
        let user = await User.findOne({ where: { email } });
        if (user) return res.status(400).json({
            status: 0,
            message: "Email exits",
            data: null
        });
        // Mã hóa mật khẩu
        const hashedPassword = await encryption(password);
        // Tạo người dùng mới
        user = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            role
        });
        res.status(201).json({
            status: 1,
            message: "Register success",
            data: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        return res.status(500).json({
            status: 0,
            message: "Error services",
            data: null
        });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({
            success: false,
            message: "Login failed",
            data: null
        });

        const isMatch = await compare(password, user.password);
        if (!isMatch) return res.status(400).json({
            success: false,
            message: "Login failed",
            data: null
        });

        const payload = { id: user.id, role: user.role };
        const token = createNewToken(payload);

        return res.json({
            success: true,
            message: "Login success",
            data: {
                name: user.name,
                token: token,
                role: user.role
            }
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error services",
            data: null
        });
    }
};
// admin và giáo viên Tạo tài khoản sinh viên
exports.createUser = async (req, res) => {
    const { name, email, password, phone, role } = req.body;

    try {
        let user = await User.findOne({ where: { email } });
        if (user) return res.status(400).json({
            status: 0,
            message: req.t('errors.emailUsed'),
            data: null
        });

        if ((req.user.role === ROLES.TEACHER || req.user.role === ROLES.ADMIN) && ![ROLES.TEACHER, ROLES.STUDENT].includes(role)) {
            return res.status(403).json({
                status: 0,
                message: req.t('errors.forbidden'),
                data: null
            });
        }

        const hashedPassword = await encryption(password);
        user = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            role
        });
        res.status(201).json({
            status: 1,
            message: req.t('success.created'),
            data: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        return res.status(500).json({
            status: 0,
            message: req.t('errors.serverError'),
            data: null
        });
    }
};

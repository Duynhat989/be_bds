const { Pay, User, Package, PAY_STATUS,STATUS } = require('../models'); // Đảm bảo rằng bạn đã export model Pay
// Tìm bản ghi theo invoice_code
exports.pays = async (req, res) => {
    try {
        const { page = 1, limit = 10,user_id = 0 } = req.query;

        const offset = parseInt(page - 1) * parseInt(limit)
        let condition = {}
        const role = req.user.role
        if (role != 1) {
            condition.status = STATUS.ON
        }
        if (user_id && user_id != 0) {
            condition.user_id = user_id
        }


        let count = await Pay.count({
            where: condition
        });
        let pays = await Pay.findAll({
            where: condition,
            attributes: ["id"
                , "user_id"
                , "package_id"
                , "extension_period"
                , "must_pay"
                , "invoice_code"
                , "status_pay"
                , "status"],
            limit: parseInt(limit),
            offset: offset
        });
        let paysInfo = []
        for (let index = 0; index < pays.length; index++) {
            const pay = pays[index];
            let user = await User.findOne({
                where: {
                    id: pay.user_id
                },
                attributes: ["id", "name", "email", "phone", "role"]
            })
            let package = await Package.findByPk(pay.package_id)
            paysInfo.push({
                ...pay.dataValues,
                package: package,
                user: user
            })
        }
        res.status(200).json({
            success: true,
            pays: paysInfo,
            total: count,
            page: page,
            limit: limit
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.findById = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const {  user_id = 0, pay_status = 0 } = req.body
    const offset = parseInt(page - 1) * parseInt(limit)
    const role = req.user.role
    let condition = {}
    if (role != 1) {
        condition.status = STATUS.ON
    }
    if (user_id != 0) {
        condition.user_id = user_id
    }
    if (pay_status != 0) {
        condition.status_pay = pay_status
        // HOLD: 1,
        // PAID: 2,
        // CANCELED: 3
    }
    console.log(condition)
    // ---------------------
    let totalMustPay = await Pay.sum('must_pay', {
        where: condition
    });
    totalMustPay = !totalMustPay ? 0 : totalMustPay
    let count = await Pay.count({
        where: condition
    });
    let pays = await Pay.findAll({
        where: condition,
        attributes: ["id"
            , "user_id"
            , "package_id"
            , "extension_period"
            , "must_pay"
            , "invoice_code"
            , "status_pay"
            , "status"],
        limit: parseInt(limit),
        offset: offset
    });
    return res.json({
        count,
        total:totalMustPay,
        pays
    });
}
// Tìm bản ghi theo invoice_code
exports.findByInvoiceCode = async (req, res) => {
    try {
        const { invoice_code } = req.params; // Lấy invoice_code từ URL params
        const pay = await Pay.findOne({
            where: { invoice_code }
        });

        if (!pay) {
            return res.status(404).json({ success: false, message: 'Invoice code không tồn tại.' });
        }

        res.status(200).json({ success: true, data: pay });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Tạo mới một bản ghi Pay
exports.createPay = async (req, res) => {
    try {
        const { package_id, extension_period, must_pay, message_code } = req.body;
        const user_id = req.user.id
        const newPay = await Pay.create({
            user_id,
            package_id,
            extension_period,
            must_pay,
            message_code,
        });

        res.status(201).json({ success: true, data: newPay });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Cập nhật thông tin Pay theo invoice_code
exports.users = async (req, res) => {
    try {        
        // Phần tìm kiếm theo tên 
        const users = await User.findAll({
            where: {},
            attributes: ['id', 'name']
        });
        res.status(200).json({
            success: true,
            message: `Succesfuly`,
            data: users
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Xóa Pay theo invoice_code
exports.deletePay = async (req, res) => {
    try {
        const { id } = req.body;

        const pay = await Pay.findOne({ where: { id } });

        if (!pay) {
            return res.status(404).json({ success: false, message: 'Pay không tồn tại.' });
        }

        // Xóa bản ghi
        await pay.destroy();

        res.status(200).json({ success: true, message: 'Xóa thành công.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
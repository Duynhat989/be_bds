const { Pay, User, Package } = require('../models'); // Đảm bảo rằng bạn đã export model Pay
// Tìm bản ghi theo invoice_code
exports.pays = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = parseInt(page - 1) * parseInt(limit) 
        let count = await Pay.count({
            where: {
                status: 1
            },
        });
        let pays = await Pay.findAll({
            where: {
                status: 1
            },
            attributes: ["id", "user_id", "package_id", "extension_period", "must_pay", "invoice_code", "status_pay", "status"],
            limit: parseInt(limit),
            offset: offset
        });
        let paysInfo = []
        for (let index = 0; index < pays.length; index++) {
            const pay = pays[index];
            let user = await User.findOne({
                where:{
                    id:pay.user_id
                },
                attributes:["id","name","email","phone","role"]
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


// // Cập nhật thông tin Pay theo invoice_code
// exports.updatePay = async (req, res) => {
//     try {
//         const { user_id, package_id, extension_period, must_pay, status_pay, invoice_code, status } = req.body;

//         const pay = await Pay.findOne({ where: { invoice_code } });

//         if (!pay) {
//             return res.status(404).json({ success: false, message: 'Invoice code không tồn tại.' });
//         }

//         // Cập nhật thông tin
//         await pay.update({
//             user_id,
//             package_id,
//             extension_period,
//             must_pay,
//             status_pay,
//             status
//         });

//         res.status(200).json({ success: true, data: pay });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

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
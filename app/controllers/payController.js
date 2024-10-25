const { Pay } = require('../models'); // Đảm bảo rằng bạn đã export model Pay

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
        const { user_id, package_id, extension_period, must_pay, invoice_code, status_pay, status } = req.body;

        const newPay = await Pay.create({
            user_id,
            package_id,
            extension_period,
            must_pay,
            invoice_code,
            status_pay,
            status
        });

        res.status(201).json({ success: true, data: newPay });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Cập nhật thông tin Pay theo invoice_code
exports.updatePay = async (req, res) => {
    try {
        const { user_id, package_id, extension_period, must_pay, status_pay, invoice_code, status } = req.body;

        const pay = await Pay.findOne({ where: { invoice_code } });

        if (!pay) {
            return res.status(404).json({ success: false, message: 'Invoice code không tồn tại.' });
        }

        // Cập nhật thông tin
        await pay.update({
            user_id,
            package_id,
            extension_period,
            must_pay,
            status_pay,
            status
        });

        res.status(200).json({ success: true, data: pay });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Xóa Pay theo invoice_code
exports.deletePay = async (req, res) => {
    try {
        const { invoice_code } = req.params;

        const pay = await Pay.findOne({ where: { invoice_code } });

        if (!pay) {
            return res.status(404).json({ success: false, message: 'Invoice code không tồn tại.' });
        }

        // Xóa bản ghi
        await pay.destroy();

        res.status(200).json({ success: true, message: 'Xóa thành công.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
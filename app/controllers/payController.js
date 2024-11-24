const { Pay, User, Package, PAY_STATUS, STATUS } = require('../models'); // Đảm bảo rằng bạn đã export model Pay
const { License } = require('../models'); // Import model License
const { Sequelize, Op } = require('sequelize');
// Tìm bản ghi theo invoice_code
exports.pays = async (req, res) => {
    try {
        const { page = 1, limit = 10, status_pay, startday, endday } = req.query;

        const offset = parseInt(page - 1) * parseInt(limit)
        let condition = {}
        if (status_pay || status_pay == 0) {
            condition.status_pay = status_pay
        }
        if (startday || endday) {
            condition.updatedAt = {};
            if (startday) {
                condition.updatedAt[Op.gte] = new Date(startday); // Lớn hơn hoặc bằng ngày bắt đầu
            }
            if (endday) {
                condition.updatedAt[Op.lte] = new Date(endday); // Nhỏ hơn hoặc bằng ngày kết thúc
            }
        }
        let totalMustPay = await Pay.sum('must_pay', {
            where: condition
        });
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
            totalMustPay: totalMustPay,
            total: count,
            page: page,
            limit: limit
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.findByIdUpdate = async (req, res) => {
    try {
        const { id } = req.body
        const assistant = await Pay.findByPk(id);
        if (!assistant) {
            return res.status(404).json({ success: false, message: "Pay not found" });
        }
        // Tìm kiếm trợ lý
        return res.status(200).json({
            success: true,
            message: `success.`,
            data: assistant
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
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
        const { package_id, extension_period, must_pay, message_code, invoice_code } = req.body;
        const user_id = req.user.id
        const newPay = await Pay.create({
            user_id,
            package_id,
            extension_period,
            must_pay,
            message_code,
            invoice_code
        });

        res.status(201).json({ success: true, data: newPay });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Cập nhật thông tin Pay theo invoice_code
exports.users = async (req, res) => {
    try {
        const { search } = req.query
        let condition = {}
        if (search && search.length > 0) {
            condition = {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } }, // Tìm kiếm chuỗi tương tự trong cột name
                    { email: { [Op.like]: `%${search}%` } } // Tìm kiếm chuỗi tương tự trong cột email
                ]
            };
        }
        // Phần tìm kiếm theo tên 
        const users = await User.findAll({
            where: condition,
            attributes: ['id', 'name', 'email'],
            limit: 10
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

// payment dữ liệu data





exports.updateInvoice = async (req, res) => {
    const { invoice_code } = req.body;

    try {
        // Tìm hóa đơn đang ở trạng thái HOLD
        const pay = await Pay.findOne({
            where: {
                invoice_code: invoice_code,
                status_pay: PAY_STATUS.HOLD, // Chỉ xử lý hóa đơn ở trạng thái HOLD
            },
        });

        if (!pay) {
            return res.status(404).json({ success: false, message: "Invoice code not found or not in HOLD status." });
        }

        // Kiểm tra thông tin license của user
        let license = await License.findOne({
            where: {
                user_id: pay.user_id,
            },
        });

        const currentDate = new Date(); // Ngày hiện tại
        let newDate;

        if (license) {
            // Trường hợp license tồn tại
            if (license.pack_id === pay.package_id) {
                // Nếu pack_id trùng, cập nhật date
                const licenseDate = new Date(license.date);

                if (licenseDate < currentDate) {
                    // Nếu đã quá hạn, lấy ngày hiện tại + 30 ngày
                    newDate = new Date(currentDate.setDate(currentDate.getDate() + 30 * pay.extension_period));
                } else {
                    // Nếu chưa quá hạn, lấy ngày trong license + 30 ngày
                    newDate = new Date(licenseDate.setDate(licenseDate.getDate() + 30 * pay.extension_period));
                }

                // Cập nhật license
                await license.update({
                    date: newDate,
                });
            } else {
                // Nếu pack_id không trùng, cập nhật pack_id và date
                newDate = new Date(currentDate.setDate(currentDate.getDate() + 30 * pay.extension_period));

                await license.update({
                    pack_id: pay.package_id,
                    date: newDate,
                });
            }
        } else {
            // Nếu license không tồn tại, tạo mới
            newDate = new Date(currentDate.setDate(currentDate.getDate() + 30  * pay.extension_period));

            await License.create({
                user_id: pay.user_id,
                pack_id: pay.package_id,
                date: newDate,
                status: 1, // Mặc định bật (STATUS.ON)
            });
        }

        // Cập nhật trạng thái hóa đơn về PAID
        await pay.update({
            status_pay: PAY_STATUS.PAID,
        });

        return res.status(200).json({
            success: true,
            message: "Invoice processed and updated successfully.",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Kiểm tra xem hóa đơn đã thanh toán hay chưa
exports.checkInvoiceStatus = async (req, res) => {
    const { invoice_code } = req.body;

    try {
        // Kiểm tra các hóa đơn quá hạn 
        const twoDaysAgo = new Date(currentDate);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        // Tìm các hóa đơn ở trạng thái HOLD quá 2 ngày
        const expiredInvoices = await Pay.findAll({
            where: {
                status_pay: PAY_STATUS.HOLD,
                updatedAt: {
                    [Op.lt]: twoDaysAgo, // updatedAt < twoDaysAgo
                },
            },
        });

        // Cập nhật trạng thái của các hóa đơn quá hạn sang CANCELED
        if (expiredInvoices.length > 0) {
            await Pay.update(
                { status_pay: PAY_STATUS.CANCELED },
                {
                    where: {
                        id: expiredInvoices.map((invoice) => invoice.id),
                    },
                }
            );
        }
        // Kiểm tra hóa đơn với invoice_code
        const pay = await Pay.findOne({
            where: {
                invoice_code: invoice_code,
            },
            attributes: ['id', 'status_pay', 'invoice_code'], // Chỉ lấy thông tin cần thiết
        });

        if (!pay) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found.",
            });
        }

        // Kiểm tra trạng thái thanh toán
        const isPaid = pay.status_pay === PAY_STATUS.PAID;

        return res.status(200).json({
            success: true,
            invoice_code: pay.invoice_code,
            status: pay.status_pay,//1 hold 2 paid 3 cancel
            isPaid: isPaid,
            message: isPaid ? "Invoice has been paid." : "Invoice is not yet paid.",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.EditInvoice = async (req, res) => {
    const { invoice_code, status_pay, must_pay, package_id, extension_period, message_code, user_id } = req.body;

    try {
        // Tìm hóa đơn dựa trên invoice_code
        const pay = await Pay.findOne({
            where: {
                invoice_code: invoice_code,
            },
        });

        if (!pay) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found.",
            });
        }

        // Tạo object để lưu thông tin cần cập nhật
        const updatedData = {};

        if (status_pay !== undefined) {
            // Kiểm tra giá trị hợp lệ cho status_pay
            if (![PAY_STATUS.HOLD, PAY_STATUS.PAID, PAY_STATUS.CANCELED].includes(status_pay)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid status_pay value.",
                });
            }
            updatedData.status_pay = status_pay;
        }

        if (must_pay !== undefined) {
            updatedData.must_pay = must_pay;
        }

        if (package_id !== undefined) {
            updatedData.package_id = package_id;
        }

        if (extension_period !== undefined) {
            updatedData.extension_period = extension_period;
        }
        if (message_code !== undefined) {
            updatedData.message_code = message_code;
        }
        if (user_id !== undefined) {
            updatedData.user_id = user_id;
        }
        // Cập nhật hóa đơn
        await pay.update(updatedData);

        return res.status(200).json({
            success: true,
            message: "Invoice updated successfully.",
            updatedInvoice: pay, // Trả về hóa đơn sau khi cập nhật
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
const { License, STATUS, Package, Day , Setup} = require("../models");

exports.getLicenses = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = parseInt(page - 1) * parseInt(limit) 
        let count = await License.count({
            where: {
                status: STATUS.ON
            }
        });
        let licenses = await License.findAll({
            where: {
                status: STATUS.ON
            },
            order: [["createdAt", "DESC"]],
            limit: parseInt(limit),
            offset: offset
        });
        res.status(200).json({
            success: true,
            licenses: licenses,
            total:count,
            page:page,
            limit:limit
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getLicenseById = async (req, res) => {
    try {
        const { user_id } = req.body
        let licenses = await License.findOne({
            where: {
                user_id: user_id
            }
        });
        if (!licenses) {
            const item = await Setup.findOne({
                where:{
                    name:'API_FREE_UP'
                }
            })
            let dayTime = 5
            try {
                if(item){
                    dayTime = parseInt(item.value)
                }
            } catch (error) {
                dayTime = 5
            }
            let currentDate = new Date();
            let expirationDate = new Date(currentDate.getTime() + dayTime * 24 * 60 * 60 * 1000);
            // Chuyển expirationDate thành dạng DATEONLY (YYYY-MM-DD)
            expirationDate = expirationDate.toISOString().split('T')[0];
            licenses = await License.create({
                user_id: user_id,
                pack_id: 1,
                date: expirationDate
            })
        }
        let result = {
            ...{
                id: licenses.dataValues.id,
                date: licenses.dataValues.date
            }
        }
        const pack_id = licenses.dataValues.pack_id
        const pack = await Package.findByPk(pack_id)
        result = {
            ...result,
            ...{
                pack: {
                    name: pack.dataValues.name,
                    price: pack.dataValues.price,
                    ask: pack.dataValues.ask,
                    features: pack.dataValues.features
                }
            }
        }
        // Lấy thông tin day
        const today = new Date().toISOString().split('T')[0]; // Lấy ngày hiện tại dạng 'YYYY-MM-DD'
        let day = await Day.findOne({
            where: {
                user_id: licenses.dataValues.user_id,
                date: today
            }
        })
        if (!day) {
            day = await Day.create({
                user_id: user_id,
                date: today,
                count: 0
            });
        }
        result = {
            ...result,
            ...{
                day: {
                    id: day.dataValues.id,
                    date: day.dataValues.date,
                    count: day.dataValues.count
                }
            }
        }
        // Thử nghiệm thành công
        res.status(200).json({
            success: true,
            license: result
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getLicense = async (req, res) => {
    try {
        const user_id = req.user.id
        let licenses = await License.findOne({
            where: {
                user_id: user_id
            }
        });
        if (licenses == null) {
            const item = await Setup.findOne({
                where:{
                    name:'API_FREE_UP'
                }
            })
            let dayTime = 5
            try {
                if(item){
                    dayTime = parseInt(item.value)
                }
            } catch (error) {
                dayTime = 5
            }
            let currentDate = new Date();
            let expirationDate = new Date(currentDate.getTime() + dayTime * 24 * 60 * 60 * 1000);
            // Chuyển expirationDate thành dạng DATEONLY (YYYY-MM-DD)
            expirationDate = expirationDate.toISOString().split('T')[0];
            licenses = await License.create({
                user_id: user_id,
                pack_id: 1,
                date: expirationDate
            })
        }
        let result = {
            ...{
                id: licenses.dataValues.id,
                date: licenses.dataValues.date
            }
        }
        const pack_id = licenses.dataValues.pack_id
        const pack = await Package.findByPk(pack_id)
        result = {
            ...result,
            ...{
                pack: {
                    name: pack.dataValues.name,
                    price: pack.dataValues.price,
                    ask: pack.dataValues.ask,
                    features: pack.dataValues.features
                }
            }
        }
        // Lấy thông tin day
        const today = new Date().toISOString().split('T')[0]; // Lấy ngày hiện tại dạng 'YYYY-MM-DD'
        let day = await Day.findOne({
            where: {
                user_id: licenses.dataValues.user_id,
                date: today
            }
        })
        if (!day) {
            day = await Day.create({
                user_id: user_id,
                date: today,
                count: 0
            });
        }
        result = {
            ...result,
            ...{
                day: {
                    id: day.dataValues.id,
                    date: day.dataValues.date,
                    count: day.dataValues.count
                }
            }
        }
        res.status(200).json({
            success: true,
            license: result
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addLicense = async (req, res) => {
    try {
        const { user_id, pack_id, date, count } = req.body;

        let newLicense = await License.create({
            user_id,
            pack_id,
            date: `${date}T00:00:00`,
            status: STATUS.ON
        });

        res.status(201).json({
            success: true,
            license: newLicense
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateLicense = async (req, res) => {
    try {
        // const { id } = req.params;
        const { user_id, pack_id, date, id } = req.body;

        let updatedLicense = await License.update({
            user_id,
            pack_id,
            date: `${date}T00:00:00`
        }, {
            where: { id: id }
        });

        if (updatedLicense[0] === 0) {
            return res.status(404).json({ success: false, message: "License không tồn tại" });
        }

        res.status(200).json({
            success: true,
            message: "Cập nhật license thành công"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteLicense = async (req, res) => {
    try {
        const { id } = req.params;

        let deleted = await License.destroy({
            where: { id: id }
        });

        if (!deleted) {
            return res.status(404).json({ success: false, message: "License không tồn tại" });
        }

        res.status(200).json({
            success: true,
            message: "Xóa license thành công"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

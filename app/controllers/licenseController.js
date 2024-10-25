const { License, STATUS } = require("../models");

exports.getLicenses = async (req, res) => {
    try {
        let licenses = await License.findAll({
            where: {
                status: STATUS.ON
            }
        });
        res.status(200).json({
            success: true,
            licenses: licenses
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
            date:`${date}T00:00:00`,
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
        const { user_id, pack_id, date ,id} = req.body;

        let updatedLicense = await License.update({
            user_id,
            pack_id,
            date:`${date}T00:00:00`
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

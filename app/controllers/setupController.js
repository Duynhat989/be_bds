const { STATUS, Setup } = require("../models");
const { encryption, compare } = require('../utils/encode');

// Lấy danh sách tất cả học sinh
exports.getAllSetup = async (req, res) => {
    try {
        const setups = await Setup.findAll({ 
            where: { status: STATUS.ON }
        });
        res.status(200).json({
            success: true,
            message: `List setup`,
            data: setups
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getStatus = async (req, res) => {
    try {
        const setups = await Setup.findOne({ 
            where: { 
                status: STATUS.ON, 
                name:'API_STATUS'
            }
        });
        res.status(200).json({
            maintenance: parseInt(setups.value) != 0 ? true : false
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

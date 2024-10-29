const { STATUS, Setup } = require("../models");
const { encryption, compare } = require('../utils/encode');

// Lấy danh sách tất cả học sinh
exports.estateAnalysis = async (req, res) => {
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
exports.financialAnalysis = async (req, res) => {
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
exports.newsSummary = async (req, res) => {
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
exports.teamTraining = async (req, res) => {
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

const { STATUS, Setup } = require("../models");
const { encryption, compare } = require('../utils/encode');

// Lấy danh sách tất cả học sinh
exports.estateAnalysis = async (req, res) => {
    try {
        const setups = await Setup.findOne({ 
            where: { 
                status: STATUS.ON, 
                name:'API_ESTATE'
            }
        });
        if(setups){
            res.status(200).json({
                success:false,
                assistant_id: setups.value
            });
        }else{
            res.status(500).json({
                success:false,
                message:"NOT_FOUND"
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.financialAnalysis = async (req, res) => {
    try {
        const setups = await Setup.findOne({ 
            where: { 
                status: STATUS.ON, 
                name:'API_FINANCEAL'
            }
        });
        if(setups){
            res.status(200).json({
                success:false,
                assistant_id: setups.value
            });
        }else{
            res.status(500).json({
                success:false,
                message:"NOT_FOUND"
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.newsSummary = async (req, res) => {
    try {
        const setups = await Setup.findOne({ 
            where: { 
                status: STATUS.ON, 
                name:'API_SUMMARY'
            }
        });
        if(setups){
            res.status(200).json({
                success:false,
                assistant_id: setups.value
            });
        }else{
            res.status(500).json({
                success:false,
                message:"NOT_FOUND"
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.teamTraining = async (req, res) => {
    try {
        const setups = await Setup.findOne({ 
            where: { 
                status: STATUS.ON, 
                name:'API_TEAMTRAINING'
            }
        });
        if(setups){
            res.status(200).json({
                success:false,
                assistant_id: setups.value
            });
        }else{
            res.status(500).json({
                success:false,
                message:"NOT_FOUND"
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

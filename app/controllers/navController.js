const { STATUS, Setup, Assistant } = require("../models");
const { encryption, compare } = require('../utils/encode');

// Lấy danh sách tất cả học sinh
exports.estateAnalysis = async (req, res) => {
    try {
        let name = 'API_ESTATE'
        const setups = await Setup.findOne({ 
            where: { 
                status: STATUS.ON, 
                name:name
            }
        });
        if(setups){
            let assistant_id = setups.value
            var assistant = await Assistant.findOne({
                where:{
                    id:assistant_id
                },
                attributes:["id", 'name', 'detail', 'image', 'suggests','view']
            })
            if(assistant){
                res.status(200).json({
                    success:true,
                    assistant: assistant
                });
            }else{
                res.status(500).json({
                    success:false,
                    message:"NOT SET ASSISTANT"
                });
            }
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
        let name = 'API_FINANCEAL'
        const setups = await Setup.findOne({ 
            where: { 
                status: STATUS.ON, 
                name:name
            }
        });
        if(setups){
            let assistant_id = setups.value
            var assistant = await Assistant.findOne({
                where:{
                    id:assistant_id
                },
                attributes:["id", 'name', 'detail', 'image', 'suggests','view']
            })
            if(assistant){
                res.status(200).json({
                    success:true,
                    assistant: assistant
                });
            }else{
                res.status(500).json({
                    success:false,
                    message:"NOT SET ASSISTANT"
                });
            }
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
        let name = 'API_SUMMARY'
        const setups = await Setup.findOne({ 
            where: { 
                status: STATUS.ON, 
                name:name
            }
        });
        if(setups){
            let assistant_id = setups.value
            var assistant = await Assistant.findOne({
                where:{
                    id:assistant_id
                },
                attributes:["id", 'name', 'detail', 'image', 'suggests','view']
            })
            if(assistant){
                res.status(200).json({
                    success:true,
                    assistant: assistant
                });
            }else{
                res.status(500).json({
                    success:false,
                    message:"NOT SET ASSISTANT"
                });
            }
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
        let name = 'API_TEAMTRAINING'
        const setups = await Setup.findOne({ 
            where: { 
                status: STATUS.ON, 
                name:name
            }
        });
        if(setups){
            let assistant_id = parseInt(setups.value)
            var assistant = await Assistant.findOne({
                where:{
                    id:assistant_id
                },
                attributes:["id", 'name', 'detail', 'image', 'suggests','view']
            })
            if(assistant){
                res.status(200).json({
                    success:true,
                    assistant: assistant
                });
            }else{
                res.status(500).json({
                    success:false,
                    message:"NOT SET ASSISTANT"
                });
            }
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

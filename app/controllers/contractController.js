const { STATUS, Contract } = require("../models");
const { encryption, compare } = require('../utils/encode');

// Lấy danh sách tất cả học sinh
exports.contracts = async (req, res) => {
    try {
        let contracts = await Contract.findAll({
            where:{
                status:1
            }
        })
        res.status(200).json({
            success: true,
            contracts:contracts
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.find = async (req, res) => {
    try {
        const { id } = req.body
        const user_id = req.user.id
        const contract = await Contract.findByPk(id);
        if (!contract) {
            return res.status(404).json({ success: false, message: "contract not found" });
        }
        // để lấy danh sách video bài giảng
        let lstLesson = [];
        let promese = {
            contract_id:contract.id
        }
        if(req.user.role != 1){
            promese.user_id = user_id
        }
        let contractU = await contractUser.findOne({
            where:promese
        })
        // console.log(contractU)
        if(contractU){
            lstLesson = await Lesson.findAll({
                where:{
                    contract_id:contract.id
                },
                attributes:["id","name","detail","image","indexRow","url_video"]
            })
        }
        res.status(200).json({
            success: true,
            message: `Update success.`,
            data: {
                id: contract.id,
                name: contract.name,
                detail: contract.detail,
                image: contract.image,
                price: contract.price,
                sign_in: contract.sign_in,
                lessons:lstLesson
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.create = async (req, res) => {
    try {
        const { name, detail, image, price, sign_in } = req.body;

        // Tạo khóa học mới
        const newcontract = await contract.create({
            name,
            detail,
            image,
            price,
            sign_in,
            status: STATUS.ON // Giả định rằng bạn có hằng số STATUS.ACTIVE là 1
        });

        res.status(200).json({
            success: true,
            message: "contract created successfully",
            data: newcontract
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.edit = async (req, res) => {
    try {
        const { id, name, detail, image, price,sign_in } = req.body;

        // Tìm khóa học theo ID
        const contract = await contract.findByPk(id);
        if (!contract) {
            return res.status(404).json({ success: false, message: "contract not found" });
        }
        // Cập nhật thông tin khóa học
        contract.name = name || contract.name;
        contract.detail = detail || contract.detail;
        contract.image = image || contract.image;
        contract.price = price || contract.price;
        contract.sign_in = sign_in || contract.sign_in;

        // Lưu thay đổi
        await contract.save();

        res.status(200).json({
            success: true,
            message: "contract updated successfully",
            data: contract
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.body;
        // Tìm khóa học theo ID
        const contract = await contract.findByPk(id);
        if (!contract) {
            return res.status(404).json({ success: false, message: "contract not found" });
        }
        // Xóa khóa học
        await contract.destroy();

        res.status(200).json({
            success: true,
            message: "contract deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

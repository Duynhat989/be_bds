const fs = require('fs');
const path = require('path');
const { STATUS, Contract } = require("../models");
const { encryption, compare } = require('../utils/encode');
const multer = require('multer');

// Định nghĩa đường dẫn lưu trữ file Word
const STORE_PATH = path.join(__dirname, '../../stores');
// Tạo thư mục lưu trữ nếu chưa tồn tại
if (!fs.existsSync(STORE_PATH)) {
    fs.mkdirSync(STORE_PATH);
}
// Cấu hình multer để lưu file vào thư mục stores
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, STORE_PATH);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });


// Lấy danh sách tất cả hợp đồng
exports.contracts = async (req, res) => {
    try {
        let contracts = await Contract.findAll({
            where: {
                status: 1
            }
        });
        res.status(200).json({
            success: true,
            contracts: contracts
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Tạo hợp đồng mới và tải lên file Word vào stores
exports.create = async (req, res) => {
    upload.single('template_contract')(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ success: false, message: "File upload failed" });
        }
        const { name, description, image, input } = req.body;
        // Kiểm tra xem description có được cung cấp không
        if (!description) {
            return res.status(400).json({ success: false, message: "Description is required." });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Template contract file is required." });
        }
        const newContract = await Contract.create({
            name,
            description:description,  // Đảm bảo không null
            image,
            template_contract: req.file.path,
            input,
            status: STATUS.ON
        });
        res.status(200).json({
            success: true,
            message: "Contract created successfully",
            data: newContract
        });
        try {
            
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });
};

exports.update = async (req, res) => {
    upload.single('template_contract')(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ success: false, message: "File upload failed" });
        }
        const { id, name, description, image, input } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Contract ID is required." });
        }

        const contract = await Contract.findByPk(id);
        if (!contract) {
            return res.status(404).json({ success: false, message: "Contract not found" });
        }

        try {
            contract.name = name || contract.name;
            contract.description = description || contract.description;
            contract.image = image || contract.image;
            contract.input = input || contract.input;
            
            if (req.file) {
                contract.template_contract = req.file.path;
            }

            await contract.save();

            res.status(200).json({
                success: true,
                message: "Contract updated successfully",
                data: contract
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });
};
exports.findByName = async (req, res) => {
    try {
        const { name } = req.query;

        if (!name) {
            return res.status(400).json({ success: false, message: "Contract name is required." });
        }

        const contracts = await Contract.findAll({
            where: {
                name: {
                    [Op.like]: `%${name}%`
                }
            }
        });

        res.status(200).json({
            success: true,
            data: contracts
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.findById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ success: false, message: "Contract ID is required." });
        }

        const contract = await Contract.findByPk(id);

        if (!contract) {
            return res.status(404).json({ success: false, message: "Contract not found" });
        }

        res.status(200).json({
            success: true,
            data: contract
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Contract ID is required." });
        }

        const contract = await Contract.findByPk(id);
        if (!contract) {
            return res.status(404).json({ success: false, message: "Contract not found" });
        }

        // Kiểm tra và xóa file docx nếu tồn tại
        const filePath = contract.template_contract;
        if (filePath) {
            fs.unlink(path.resolve(filePath), (err) => {
                if (err) {
                    console.error("Error deleting file:", err.message);
                }
            });
        }

        // Xóa hợp đồng
        await contract.destroy();

        res.status(200).json({
            success: true,
            message: "Contract and associated file deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
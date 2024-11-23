const fs = require('fs');
const path = require('path');
const { STATUS, Contract } = require("../models");
const { encryption, compare } = require('../utils/encode');
const { Sequelize, Op } = require('sequelize');

const multer = require('multer');
const { WordProcessor } = require('../modules/WordProcessor.module');
const { Assistaint } = require('../modules/assistaint.module')


const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');


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
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = parseInt(page - 1) * parseInt(limit)
        let wge = {
            status: 1
        }
        if (search && search.length > 2) {
            wge.name = {
                [Op.like]: `%${search}%`
            }
        }
        // Phần tìm kiếm 
        let count = await Contract.count({
            where: wge
        });
        let contracts = await Contract.findAll({
            where: wge,
            attributes: ["id", "name", "description", "image", "input", "status"],
            limit: parseInt(limit),
            offset: offset
        });
        res.status(200).json({
            success: true,
            contracts: contracts,
            total: count,
            page: page,
            limit: limit
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
            description: description,  // Đảm bảo không null
            image,
            template_contract: req.file.path,
            input,
            status: STATUS.ON
        });
        res.status(200).json({
            success: true,
            message: "Contract created successfully",
            data: {
                id: newContract.id,
                description: newContract.description,
                image: newContract.image,
                input: newContract.input,
                status: newContract.status
            }
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
                contrack: {
                    id: contract.id,
                    description: contract.description,
                    image: contract.image,
                    input: contract.input,
                    status: contract.status
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });
};
exports.findByName = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Contract name is required." });
        }

        const contracts = await Contract.findAll({
            where: {
                name: {
                    [Op.like]: `%${name}%`
                }
            },
            attributes: ["id", "name", "description", "image", "input", "status"]
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
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Contract ID is required." });
        }

        const contract = await Contract.findByPk(id);

        if (!contract) {
            return res.status(404).json({ success: false, message: "Contract not found" });
        }

        res.status(200).json({
            success: true,
            data: {
                id: contract.id,
                description: contract.description,
                image: contract.image,
                input: contract.input,
                status: contract.status
            }
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

// Render hợp đồng
exports.appRender = async (req, res) => {

    const { id, replaceData } = req.body;
    try {
        var contract = await Contract.findByPk(id)
        if (!contract) {
            return res.status(404).json({ success: false, message: "Contract not found" });
        }

        var proccesser = new WordProcessor(contract.template_contract)
        let replacedBuffer = await proccesser.readAndReplace(replaceData)


        if (replacedBuffer) {
            // Đặt tên file cho file tải xuống
            const filename = 'document_replaced.docx';

            // Gửi file để tải xuống
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.send(replacedBuffer);
        } else {
            res.status(500).send('Có lỗi xảy ra khi tạo file.');
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Rà soát hợp đồng


exports.appProcess = async (req, res) => {
    upload.single('contract')(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ success: false, message: "File upload failed" });
        }

        const pathDoc = req.file.path;
        console.log("Uploaded file path:", pathDoc);

        // Đảm bảo file đã được lưu hoàn tất trước khi đọc
        fs.access(pathDoc, fs.constants.F_OK, async (fileError) => {
            if (fileError) {
                return res.status(404).json({ success: false, message: "File not found or not saved yet" });
            }

            try {
                const fileType = req.file.mimetype; // Kiểm tra loại file
                let fileContent;

                if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                    // Đọc file Word (.docx) với đường dẫn file
                    const result = await mammoth.extractRawText({ path: pathDoc });
                    fileContent = result.value;
                } else if (fileType === 'application/pdf') {
                    // Đọc file PDF
                    const data = fs.readFileSync(pathDoc);
                    const pdfData = await pdfParse(data);
                    fileContent = pdfData.text;
                } else {
                    return res.status(400).json({ success: false, message: "Unsupported file type" });
                }

                res.status(200).json({
                    success: true,
                    dataContract: fileContent, // Trả về nội dung của file
                });
            } catch (error) {
                console.error('Error reading file:', error);
                res.status(500).json({ success: false, message: error.message });
            } finally {
                // Xóa file đã upload (tùy chọn)
                fs.unlink(pathDoc, (err) => {
                    if (err) console.error('Failed to delete uploaded file:', err);
                });
            }
        });
    });
};
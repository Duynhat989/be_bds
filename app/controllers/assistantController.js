const { STATUS, Assistant, loadApiKey, loadModel, astCreateRow, findAssistant, astUpdateRow, RealEstate } = require("../models");
const { encryption, compare } = require('../utils/encode');
const { AssistaintModule } = require('../modules/assistaint.module')
const { Sequelize, Op } = require('sequelize');

// Lấy danh sách tất cả học sinh
exports.getAllAssistant = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = parseInt(page - 1) * parseInt(limit)

        const role = req.user.role
        // Phần tìm kiếm theo tên 
        let wge = {}
        if (role != 1) {
            wge.status = STATUS.ON
        }
        if (search && search.length > 2) {
            wge.name = {
                [Op.like]: `%${search}%`
            }
        }
        // Danh sách trợ lý
        let count = await Assistant.count({
            where: wge
        });
        const data = await Assistant.findAll({
            where: wge,
            attributes: ['id', 'name', 'detail', 'image', 'suggests', 'view'],
            limit: parseInt(limit),
            offset: offset
        });
        res.status(200).json({
            success: true,
            message: `List Assistant`,
            data: data,
            total: count,
            page: page,
            limit: limit
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createAssistant = async (req, res) => {
    try {
        const { name, detail, image, instructions, file_ids, suggests, name_model } = req.body
        // Tạo trợ lý 
        // console.log('sđá')
        let OPENAI_API_KEY = await loadApiKey()
        // console.log(apiKey)
        if (OPENAI_API_KEY.length < 10) {
            res.status(500).json({
                success: false, error: 'The system has an unexpected error. Please contact admin.'
            });
            return
        }

        var module = new AssistaintModule(OPENAI_API_KEY)
        let vector_id = await module.createVector(file_ids)
        if (vector_id.includes("vector_")) {
            try {
                module.delVectorName(vector_id)
            } catch (error) {
                console.log('Xóa lỗi VTER')
            }
            res.status(500).json({
                success: false, error: 'No data file found.'
            });
            return
        }
        // vector đã tạo
        let assistant = await module.createAssistant(instructions, vector_id)
        console.log(file_ids)
        // Mình cần lưu vào
        var resRow = await astCreateRow(
            name, detail, image,
            instructions,
            vector_id,
            JSON.stringify(file_ids),
            assistant.id,
            JSON.stringify(assistant),
            JSON.stringify(suggests),
            name_model
        )
        res.status(200).json({
            success: true,
            message: resRow
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateAssistant = async (req, res) => {
    try {

        const { name, detail, image, instructions, file_ids, suggests, name_model, id } = req.body
        // Lấy api key
        let OPENAI_API_KEY = await loadApiKey()
        if (OPENAI_API_KEY.length < 10) {
            res.status(500).json({
                success: false, error: 'The system has an unexpected error. Please contact admin.'
            });
            return
        }

        var module = new AssistaintModule(OPENAI_API_KEY)
        let assistant_old = await findAssistant(id)
        if (!assistant_old) {
            // Không tìm thấy đối tượng
            res.status(404).json({ success: false, message: 'Assistant not found' });
            return
        }
        if (JSON.stringify(file_ids) != assistant_old.file_ids) {
            // cập nhập nhật mới vector và assistant, xóa đi các bản cũ
            // Xóa đi các file cũ
            // console.log('del file_id')
            const old_file_ids = JSON.parse(assistant_old.file_ids)
            for (let index = 0; index < old_file_ids.length; index++) {
                const element = old_file_ids[index];
                if (!file_ids.includes(element)) {
                    await module.delFile(element)
                }
            }
            // Xóa vector cũ
            try {
                const asset = await module.deleteAssistant(assistant_old.assistant_id)
                console.log(asset)
            } catch (error) {
                console.log(error)
            }
            try {
                await module.delVector(assistant_old.vector_id)
            } catch (error) {
                console.log('Xóa vector lỗi')
            }
            // Tạo mới vector và assistant
            let vector_id = await module.createVector(file_ids)
            // vector đã tạo
            let assistant = await module.createAssistant(instructions, vector_id)
            // Trợ lý mới đã được tạo 
            var resRow = await astUpdateRow(
                name, detail, image,
                instructions,
                vector_id,
                JSON.stringify(file_ids),
                assistant.id,
                JSON.stringify(assistant),
                JSON.stringify(suggests),
                name_model,
                assistant_old.id
            )
            // Xóa trợ lý cũ

            // Danh sách trợ lý
            res.status(200).json({
                success: true,
                message: `Update success new assistant`,
                data: resRow
            });
        } else {
            if (instructions != assistant_old.instructions) {
                // xóa trợ lý cũ
                try {
                    const asset = await module.deleteAssistant(assistant_old.assistant_id)
                    console.log(asset)
                } catch (error) {
                    console.log(error)
                }
                let assistant = await module.createAssistant(instructions, assistant_old.vector_id)
                // Trợ lý mới đã được tạo 
                var resRow = await astUpdateRow(
                    name, detail, image,
                    instructions,
                    assistant_old.vector_id,
                    assistant_old.file_ids,
                    assistant.id,
                    JSON.stringify(assistant),
                    JSON.stringify(suggests),
                    name_model,
                    assistant_old.id
                )
                // Danh sách trợ lý
                res.status(200).json({
                    success: true,
                    message: `Update success old assistant`,
                    data: resRow
                });
            } else {
                var resRow = await astUpdateRow(
                    name, detail, image,
                    instructions,
                    assistant_old.vector_id,
                    assistant_old.file_ids,
                    assistant_old.assistant_old,
                    assistant_old.assistant,
                    JSON.stringify(suggests),
                    name_model,
                    assistant_old.id
                )
                // Danh sách trợ lý
                res.status(200).json({
                    success: true,
                    message: `Update success old assistant`,
                    data: resRow
                });
            }

        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Tìm và xóa trợ lý

exports.find = async (req, res) => {
    try {
        const { id } = req.body
        const assistant = await Assistant.findByPk(id);
        if (!assistant) {
            return res.status(404).json({ success: false, message: "Assistant not found" });
        }
        // Tìm kiếm trợ lý
        if (req.user.role == 1) {
            res.status(200).json({
                success: true,
                message: `Find success.`,
                data: assistant
            });
        } else {
            res.status(200).json({
                success: true,
                message: `Find success.`,
                data: {
                    id: assistant.id,
                    name: assistant.name,
                    detail: assistant.detail,
                    image: assistant.image,
                    suggests: assistant.suggests,
                    view: assistant.view,
                    status: assistant.status
                },
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.body;
        let OPENAI_API_KEY = await loadApiKey()
        if (OPENAI_API_KEY.length < 10) {
            res.status(500).json({
                success: false, error: 'The system has an unexpected error. Please contact admin.'
            });
            return
        }
        var module = new AssistaintModule(OPENAI_API_KEY)
        // Tìm khóa học theo ID
        const assistant = await Assistant.findByPk(id);
        if (!assistant) {
            return res.status(404).json({ success: false, message: "Assistant not found" });
        }
        // console.log('del file_id')
        const old_file_ids = JSON.parse(assistant.file_ids)
        for (let index = 0; index < old_file_ids.length; index++) {
            const element = old_file_ids[index];
            try { await module.delFile(element) } catch (error) { }
        }
        // Xóa vector cũ
        // console.log('del vector')
        try { await module.delVector(assistant.vector_id) } catch (error) { }
        // Xóa khóa học
        await assistant.destroy();
        res.status(200).json({
            success: true,
            message: "Assistant deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//gợi ý tìm kiếm
exports.suggest = async (req, res) => {
    try {
        const { search } = req.body;

        // Tìm RealEstate theo ID
        const locations = await Assistant.findAll({
            attributes: ['id', 'name', 'assistant_id'],
            where: {
                name: {
                    [Op.like]: `%${search}%`
                }
            }
        });
        if (locations) {
            return res.json(
                {
                    success: true,
                    data: locations
                }
            );
        }
        else {
            return res.json({
                success: false,
                msg: "Not found"
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
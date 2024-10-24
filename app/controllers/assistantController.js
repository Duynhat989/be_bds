const { STATUS, Assistant, loadApiKey, loadModel, astCreateRow, findAssistant, astUpdateRow } = require("../models");
const { encryption, compare } = require('../utils/encode');
const { Assistaint } = require('../modules/assistaint.module')

// Lấy danh sách tất cả học sinh
exports.getAllAssistant = async (req, res) => {
    try {
        const { page = 0, limit = 10 } = req.query;
        // Danh sách trợ lý
        const data = await Assistant.findAll({
            where: { status: STATUS.ON },
            attributes: ['id', 'name', 'detail', 'image', 'suggests','view'],
            limit: parseInt(limit), 
            offset: parseInt(page) * parseInt(limit) 
        });
        res.status(200).json({
            success: true,
            message: `List Assistant`,
            data: data
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createAssistant = async (req, res) => {
    try {
        const { name, detail, image, instructions, file_ids, suggests } = req.body
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

        var module = new Assistaint(OPENAI_API_KEY)
        let vector_id = await module.createVector(file_ids)
        if(vector_id.includes("vector_")){
            module.delVectorName(vector_id)
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
            name, detail, image, instructions, vector_id, JSON.stringify(file_ids), assistant.id, JSON.stringify(assistant), JSON.stringify(suggests)
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
        const { name, detail, image, instructions, file_ids, suggests, id } = req.body
        // Lấy api key
        let OPENAI_API_KEY = await loadApiKey()
        if (OPENAI_API_KEY.length < 10) {
            res.status(500).json({
                success: false, error: 'The system has an unexpected error. Please contact admin.'
            });
            return
        }

        var module = new Assistaint(OPENAI_API_KEY)
        let assistant_old = await findAssistant(id)
        if (!assistant_old) {
            // Không tìm thấy đối tượng
            res.status(404).json({ success: false, message: 'Assistant not found' });
            return
        }
        if (JSON.stringify(file_ids) != assistant_old.file_ids) {
            // cập nhập nhật mới vector và assistant, xóa đi các bản cũ
            // Xóa đi các file cũ
            console.log('del file_id')
            const old_file_ids = JSON.parse(assistant_old.file_ids)
            for (let index = 0; index < old_file_ids.length; index++) {
                const element = old_file_ids[index];
                if (!file_ids.includes(element)) {
                    await module.delFile(element)
                }
            }
            // Xóa vector cũ
            console.log('del vector')
            await module.delVector(assistant_old.vector_id)


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
                assistant_old.id
            )
            // Danh sách trợ lý
            res.status(200).json({
                success: true,
                message: `Update success new assistant`,
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
                assistant_old.id
            )
            // Danh sách trợ lý
            res.status(200).json({
                success: true,
                message: `Update success old assistant`,
                data: resRow
            });
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
        if(req.user.role == 1){
            res.status(200).json({
                success: true,
                message: `Find success.`,
                data: assistant
            });
        }else{
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

        var module = new Assistaint(OPENAI_API_KEY)
        // Tìm khóa học theo ID
        const assistant = await Assistant.findByPk(id);
        if (!assistant) {
            return res.status(404).json({ success: false, message: "Assistant not found" });
        }

        console.log('del file_id')
        const old_file_ids = JSON.parse(assistant.file_ids)
        for (let index = 0; index < old_file_ids.length; index++) {
            const element = old_file_ids[index];
            await module.delFile(element)
        }
        // Xóa vector cũ
        console.log('del vector')
        await module.delVector(assistant.vector_id)

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

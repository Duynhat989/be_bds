const { STATUS, Assistant, loadApiKey, loadModel, astCreateRow, findAssistant, astUpdateRow } = require("../models");
const { encryption, compare } = require('../utils/encode');
const { Assistaint } = require('../modules/assistaint.module')

// Lấy danh sách tất cả học sinh
exports.getAllAssistant = async (req, res) => {
    try {
        // Danh sách trợ lý
        const data = await Assistant.findAll({
            where: { status: STATUS.ON },
            attributes: ['id', 'name', 'detail', 'image', 'suggests']
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
        console.log('sđá')
        let OPENAI_API_KEY = await loadApiKey()
        // console.log(apiKey)
        if (OPENAI_API_KEY.length < 10) {
            res.status(500).json({
                success: false, error: 'Key not found'
            });
            return
        }
        
        var module = new Assistaint(OPENAI_API_KEY)
        let vector_id = await module.createVector(file_ids)
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
                success: false, error: 'Key not found'
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
            const old_file_ids = JSON.parse(assistant_old.file_ids)
            for (let index = 0; index < old_file_ids.length; index++) {
                const element = old_file_ids[index];
                if (!file_ids.includes(element)) {
                    await module.delFile(element)
                }
            }
            // Xóa vector cũ
            await module.delVector(vector_id)
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
                message: `Update success`,
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
                message: `Update success`,
                data: resRow
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

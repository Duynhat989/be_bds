const { Prompt } = require("../models");
const STATUS = {
    ON: 1,
    OFF: 2
};

// Lấy danh sách tất cả Prompt với status là ON
exports.getPrompts = async (req, res) => {
    try {
        const { assistant_id, page = 1, limit = 10 } = req.body
        const offset = parseInt(page - 1) * parseInt(limit) 
        const user_id = req.user.id
        console.log({ 
            status: STATUS.ON,
            assistant_id:assistant_id,
            user_id:user_id
        })
        let count = await Prompt.count({
            where: { 
                status: STATUS.ON,
                assistant_id:assistant_id,
                user_id:user_id
            },
        });
        let prompts = await Prompt.findAll({
            where: { 
                status: STATUS.ON,
                assistant_id:assistant_id,
                user_id:user_id
            },
            attributes:["id","name","prompt_text","status"],
            limit: parseInt(limit),
            offset: offset
        });
        res.status(200).json({
            success: true,
            prompts: prompts,
            total:count,
            page:page,
            limit:limit
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Tìm kiếm Prompt theo ID
exports.findPromptById = async (req, res) => {
    try {
        const { id } = req.body;
        const prompt = await Prompt.findByPk(id);

        if (!prompt) {
            return res.status(404).json({ success: false, message: "Prompt not found" });
        }

        res.status(200).json({
            success: true,
            data: {
                id:prompt.id,
                name:prompt.name,
                prompt_text:prompt.prompt_text,
                status:prompt.status
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Tạo Prompt mới
exports.createPrompt = async (req, res) => {
    try {
        const { assistant_id, prompt_text,name } = req.body;
        const user_id = req.user.id
        // Tạo Prompt mới
        const newPrompt = await Prompt.create({
            user_id,
            assistant_id,
            name,
            prompt_text,
            status: STATUS.ON
        });

        res.status(200).json({
            success: true,
            message: "Prompt created successfully",
            data: {
                id:newPrompt.id,
                name:newPrompt.name,
                prompt_text:newPrompt.prompt_text,
                status:newPrompt.status
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cập nhật Prompt theo ID
exports.updatePromptById = async (req, res) => {
    try {
        const { id, prompt_text,
            name, status } = req.body;
        const user_id = req.user.id
        // Tìm Prompt theo ID
        const prompt = await Prompt.findByPk(id);
        if (!prompt) {
            return res.status(404).json({ success: false, message: "Prompt not found" });
        }
        if(user_id != prompt.user_id){
            return res.status(404).json({ success: false, message: "User not confirm" });
        }
        // Cập nhật thông tin
        prompt.prompt_text = prompt_text || prompt.prompt_text;
        prompt.name = name || prompt.name;
        prompt.status = status || prompt.status;

        // Lưu thay đổi
        await prompt.save();

        res.status(200).json({
            success: true,
            message: "Prompt updated successfully",
            data: {
                id:prompt.id,
                prompt_text:prompt.prompt_text,
                status:prompt.status
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Xóa Prompt theo ID
exports.deletePromptById = async (req, res) => {
    try {
        const { id } = req.body;
        const user_id = req.user.id
        // Tìm Prompt theo ID
        const prompt = await Prompt.findOne({
            where:{
                id:id,
                user_id:user_id
            }
        });
        if (!prompt) {
            return res.status(404).json({ success: false, message: "Prompt not found" });
        }

        // Xóa Prompt
        await prompt.destroy();

        res.status(200).json({
            success: true,
            message: "Prompt deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

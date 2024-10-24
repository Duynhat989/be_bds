const { STATUS, Conversation, astConversation, findConversation, updateConversation, loadApiKey, findAssistant } = require("../models");
const { encryption, compare } = require('../utils/encode');
const { Assistaint } = require('../modules/assistaint.module')

// Lấy danh sách tất cả học sinh
exports.createThread = async (req, res) => {
    try {
        const { assistant_id } = req.body
        // Lấy thông tin trợ lý
        let assistant = await findAssistant(assistant_id)
        if (!assistant) {
            res.status(500).json({ success: false, message: 'Not found assistant' });
            return
        }
        // Danh sách trợ lý
        let OPENAI_API_KEY = await loadApiKey()
        // console.log(apiKey)
        if (OPENAI_API_KEY.length < 10) {
            res.status(500).json({
                success: false, error: 'The system has an unexpected error. Please contact admin.'
            });
            return
        }
        const module = new Assistaint(OPENAI_API_KEY)
        let thread = await module.start()
        // Tìm kiếm assistant
        console.log(assistant)
        const conversations = await astConversation(
            "Tư vấn",
            req.user.id,
            thread.id,
            assistant.assistant_id,
            "[]"
        )
        console.log(thread)
        res.status(200).json({
            success: true,
            message: `Create conversation`,
            data: {
                id: thread.id.split('_')[1]
            },
            message: conversations
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createConversation = async (req, res) => {
    try {
        const { thread_id, message } = req.body
        // Auto send stream
        let msg = await findConversation(req.user.id, `thread_${thread_id}`)
        if (!msg) {
            res.status(500).json({ success: false, message: 'Not found messages' });
            return
        }
        // Danh sách trợ lý
        let OPENAI_API_KEY = await loadApiKey()
        // console.log(apiKey)
        if (OPENAI_API_KEY.length < 10) {
            res.status(500).json({
                success: false, error: 'The system has an unexpected error. Please contact admin.'
            });
            return
        }
        const module = new Assistaint(OPENAI_API_KEY)
        await module.addMessage(`thread_${thread_id}`, message)
        // create 
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        // Tin nhắn cũ
        const sendMessage = async (data) => {
            // console.log(data)
            if (!data.completed) {
                res.write(`data: ${JSON.stringify({
                    success: true,
                    data
                })}\n\n`);
            } else {
                // update tin nhắn 
                let newMsg = JSON.parse(msg.messages) || []
                newMsg.push({
                    role: "user",
                    content: message
                })
                newMsg.push({
                    role: "model",
                    content: data.full
                })
                await updateConversation(JSON.stringify(newMsg), msg.id)
                res.write(`data: ${JSON.stringify({
                    success: true,
                    data
                })}\n\n`);
                res.end();
            }
        }
        module.chat(msg.assistant_id, `thread_${thread_id}`, sendMessage)
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.conversation = async (req, res) => {
    try {
        const { thread_id } = req.body
        // Danh sách cuộc hội thoại này
        var list = await findConversation(req.user.id, `thread_${thread_id}`)
        if (list) {
            res.status(200).json({
                success: true,
                message: `conversation`,
                data: {
                    id: list.id,
                    name: list.name,
                    messages: JSON.parse(list.messages) || [],
                    status: list.status
                }
            });
        } else {
            res.status(500).json({
                success: false,
                message: `Not found messages`,
                data: ''
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
const { STATUS, Conversation, astConversation, findConversation, updateConversation, loadApiKey, findAssistant, addDayCount, checkLimit } = require("../models");
const { encryption, compare } = require('../utils/encode');
const { Assistaint } = require('../modules/assistaint.module')
const { Gpt } = require('../modules/gpt.module')

const { License,Day,Package } = require('../models')

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
        // console.log(assistant)
        const conversations = await astConversation(
            "Tư vấn",
            req.user.id,
            thread.id,
            assistant_id,
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
        const user_id = req.user.id
        // Cộng thêm request vào ngày 
        if(await checkLimit(await getLicense(user_id))){
            addDayCount(user_id)
        }else{
            res.status(500).json({ success: false, message: 'License expired, please upgrade' });
            return
        }
        // Auto send stream
        let msg = await findConversation(req.user.id, `thread_${thread_id}`)
        
        let assistant = await findAssistant(msg.assistant_id)
        if (!assistant) {
            res.status(500).json({ success: false, message: 'Not found assistant' });
            return
        }
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
                res.write(`${JSON.stringify({
                    success: true,
                    data
                })}\r\n`);
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
                res.write(`${JSON.stringify({
                    success: true,
                    data
                })}\r\n`);
                res.end();
            }
        }
        module.chat(assistant.assistant_id, `thread_${thread_id}`, sendMessage)
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
exports.chat = async (req, res) => {
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

const getLicense = async (user_id) => {
    let licenses = await License.findOne({
        where: {
            user_id: user_id
        }
    });
    if (!licenses) {
        let currentDate = new Date();
        let expirationDate = new Date(currentDate.getTime() + 5 * 24 * 60 * 60 * 1000);
        // Chuyển expirationDate thành dạng DATEONLY (YYYY-MM-DD)
        expirationDate = expirationDate.toISOString().split('T')[0];
        licenses = await License.create({
            user_id: user_id,
            pack_id: 1,
            date: expirationDate
        })
    }
    let result = {
        ...{
            id: licenses.dataValues.id,
            date: licenses.dataValues.date
        }
    }
    const pack_id = licenses.dataValues.pack_id
    const pack = await Package.findByPk(pack_id)
    result = {
        ...result,
        ...{
            pack: {
                name: pack.dataValues.name,
                price: pack.dataValues.price,
                ask: pack.dataValues.ask,
                features: pack.dataValues.features
            }
        }
    }
    // Lấy thông tin day
    const today = new Date().toISOString().split('T')[0]; // Lấy ngày hiện tại dạng 'YYYY-MM-DD'
    let day = await Day.findOne({
        where: {
            user_id: licenses.dataValues.user_id,
            date: today
        }
    })
    if (!day) {
        day = await Day.create({
            user_id: user_id,
            date: today,
            count: 0
        });
    }
    result = {
        ...result,
        ...{
            day: {
                id: day.dataValues.id,
                date: day.dataValues.date,
                count: day.dataValues.count
            }
        }
    }
    return result
}
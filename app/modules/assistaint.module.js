const OpenAI = require("openai");
const crypto = require('crypto');


class Assistaint {
    constructor(myKey) {
        this.myKey = myKey
        this.openai = new OpenAI({ apiKey: this.myKey });
    }
    start = async () => {
        const thread = await this.openai.beta.threads.create();
        return thread;
    };
    createAssistant = async (instructions, vectorStoreId, model) => {
        let handle = await this.generateRandomMD5()
        // handle : đây là giá trị đặc trưng hoặc có thể là id của trợ lý
        const assistant = await this.openai.beta.assistants.create({
            name: `assistant_${handle}`,
            instructions: instructions,
            tools: [{ type: "file_search" }],
            tool_resources: { file_search: { vector_store_ids: [vectorStoreId] } },
            model: "gpt-4o",
            top_p: 0.2,
            temperature: 0,
        });
        return assistant
    };
    createVector = async (file_ids) => {
        let handle = await this.generateRandomMD5()
        const vectorStore = await this.openai.beta.vectorStores.create({
            name: `vector_${handle}`,
            file_ids: file_ids,
        });
        return vectorStore.id;
    }
    delVector = async (vector_id) => {
        const deletedVectorStore = await openai.beta.vectorStores.del(
            vector_id
        );
        return deletedVectorStore;
    }
    delFile = async (file_id) => {
        const file = await openai.files.del(file_id);
        console.log(file);
        return file;
    }
    listAssistant = async () => {
        const myAssistants = await this.openai.beta.assistants.list({
            order: "desc",
            limit: "50",
        });
        return myAssistants
    };
    editAssistant = async () => {

        return true
    };
    deleteAssistant = async (assistant_id) => {
        const response = await openai.beta.assistants.del(assistant_id);
        return response
    };
    generateRandomMD5() {
        // Lấy thời gian hiện tại
        const currentTime = Date.now().toString();
        // Tạo chuỗi ngẫu nhiên dài 7 ký tự
        const randomString = Math.random().toString(36).substring(2, 9);
        // Kết hợp thời gian và chuỗi ngẫu nhiên
        const combinedString = currentTime + randomString;
        // Tạo mã MD5 từ chuỗi kết hợp
        const md5Hash = crypto.createHash('md5').update(combinedString).digest('hex');
        return md5Hash;
    }
}
module.exports = {
    Assistaint
}
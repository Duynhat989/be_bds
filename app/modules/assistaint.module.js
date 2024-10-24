const OpenAI = require("openai");
const crypto = require('crypto');


class Assistaint {
    constructor(myKey) {
        this.myKey = myKey
        this.openai = new OpenAI({ apiKey: this.myKey });
        this.textTimeout;
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
        const name = `vector_${handle}`
        try {
            const vectorStore = await this.openai.beta.vectorStores.create({
                name: name,
                file_ids: file_ids,
            });
            return vectorStore.id;
        } catch (error) {
            return name
        }
    }
    delVectorName = async (nameVector) => {
        const vectorStores = await this.openai.beta.vectorStores.list();
        const vectors = vectorStores.data
        for (let index = 0; index < vectors.length; index++) {
            const vector = vectors[index];
            if(nameVector == vector.name){
                this.delVector(vector.id)
            }
        }
    }
    delVector = async (vector_id) => {
        const deletedVectorStore = await this.openai.beta.vectorStores.del(
            vector_id
        );
        return deletedVectorStore;
    }
    delFile = async (file_id) => {
        const file = await this.openai.files.del(file_id);
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
        const response = await this.openai.beta.assistants.del(assistant_id);
        return response
    };
    addMessage = async (thread_id, content) => {
        const messages = await this.openai.beta.threads.messages.create(
            thread_id,
            {
                role: "user",
                content: content
            }
        );
        return messages
    }
    chat = async (assistant_id, thread_id, sendMessage) => {
        const run = this.openai.beta.threads.runs.stream(thread_id, {
            assistant_id: assistant_id
        })
            .on('textCreated', (text) => {
                console.log("LOG: ", text)
            })
            .on('textDelta', (textDelta, snapshot) => {
                clearTimeout(this.textTimeout);
                sendMessage({
                    completed: false,
                    text: textDelta.value,
                    full: snapshot.value
                });
                this.textTimeout = setTimeout(() => {
                    sendMessage({
                        completed: true,
                        text: textDelta.value,
                        full: snapshot.value
                    });
                }, 4000);
            })
            .on('toolCallCreated', (toolCall) => {
                console.log("LOG1: ", toolCall)
                process.stdout.write(`\nassistant > ${toolCall.type}\n\n`)
            })
            .on('toolCallDelta', (toolCallDelta, snapshot) => {
                if (toolCallDelta.type === 'code_interpreter') {
                    if (toolCallDelta.code_interpreter.input) {
                        process.stdout.write(toolCallDelta.code_interpreter.input);
                    }
                    if (toolCallDelta.code_interpreter.outputs) {
                        process.stdout.write("\noutput >\n");
                        toolCallDelta.code_interpreter.outputs.forEach(output => {
                            if (output.type === "logs") {
                                process.stdout.write(`\n${output.logs}\n`);
                            }
                        });
                    }
                }
            });
        return true;
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
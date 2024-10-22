const { createAssistant } = require("../service/openai.service");
class Assistaint {
    constructor(myKey) {
        this.myKey = myKey
    }
    start = async () => {
        const openai = new OpenAI({ apiKey: this.myKey });
        const thread = await openai.beta.threads.create();
        return thread;
    };
    setupAssistant = async (handle) => {
        // handle : đây là giá trị đặc trưng hoặc có thể là id của trợ lý
        const openai = new OpenAI({ apiKey: this.myKey });
        const assistant = await createAssistant(openai, handle);
        console.log(assistant)
    };
    listAssistant = async (handle) => {
        // -----------
        
        
    };
}
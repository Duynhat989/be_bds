const fs = require("fs");

// Hàm để tải nhiều file lên OpenAI
const uploadFile = async (openai, filePath) => {
  const file = await openai.files.create({
    file: fs.createReadStream(filePath),
    purpose: "assistants",
  });
  return file.id;
};

// Hàm để tạo vector store từ nhiều file đã tải lên
const createVectorStore = async (openai, fileIds, handle) => {
  const vectorStore = await openai.beta.vectorStores.create({
    name: `Vector_${handle}`,
    file_ids: fileIds,
  });
  return vectorStore.id;
};

// Hàm để tạo trợ lý
const createAssistant = async (openai, handle, instructions, vectorStoreId) => {
  const assistant = await openai.beta.assistants.create({
    name: `Assistant_${handle}`,
    instructions: instructions,
    tools: [{ type: "file_search" }],
    tool_resources: { file_search: { vector_store_ids: [vectorStoreId] } },
    model: "gpt-4o-mini",
    top_p: 0.2,
    temperature: 0,
  });
  return assistant;
};

// Hàm để đọc hoặc tạo trợ lý mới với nhiều file
const getOrCreateAssistant = async (openai, handle, vectorStoreId, instructions) => {
  const assistantFilePath = `./service/assistant_data/${handle}_assistant.json`;
  if (!fs.existsSync(assistantFilePath)) {
    const assistant = await createAssistant(openai, handle, instructions, vectorStoreId);
    // Ghi thông tin trợ lý vào file
    fs.writeFileSync(assistantFilePath, JSON.stringify(assistant));
    return assistant;
  } else {
    // Đọc trợ lý từ file
    const assistant = JSON.parse(fs.readFileSync(assistantFilePath));
    return assistant;
  }
};

// Hàm để liệt kê tất cả trợ lý
const listAssistants = async (openai) => {
  const myAssistants = await openai.beta.assistants.list({
    order: "desc",
    limit: "20",
  });
  console.log(myAssistants.data);
};

// Hàm để cập nhật trợ lý
const updateAssistant = async (openai, assistantId, instructions, name) => {
  const updatedAssistant = await openai.beta.assistants.update(assistantId, {
    instructions: instructions,
    name: name,
    tools: [{ type: "file_search" }],
    model: "gpt-4o-mini",
  });

  console.log(updatedAssistant);
};
const chatThreadMessage = async (apiKey, assistantId, threadId, message) => {
  const openai = new OpenAI({ apiKey: apiKey });
  if (!threadId) {
    return res.status(400).json({ error: "Missing thread_id" });
  }
  console.log(`Received message: ${message} for thread ID: ${threadId}`);
  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: message,
  });
  const run = await openai.beta.threads.runs.createAndPoll(threadId, {
    assistant_id: assistantId,
    // max_completion_tokens: 500
  },
  );
  console.log(run)
  const messages = await openai.beta.threads.messages.list(run.thread_id);
  // console.log(messages)
  const response = messages.data[0].content[0].text.value;
  return response;
};
// Xuất các hàm
module.exports = {
  uploadFile,
  createVectorStore,
  getOrCreateAssistant,
  listAssistants,
  updateAssistant,
  chatThreadMessage
};

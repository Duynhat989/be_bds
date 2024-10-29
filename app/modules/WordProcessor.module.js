const fs = require('fs');
const { Document, Packer, Paragraph, TextRun } = require("docx");

class WordProcessor {
  constructor(xpath) {
    this.xpath = xpath;
  }

  async readAndReplace(replacements) {
    try {
      const buffer = fs.readFileSync(this.xpath);

      // Tạo tài liệu mới từ buffer đã đọc
      const doc = await Document.load(buffer);

      // Lặp qua tất cả các đoạn và thay thế từ khóa
      doc.paragraphs.forEach((paragraph) => {
        paragraph.children.forEach((child) => {
          if (child instanceof TextRun) {
            let text = child.text;
            for (let [key, value] of Object.entries(replacements)) {
              const regex = new RegExp(key, 'g');
              text = text.replace(regex, value);
            }
            child.text = text;
          }
        });
      });

      // Xuất file đã thay thế
      const replacedBuffer = await Packer.toBuffer(doc);
      fs.writeFileSync(this.xpath, replacedBuffer);
      console.log("Nội dung đã được thay thế thành công!");
    } catch (error) {
      console.error("Lỗi khi đọc hoặc thay thế file Word:", error);
    }
  }
}

module.exports = {
    WordProcessor
};


// Sử dụng class
// const processor = new WordProcessor('path/to/your/document.docx');
// processor.readAndReplace({
//   "từ khóa 1": "giá trị thay thế 1",
//   "từ khóa 2": "giá trị thay thế 2",
// });

const { STATUS, Files, loadApiKey } = require("../models");
const { encryption, compare } = require('../utils/encode');
const fs = require('fs'); // Thêm dòng này để import fs
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');


// Lấy danh sách tất cả học sinh
const upload = multer({ dest: 'uploads/' }); // Thư mục lưu tạm
exports.updateFile = async (req, res) => {
    // Lấy khóa api
    try { 
        let OPENAI_API_KEY = await loadApiKey()
        console.log(OPENAI_API_KEY)
        if (OPENAI_API_KEY.length < 10) {
            res.status(500).json({
                success: false, error: 'Key not found'
            });
            return
        }
        // Tạo form data từ file được gửi lên
        const formData = new FormData();
        formData.append('purpose', 'assistants');
        formData.append('file', fs.createReadStream(req.file.path)); // Đường dẫn tới tệp đã lưu
        const uploadResponse = await axios.post('https://api.openai.com/v1/files', formData, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                ...formData.getHeaders(),
            },
        });
        const fileId = uploadResponse.data.id; // Lưu ID tệp để sử dụng sau
        console.log('Uploaded file ID:', uploadResponse.data);
        // Xóa tệp sau khi xử lý
        fs.unlinkSync(req.file.path); // Xóa tệp đã lưu tạm
        res.status(200).json({
            success: true,
            data: uploadResponse.data,
            id: fileId
        }); // Gửi ID tệp về client
    } catch (error) {
        console.error('Error uploading file:', error.response ? error.response.data : error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to upload file'
        });
    }
};
exports.deleteFile = async (req, res) => {
    try {
        const fileId = req.params.fileId; // Lấy ID tệp từ tham số URL
        // Lấy khóa api
        let OPENAI_API_KEY = await loadApiKey()
        console.log(OPENAI_API_KEY)
        if (OPENAI_API_KEY.length < 10) {
            res.status(500).json({
                success: false, error: 'Key not found'
            });
        }
        const response = await axios.delete(`https://api.openai.com/v1/files/${fileId}`, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
        });
        let json = response.data
        console.log(json)
        res.status(200).json({
            success: true,
            data: json
        });
    } catch (error) {
        res.status(500).json({
            success: false, error: 'Failed to delete file'
        });
    }
}


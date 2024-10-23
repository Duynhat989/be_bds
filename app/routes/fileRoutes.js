const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController.js");
const auth = require('../middlewares/authMiddleware.js');
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Thư mục lưu tạm
    },
    filename: (req, file, cb) => {
      // Ghi đè tên tệp với định dạng {tên gốc}.{phần mở rộng}
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname)); // Thêm phần mở rộng
    }
  });
// Lấy danh sách tất cả học sinh
const upload = multer({ storage: storage }); // Thư mục lưu tạm

// Lấy danh sách tất cả học sinh
router.post("/file/upload", auth([1, 3]), upload.single('file'), fileController.updateFile);

// Xóa file ở server
router.delete("/file/:fileId", auth([1, 3]), fileController.deleteFile);


module.exports = router;

const express = require("express");
const router = express.Router();
const estaleController = require("../controllers/estaleController.js");
const { validate } = require('../middlewares/validation.js');
const auth = require('../middlewares/authMiddleware.js');


// Lấy danh sách tất cả học sinh
router.get("/estales", auth([1, 3]), estaleController.getAllRealEstates);
// Tìm khóa học 
router.post("/estale/find", auth([1,3]),validate(['id']), estaleController.findRealEstateById);
// Kiểm tra theo tên
router.post("/estale/findUrl", auth([1,3]),validate(['base_url']), estaleController.findRealEstateByUrl);
// Tạo trợ lý
router.post("/estale/create", auth([1]),validate(['title']), estaleController.createRealEstate);
// Cập nhật trợ lý
router.post("/estale/update", auth([1]),validate(['id']), estaleController.editRealEstate);
// Xóa khóa học
router.delete("/estale/delete", auth([1]),validate(['id']), estaleController.deleteRealEstate);

router.get("/estale/province", auth([1,3]), estaleController.province);
//danh sách gợi ý
router.get("/estale/location", auth([1,3]), estaleController.location);
//danh sách gợi ý
router.get("/estale/name", auth([1,3]), estaleController.nameEsal);
// Tạo trợ lý
module.exports = router;

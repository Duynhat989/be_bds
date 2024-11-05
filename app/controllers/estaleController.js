const { STATUS, RealEstate } = require("../models");

// Lấy danh sách tất cả các RealEstate có status = 1
exports.getAllRealEstates = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = parseInt(page - 1) * parseInt(limit) 
        // Phần tìm kiếm theo tên 
        let wge = {
            status: STATUS.ON
        }
        if (search.length > 2) {
            wge.name = {
                [Op.like]: `%${search}%`
            }
        }
        let count = await RealEstate.count({
            where: wge
        });
        let realEstates = await RealEstate.findAll({
            where: wge,
            limit: parseInt(limit), 
            offset: offset
        });
        res.status(200).json({
            success: true,
            realEstates: realEstates,
            total:count,
            page:page,
            limit:limit
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.findRealEstateById = async (req, res) => {
    try {
        const { id } = req.body;

        // Tìm RealEstate theo ID
        const realEstate = await RealEstate.findByPk(id);
        if (!realEstate) {
            return res.status(404).json({ success: false, message: "RealEstate not found" });
        }
        // Trả về thông tin chi tiết của RealEstate
        res.status(200).json({
            success: true,
            message: "RealEstate found",
            data: {
                title: realEstate.title,
                description: realEstate.description,
                price: realEstate.price,
                area: realEstate.area,
                location: realEstate.location,
                exten: realEstate.exten,
                base_url: realEstate.base_url,
                image: realEstate.image
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createRealEstate = async (req, res) => {
    try {
        const { title, description, price, area, location, exten, base_url,keyword, image } = req.body;

        // Tạo RealEstate mới
        const newRealEstate = await RealEstate.create({
            title,
            description,
            price,
            area,
            location,
            exten,
            base_url,
            keyword,
            image
        });

        res.status(200).json({
            success: true,
            message: "RealEstate created successfully",
            data: newRealEstate
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.editRealEstate = async (req, res) => {
    try {
        const { id, title, description, price, area, location, exten, base_url, image } = req.body;

        // Tìm RealEstate theo ID
        const realEstate = await RealEstate.findByPk(id);
        if (!realEstate) {
            return res.status(404).json({ success: false, message: "RealEstate not found" });
        }

        // Cập nhật thông tin RealEstate
        realEstate.title = title || realEstate.title;
        realEstate.description = description || realEstate.description;
        realEstate.price = price || realEstate.price;
        realEstate.area = area || realEstate.area;
        realEstate.location = location || realEstate.location;
        realEstate.exten = exten || realEstate.exten;
        realEstate.base_url = base_url || realEstate.base_url;
        realEstate.keyword = keyword || realEstate.keyword;
        realEstate.image = image || realEstate.image;

        // Lưu thay đổi
        await realEstate.save();

        res.status(200).json({
            success: true,
            message: "RealEstate updated successfully",
            data: realEstate
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteRealEstate = async (req, res) => {
    try {
        const { id } = req.body;

        // Tìm RealEstate theo ID
        const realEstate = await RealEstate.findByPk(id);
        if (!realEstate) {
            return res.status(404).json({ success: false, message: "RealEstate not found" });
        }

        // Xóa RealEstate
        await realEstate.destroy();

        res.status(200).json({
            success: true,
            message: "RealEstate deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

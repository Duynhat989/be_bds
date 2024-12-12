const { STATUS, RealEstate } = require("../models");
const { Sequelize, Op } = require('sequelize');
const removeDiacritics = require('remove-diacritics');

// Lấy danh sách tất cả các RealEstate có status = 1
exports.getAllRealEstates = async (req, res) => {
    try {
        const { page = 1, limit = 10, max_price,area, location, search = '',province='',type = '' } = req.query;
        const offset = parseInt(page - 1) * parseInt(limit);
        // 
        // Phần tìm kiếm theo tên 
        let wge = {
            status: STATUS.ON
        };
        if(province && province.length > 0){
            wge.province = {
                [Op.like]: `%${province}%`
            }
        }
        if(type && type.length > 0){
            wge.type = {
                [Op.like]: `%${type}%`
            }
        }
        if(max_price && max_price > 0){
            wge.priceNumber = {
                ...wge.priceNumber, // Giữ lại các điều kiện hiện có, nếu có
                [Op.lte]: max_price // Giá trị phải nhỏ hơn hoặc bằng `max_price`
            };
        }
        if(area && area.length > 0){
            let min_area = area.split('-')[0]
            let max_area = area.split('-')[1] || 100000
            wge.areaNumber = {
                [Op.between]: [min_area, max_area] // Giá trị phải nằm trong khoảng từ `min_price` đến `max_price`
            };
        }
        if(location && location.length > 0){
            wge.location = location
        }
        if (search && search.length > 0) {
            // Tách các từ trong chuỗi `search`
            const normalizedSearch = removeDiacritics(search.trim().toLowerCase());
            const keywords = normalizedSearch.split(' ').filter(word => word.length > 0);
            // const keywords = search.split(' ').filter(word => word.length > 0);
            const andConditions = [];
            for (const word of keywords) {
                const isNumber = /^\d+$/.test(word);
                console.log(word)
                andConditions.push({
                    keyword: {
                        [Op.like]: isNumber ? `%${word}%` : `%${word}%`
                    }
                });
            }
            wge[Op.and] = andConditions;
            console.log(JSON.stringify(andConditions))
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
            total: count,
            page: page,
            limit: limit
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
                province: realEstate.province,
                exten: realEstate.exten,
                type: realEstate.type,
                base_url: realEstate.base_url,
                image: realEstate.image
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.findRealEstateByUrl = async (req, res) => {
    try {
        const { base_url } = req.body;

        // Tìm RealEstate theo ID
        const realEstate = await RealEstate.findOne({
            where: {
                base_url: base_url
            }
        });
        if (realEstate) {
            return res.json(
                {
                    success: true,
                    data: {
                        id: realEstate.id,
                        price: realEstate.price,
                        updatedAt: realEstate.updatedAt
                    }
                }
            );
        }
        else {
            return res.json({
                success: false,
                msg: "Not found"
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.province = async (req, res) => {
    try {
        const {  } = req.body;

        // Tìm RealEstate theo ID
        const provinces = await RealEstate.findAll({
            attributes: ['province'],
            group: ['province'],
            where: Sequelize.where(
                Sequelize.literal(`LENGTH(province) - LENGTH(REPLACE(province, ' ', '')) + 1`),
                { [Sequelize.Op.lt]: 3 } // Điều kiện: số từ ít hơn 3
            )
        });
        if (provinces) {
            return res.json(
                {
                    success: true,
                    data: provinces
                }
            );
        }
        else {
            return res.json({
                success: false,
                msg: "Not found"
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.location = async (req, res) => {
    try {
        const { location } = req.query;

        // Tìm RealEstate theo ID
        const locations = await RealEstate.findAll({
            attributes: ['location'],
            group: ['location'],
            where: {
                location:{
                    [Op.like]: `%${location}%`
                }
            },
            limit:1000
        });
        if (locations) {
            return res.json(
                {
                    success: true,
                    data: locations,
                    quantity:locations.length
                }
            );
        }
        else {
            return res.json({
                success: false,
                msg: "Not found"
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.nameEsal = async (req, res) => {
    try {
        const { name } = req.query;

        // Tìm RealEstate theo ID
        const locations = await RealEstate.findAll({
            attributes: ['title'],
            where: {
                title:{
                    [Op.like]: `%${name}%`
                }
            },
            limit:500
        });
        if (locations) {
            return res.json(
                {
                    success: true,
                    data: locations,
                    quantity:locations.length
                }
            );
        }
        else {
            return res.json({
                success: false,
                msg: "Not found"
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createRealEstate = async (req, res) => {
    
    try {
        const { title,
            description,
            price,
            priceNumber,
            area,
            areaNumber,
            location,
            exten,
            province,
            type,
            base_url,
            keyword,
            image } = req.body;
    
        // Tạo RealEstate mới
        const newRealEstate = await RealEstate.create({
            title,
            description,
            price,
            priceNumber,
            area,
            areaNumber,
            location,
            exten,
            province,
            type: type ? type : "buy",
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
        const { id,
            title,
            description,
            price,
            priceNumber,
            area,
            areaNumber,
            location,
            province,
            exten,
            type,
            base_url,
            keyword,
            image } = req.body;

        // Tìm RealEstate theo ID
        const realEstate = await RealEstate.findByPk(id);
        if (!realEstate) {
            return res.status(404).json({ success: false, message: "RealEstate not found" });
        }

        // Cập nhật thông tin RealEstate
        realEstate.title = title || realEstate.title;
        realEstate.description = description || realEstate.description;
        realEstate.price = price || realEstate.price;
        realEstate.priceNumber = priceNumber || realEstate.priceNumber;
        realEstate.area = area || realEstate.area;
        realEstate.areaNumber = areaNumber || realEstate.areaNumber;
        realEstate.location = location || realEstate.location;
        realEstate.province = province || realEstate.province;
        realEstate.exten = exten || realEstate.exten;
        realEstate.type = type || realEstate.type;
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



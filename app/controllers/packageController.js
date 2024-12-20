const { Package, STATUS } = require("../models");

exports.getPackages = async (req, res) => {
    try {
        let packages = await Package.findAll({
            where: {
                status: STATUS.ON
            },
            attributes: ["id","name", "description", "price", "features","ask"],
            order: [["createdAt", "DESC"]],
        });
        res.status(200).json({
            success: true,
            packages: packages
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.addPackage = async (req, res) => {
    const { name, description, price, features, ask } = req.body;

    let newPackage = await Package.create({
        name,
        description,
        price,
        features,
        ask,
        status: STATUS.ON
    });

    res.status(201).json({
        success: true,
        package: newPackage
    });
    try {

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updatePackage = async (req, res) => {
    try {
        const { name, description, price, features,ask, id } = req.body;
        // Thêm dữ liệu mới
        let updatedPackage = await Package.update({
            name,
            description,
            price,
            features,
            ask
        }, {
            where: { id: id },
            attributes: ["id","name", "description", "price", "features","ask"]
        }
        );

        if (updatedPackage[0] === 0) {
            return res.status(404).json({ success: false, message: "Gói không tồn tại" });
        }

        res.status(200).json({
            success: true,
            message: "Cập nhật gói thành công"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deletePackage = async (req, res) => {
    try {
        const { id } = req.body;

        let deleted = await Package.destroy({
            where: { id: id }
        });

        if (!deleted) {
            return res.status(404).json({ success: false, message: "Gói không tồn tại" });
        }

        res.status(200).json({
            success: true,
            message: "Xóa gói thành công"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

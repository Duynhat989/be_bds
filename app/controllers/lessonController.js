const { STATUS, Lesson } = require("../models");
const { encryption, compare } = require('../utils/encode');

// Lấy danh sách tất cả học sinh
exports.lessons = async (req, res) => {
    try {
        let lessons = await Lesson.findAll({
            where:{
                status:1
            },
            order: [["createdAt", "DESC"]],
        })
        res.status(200).json({
            success: true,
            lessons:lessons
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.find = async (req, res) => {
    try {
        const { id } = req.body;

        // Tìm bài học theo ID
        const lesson = await Lesson.findByPk(id);
        if (!lesson) {
            return res.status(404).json({ success: false, message: "Lesson not found" });
        }
        // Trả về thông tin chi tiết của bài học
        res.status(200).json({
            success: true,
            message: "Lesson found",
            data: {
                name: lesson.name,
                detail: lesson.detail,
                image: lesson.image,
                indexRow: lesson.indexRow,
                url_video: lesson.url_video
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { name, detail, image, indexRow, url_video,course_id } = req.body;

        // Tạo bài học mới
        const newLesson = await Lesson.create({
            name,
            detail,
            image,
            indexRow,
            url_video,
            course_id
        });

        res.status(200).json({
            success: true,
            message: "Lesson created successfully",
            data: newLesson
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.edit = async (req, res) => {
    try {
        const { id, name, detail, image, indexRow, url_video } = req.body;

        // Tìm bài học theo ID
        const lesson = await Lesson.findByPk(id);
        if (!lesson) {
            return res.status(404).json({ success: false, message: "Lesson not found" });
        }

        // Cập nhật thông tin bài học
        lesson.name = name || lesson.name;
        lesson.detail = detail || lesson.detail;
        lesson.image = image || lesson.image;
        lesson.indexRow = indexRow || lesson.indexRow;
        lesson.url_video = url_video || lesson.url_video;

        // Lưu thay đổi
        await lesson.save();

        res.status(200).json({
            success: true,
            message: "Lesson updated successfully",
            data: lesson
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.delete = async (req, res) => {
    try {
        const { id } = req.body;

        // Tìm bài học theo ID
        const lesson = await Lesson.findByPk(id);
        if (!lesson) {
            return res.status(404).json({ success: false, message: "Lesson not found" });
        }

        // Xóa bài học
        await lesson.destroy();

        res.status(200).json({
            success: true,
            message: "Lesson deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

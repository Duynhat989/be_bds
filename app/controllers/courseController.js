const e = require("express");
const { STATUS, Course, Lesson, courseUser } = require("../models");
const { encryption, compare } = require('../utils/encode');

// Lấy danh sách tất cả học sinh
exports.courses = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = parseInt(page - 1) * parseInt(limit)
        let wge = {
            status: 1
        }
        if (search.length > 2) {
            wge.name = {
                [Op.like]: `%${search}%`
            }
        }
        let countCourse = await Course.count({
            where: wge
        });
        let courses = await Course.findAll({
            where: wge,
            limit: parseInt(limit),
            offset: offset
        })
        res.status(200).json({
            success: true,
            courses: courses,
            total: countCourse,
            page: page,
            limit: limit

        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.find = async (req, res) => {
    try {
        const { id } = req.body
        const user_id = req.user.id
        console.log(req.user)
        const course = await Course.findByPk(id);
        if (!course) {
            return res.status(404).json({ success: false, message: "course not found" });
        }
        // để lấy danh sách video bài giảng
        let lstLesson = [];

        let promese = {
            course_id: course.id
        }

        if (req.user.role == 3) {
            promese.user_id = user_id
            let courseU = await courseUser.findOne({
                where: promese
            })
            console.log(courseU)
            if (courseU) {
                lstLesson = await Lesson.findAll({
                    where: {
                        course_id: course.id
                    },
                    attributes: ["id", "name", "detail", "image", "indexRow", "url_video"]
                })
            }
            res.status(200).json({
                success: true,
                message: `Update success.`,
                data: {
                    id: course.id,
                    name: course.name,
                    detail: course.detail,
                    image: course.image,
                    price: course.price,
                    sign_in: course.sign_in,
                    lessons: lstLesson
                }
            });
        } else {
            if (course) {
                lstLesson = await Lesson.findAll({
                    where: {
                        course_id: course.id
                    },
                    attributes: ["id", "name", "detail", "image", "indexRow", "url_video"]
                })
            }
            res.status(200).json({
                success: true,
                message: `Update success.`,
                data: {
                    id: course.id,
                    name: course.name,
                    detail: course.detail,
                    image: course.image,
                    price: course.price,
                    sign_in: course.sign_in,
                    lessons: lstLesson
                }
            });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Tìm kiếm tên 
// exports.findByName = async (req, res) => {
//     try {
//         const { name } = req.body;

//         if (!name) {
//             return res.status(400).json({ success: false, message: "Contract name is required." });
//         }

//         const contracts = await Course.findAll({
//             where: {
//                 name: {
//                     [Op.like]: `%${name}%`
//                 }
//             },
//             attributes: ["id", "name", "description", "image", "input", "status"]
//         });

//         res.status(200).json({
//             success: true,
//             data: contracts
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };
exports.create = async (req, res) => {
    try {
        const { name, detail, image, price, sign_in } = req.body;

        // Tạo khóa học mới
        const newCourse = await Course.create({
            name,
            detail,
            image,
            price,
            sign_in,
            status: STATUS.ON // Giả định rằng bạn có hằng số STATUS.ACTIVE là 1
        });

        res.status(200).json({
            success: true,
            message: "Course created successfully",
            data: newCourse
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.edit = async (req, res) => {
    try {
        const { id, name, detail, image, price, sign_in } = req.body;

        // Tìm khóa học theo ID
        const course = await Course.findByPk(id);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }
        // Cập nhật thông tin khóa học
        course.name = name || course.name;
        course.detail = detail || course.detail;
        course.image = image || course.image;
        course.price = price || course.price;
        course.sign_in = sign_in || course.sign_in;

        // Lưu thay đổi
        await course.save();

        res.status(200).json({
            success: true,
            message: "Course updated successfully",
            data: course
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.body;
        // Tìm khóa học theo ID
        const course = await Course.findByPk(id);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }
        // Xóa khóa học
        await course.destroy();

        res.status(200).json({
            success: true,
            message: "Course deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

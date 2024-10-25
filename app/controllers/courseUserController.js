const { STATUS, courseUser,Course,Lesson } = require("../models");
const { encryption, compare } = require('../utils/encode');

// Lấy danh sách tất cả học sinh
exports.courses = async (req, res) => {
    try {
        let courses = await courseUser.findAll({
            where:{
                status:1
            }
        })
        res.status(200).json({
            success: true,
            courses:courses
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.mySevices = async (req, res) => {
    try {
        const user_id = req.user.id
        // ------------------------------------
        const lst = await courseUser.findAll({
            where:{
                user_id:user_id
            },
            attributes:["course_id","watched","status"]
        })
        let lstSevices = []
        for (let index = 0; index < lst.length; index++) {
            const item = lst[index];
            // console.log(item.course_id)
            const course = await Course.findByPk(item.course_id)
            if(course){
                const lesions = await Lesson.findAll({
                    where:{
                        course_id:course.id
                    },
                    attributes:["id","name","detail","image","indexRow","url_video"]
                })
                lstSevices.push({
                    watched:item.watched,
                    course:{
                        ...course.dataValues,
                        ...{
                            lessons:lesions
                        }
                    }
                })
            }else{
                
            lstSevices.push({
                watched:item.watched,
                course:{
                    ...course.dataValues,
                    ...{
                        lessons:[]
                    }
                }
            })
            }
        }
        res.status(200).json({
            success: true,
            message: `My sevices.`,
            data: lstSevices
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.create = async (req, res) => {
    try {
        const { name, detail, image, price } = req.body;

        // Tạo khóa học mới
        const newCourse = await courseUser.create({
            name,
            detail,
            image,
            price,
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
        const { id, name, detail, image, price } = req.body;

        // Tìm khóa học theo ID
        const course = await courseUser.findByPk(id);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }
        // Cập nhật thông tin khóa học
        course.name = name || course.name;
        course.detail = detail || course.detail;
        course.image = image || course.image;
        course.price = price || course.price;

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

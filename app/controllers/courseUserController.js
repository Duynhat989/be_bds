const { STATUS, courseUser, Course, Lesson } = require("../models");
const { encryption, compare } = require('../utils/encode');
const { License, Day, Package } = require('../models')
const { Feature } = require('../modules/features.module')

// Lấy danh sách tất cả học sinh
exports.courses = async (req, res) => {
    try {
        let courses = await courseUser.findAll({
            where: {
                status: 1
            }
        })
        res.status(200).json({
            success: true,
            courses: courses
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
            where: {
                user_id: user_id
            },
            attributes: ["course_id", "watched", "status"]
        })
        let lstSevices = []
        for (let index = 0; index < lst.length; index++) {
            const item = lst[index];
            // console.log(item.course_id)
            const course = await Course.findByPk(item.course_id)
            if (course) {
                const lesions = await Lesson.findAll({
                    where: {
                        course_id: course.id
                    },
                    attributes: ["id", "name", "detail", "image", "indexRow", "url_video"]
                })
                lstSevices.push({
                    watched: item.watched,
                    course: {
                        ...course.dataValues,
                        ...{
                            lessons: lesions
                        }
                    }
                })
            } else {

                lstSevices.push({
                    watched: item.watched,
                    course: {
                        ...course.dataValues,
                        ...{
                            lessons: []
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
        const { course_id } = req.body;
        const user_id = req.user.id
        // Kiểm tra xem user thoải mãn điều kiện không 
        const license = await getLicense(user_id)
        const myObj = JSON.parse(license.pack.features) || []
        var act = new Feature(myObj)
        const isValible = await act.find(course_id, 'course')
        const currentDate = new Date(license.date);
        const today = new Date();
        if (isValible) {
            // Tạo khóa học mới
            if (currentDate < today) {
                res.status(500).json({
                    success: false,
                    message: "License expired, please upgrade"
                });
                return
            }
            // Kiểm tra xem đã đăng ký chưa 
            const isSignin = await courseUser.findOne({
                where: {
                    course_id,
                    user_id
                }
            })
            console.log(isSignin)
            //
            if (!isSignin) {
                const newCourse = await courseUser.create({
                    course_id,
                    user_id,
                    watched: JSON.stringify([]),
                    status: STATUS.ON // Giả định rằng bạn có hằng số STATUS.ACTIVE là 1
                });

                res.status(200).json({
                    success: true,
                    message: "Course created successfully",
                    data: newCourse
                });
            }else{
                res.status(500).json({
                    success: false,
                    message: "Accounts that have previously registered for courses"
                });
                return
            }
        } else {
            res.status(500).json({
                success: false,
                message: "License not available, please upgrade"
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
const getLicense = async (user_id) => {
    let licenses = await License.findOne({
        where: {
            user_id: user_id
        }
    });
    if (!licenses) {
        let currentDate = new Date();
        let expirationDate = new Date(currentDate.getTime() + 5 * 24 * 60 * 60 * 1000);
        // Chuyển expirationDate thành dạng DATEONLY (YYYY-MM-DD)
        expirationDate = expirationDate.toISOString().split('T')[0];
        licenses = await License.create({
            user_id: user_id,
            pack_id: 1,
            date: expirationDate
        })
    }
    let result = {
        ...{
            id: licenses.dataValues.id,
            date: licenses.dataValues.date
        }
    }
    const pack_id = licenses.dataValues.pack_id
    const pack = await Package.findByPk(pack_id)
    result = {
        ...result,
        ...{
            pack: {
                name: pack.dataValues.name,
                price: pack.dataValues.price,
                ask: pack.dataValues.ask,
                features: pack.dataValues.features
            }
        }
    }
    // Lấy thông tin day
    const today = new Date().toISOString().split('T')[0]; // Lấy ngày hiện tại dạng 'YYYY-MM-DD'
    let day = await Day.findOne({
        where: {
            user_id: licenses.dataValues.user_id,
            date: today
        }
    })
    if (!day) {
        day = await Day.create({
            user_id: user_id,
            date: today,
            count: 0
        });
    }
    result = {
        ...result,
        ...{
            day: {
                id: day.dataValues.id,
                date: day.dataValues.date,
                count: day.dataValues.count
            }
        }
    }
    return result
}
// exports.edit = async (req, res) => {
//     try {
//         const { id, name, detail, image, price } = req.body;

//         // Tìm khóa học theo ID
//         const course = await courseUser.findByPk(id);
//         if (!course) {
//             return res.status(404).json({ success: false, message: "Course not found" });
//         }
//         // Cập nhật thông tin khóa học
//         course.name = name || course.name;
//         course.detail = detail || course.detail;
//         course.image = image || course.image;
//         course.price = price || course.price;

//         // Lưu thay đổi
//         await course.save();

//         res.status(200).json({
//             success: true,
//             message: "Course updated successfully",
//             data: course
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// exports.delete = async (req, res) => {
//     try {
//         const { id } = req.body;

//         // Tìm khóa học theo ID
//         const course = await Course.findByPk(id);
//         if (!course) {
//             return res.status(404).json({ success: false, message: "Course not found" });
//         }

//         // Xóa khóa học
//         await course.destroy();

//         res.status(200).json({
//             success: true,
//             message: "Course deleted successfully"
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

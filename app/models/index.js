const { sequelize } = require("../config/config");

const { ROLES, User } = require('../models/userModel');
const { STATUS, Setup, loadApiKey, loadModel } = require('../models/setupModel');
const { Files } = require('../models/fileModel');
const { Vector } = require('../models/vectorModel');
const { Assistant, astCreateRow, findAssistant, astUpdateRow } = require('../models/assistantModel');
const { Conversation, astConversation, findConversation, updateConversation } = require('../models/conversationModel');
const { Course } = require('../models/courseModel');
const { Lesson } = require('../models/lessonModel');
const { courseUser } = require('../models/courseUserModel');
const { RealEstate } = require('../models/realestaleModel');
const { Day,addDayCount,checkLimit } = require('../models/dayModel');
const { License } = require('../models/licenseModel');
const { Package } = require('../models/packModel');
const { Pay } = require('../models/payModel');
const { Contract } = require('../models/contractModel');
const { Prompt } = require('../models/promptModel');




sequelize.sync({ force: false }).then(() => {
  console.log('Database đã được đồng bộ!');
});

module.exports = {
  User,
  ROLES,
  Setup,
  // Tạo file dữ liệu
  Files,
  loadApiKey,
  loadModel,
  STATUS,
  Vector,
  // Trợ lý
  Assistant,
  astCreateRow,
  findAssistant,
  astUpdateRow,
  // Cuộc hội thoại
  Conversation,
  astConversation,
  findConversation,
  updateConversation,
  // Khóa học 
  Course,
  // Bài giảng 
  Lesson,
  // Người dùng đăng ký khóa học 
  courseUser,
  // Thông tin bất động sản
  RealEstate,
  // Thông tin ngày
  Day,
  addDayCount,
  checkLimit,
  // Bản quyền 
  License,
  // 
  Package,
  // Phàn thanh toán của bạn
  Pay,
  Contract,

  Prompt
};
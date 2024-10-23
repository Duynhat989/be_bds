const { sequelize } = require("../config/config");

const { ROLES, User } = require('../models/userModel');
const { STATUS, Setup, loadApiKey, loadModel } = require('../models/setupModel');
const { Files } = require('../models/fileModel');
const { Vector } = require('../models/vectorModel');
const { Assistant, astCreateRow, findAssistant, astUpdateRow } = require('../models/assistantModel');

sequelize.sync({ force: false }).then(() => {
  console.log('Database đã được đồng bộ!');
});

module.exports = {
  User,
  ROLES,
  Setup,
  Files,
  loadApiKey,
  loadModel,
  STATUS,
  Vector,
  Assistant,
  astCreateRow,
  findAssistant,
  astUpdateRow
};
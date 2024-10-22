const { sequelize } = require("../config/config");

const {ROLES, User} = require('../models/userModel');

sequelize.sync({ force: false }).then(() => {
  console.log('Database đã được đồng bộ!');
});

module.exports = {
    User,
    ROLES
};
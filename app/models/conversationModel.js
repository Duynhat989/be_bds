const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/config");
const STATUS = {
  ON: 1,
  OFF: 2
};
// Định nghĩa model User
const Conversation = sequelize.define(
  "Conversations",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    thread_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    assistant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    messages: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: STATUS.ON, // Mặc định là Sinh viên (3)
      validate: {
        isIn: [[STATUS.ON, STATUS.OFF]], // Chỉ cho phép 1 (Admin), 2 (Dev), hoặc 3 (Customer)
      },
    },
  }
);
const astConversation = async (name, user_id, thread_id, assistant_id, messages) => {
  var conver = await Conversation.create({
    name, user_id, thread_id, assistant_id, messages
  });
  return {
    messages:conver.messages
  }
}
const findConversation = async (user_id,thread_id) => {
  var conversation = await Conversation.findOne({
    where: {
      thread_id: thread_id,
      user_id:user_id
    }
  })
  return conversation
}
const updateConversation = async (messages ,id) => {
  var conversation = await Conversation.update({
    messages
  }, {
    where: { id: id }
  });
  return conversation
}
module.exports = { Conversation, astConversation, findConversation, updateConversation };
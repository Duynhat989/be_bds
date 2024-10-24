const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/config");
const STATUS = {
  ON: 1,
  OFF: 2
};
// Định nghĩa model User
const Assistant = sequelize.define(
  "Assistants",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    detail: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    vector_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    file_ids: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    assistant_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    suggests: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    name_model: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "gpt-4o-mini"
    },
    view: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    love: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "[]"
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
const astCreateRow = async (name, detail, image, instructions, vector_id, file_ids, assistant_id, content, suggests, name_model) => {
  var assistant = await Assistant.create({
    name, detail, image, 
    instructions, 
    vector_id, 
    file_ids, 
    assistant_id, 
    content, 
    suggests, 
    name_model: name_model || "gpt-4o-mini"
  });
  return assistant
}
const findAssistant = async (assistant_id) => {
  var assistant = await Assistant.findOne({
    where: {
      id: assistant_id
    }
  })
  return assistant
}
const astUpdateRow = async (name, detail, image, instructions, vector_id, file_ids, assistant_id, content, suggests, name_model, id) => {
  // console.log('3434')
  var assistant = await Assistant.update({
    name, detail, image, instructions, vector_id, file_ids, assistant_id, content, suggests, name_model: name_model || "gpt-4o-mini"
  }, {
    where: { id: id }
  });
  return assistant
}
module.exports = { Assistant, STATUS, astCreateRow, findAssistant, astUpdateRow };
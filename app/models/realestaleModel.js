const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/config");
const STATUSBDS = {
  AVAILABLE: 1,
  SOLD: 2,
  PENDING: 3
};

// Định nghĩa model RealEstate
const RealEstate = sequelize.define(
  "RealEstates",
  {
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    price: {
      type: DataTypes.TEXT, //Mức giá
      allowNull: true, //mảng giá ['123.ty']
    },
    area: {
      type: DataTypes.STRING, //Diện tích
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING, //Vị trí
      allowNull: true,
    },
    exten: {
      type: DataTypes.TEXT, //Tiện ích
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING, //mua hoặc thuê
      allowNull: true,
      defaultValue:"buy" //rent 
    },
    province: {
      type: DataTypes.STRING, //Vị trí địa lý
      allowNull: true,
      defaultValue:""
    },
    keyword: {
      type: DataTypes.TEXT('long'), //Đường dẫn gốc
      allowNull: false,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    base_url: {
      type: DataTypes.STRING, //Đường dẫn gốc
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: STATUSBDS.AVAILABLE,
      validate: {
        isIn: [[STATUSBDS.AVAILABLE, STATUSBDS.SOLD, STATUSBDS.PENDING]], // Chỉ cho phép 1 (Available), 2 (Sold), 3 (Pending)
      },
    },
  }
);

module.exports = { RealEstate };

const { DataTypes } = require("sequelize");
const {v4 : uuidv4} = require("uuid");

module.exports = (sequelize) => {
  const Restaurant = sequelize.define("restaurants", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    owner_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
        allowNull: true
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
        defaultValue: true
    }
  }
  ,{
    timestamps: true,
    defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt"] }
    }


  })
  return Restaurant;
}
const { DataTypes } = require("sequelize");
const {v4 : uuidv4} = require("uuid");
 
module.exports = (sequelize) => {
  const MenuItem = sequelize.define("menuitems", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    restaurant_id: {
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
    price: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    imageURL: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }
  ,{
    timestamps: true,
    defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt"] }
    }
 
 
  })
  return MenuItem;
}
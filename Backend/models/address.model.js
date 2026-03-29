const { DataTypes } = require("sequelize");
const {v4 : uuidv4} = require("uuid");

module.exports = (sequelize) => {
  const Address = sequelize.define("addresses", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    useraddress: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }
  ,{
    timestamps: true,
    defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt"] }
    }


  })
  return Address;
}
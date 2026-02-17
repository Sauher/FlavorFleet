const bcrypt = require("bcrypt");
const { DataTypes } = require("sequelize");
const {v4 : uuidv4} = require("uuid");

module.exports = (sequelize) => {
  const User = sequelize.define("users", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "user"
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    lastLoginAt:{
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
    
  }
  ,{
    timestamps: true,
    hooks: {
        beforeCreate: async (user) =>{
            user.password = await bcrypt.hash(user.password, 10);
        },
        beforeUpdate: async (user) =>{
           if(user.changed("password")){
                user.password = await bcrypt.hash(user.password, 10);
                user.secret = uuidv4();
            }
        }
    },
    defaultScope: {
        attributes: { exclude: ["password", "secret"] }
    },
    scopes: {
        withPassword: {
            attributes: {}
        }
    }
  });

  return User;
};
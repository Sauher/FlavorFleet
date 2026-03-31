const { DataTypes } = require("sequelize");
const {v4 : uuidv4} = require("uuid");

module.exports = (sequelize) => {
  const defaultOpeningHours = [
    { day: 0, opening_time: '09:00', closing_time: '18:00' },
    { day: 1, opening_time: '09:00', closing_time: '18:00' },
    { day: 2, opening_time: '09:00', closing_time: '18:00' },
    { day: 3, opening_time: '09:00', closing_time: '18:00' },
    { day: 4, opening_time: '09:00', closing_time: '18:00' },
    { day: 5, opening_time: '09:00', closing_time: '18:00' },
    { day: 6, opening_time: '09:00', closing_time: '18:00' }
  ];

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
    image_url: {
      type: DataTypes.STRING(512),
      allowNull: true
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
        defaultValue: true
    },
    is_open: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    opening_hours: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: defaultOpeningHours
    },
    images: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    }
  }
  ,{
    timestamps: true,
    defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt"] }
    }
  });

  Restaurant.associate = (models) => {
    Restaurant.belongsTo(models.User, {
      foreignKey: 'owner_id',
      as: 'owner'
    });
    
    Restaurant.hasMany(models.MenuItem, {
      foreignKey: 'restaurant_id',
      as: 'menuItems',
      onDelete: 'CASCADE'
    });
  };

  return Restaurant;
}
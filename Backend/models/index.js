const { Op, Sequelize} = require("sequelize");

const dbConfig = require("../config/database.js");
const db = {};

console.log(dbConfig);
const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  port:3306,
  logging: dbConfig.logging
});
const User = require('./user.model.js')(sequelize);


db.User = User;


Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

const operatorMap = {
    eq: Op.eq,
    lt: Op.lt,
    gt: Op.gt,
    lte: Op.lte,
    gte: Op.gte,
    like: Op.like,
    not: Op.not
}

module.exports = {sequelize, User, operatorMap};
require('dotenv').config();


module.exports = {
    host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  database: process.env.DBNAME,
  port: process.env.PORT,
  dialect: 'mysql',
  logging: false
}

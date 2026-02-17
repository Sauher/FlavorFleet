require('dotenv').config();

const express = require('express')
const cors = require('cors')

const userRoutes =  require('../routes/users.routes')
const mailRoutes = require('../routes/mail.routes')
const uploadRoutes = require('../routes/upload.routes')


const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use('/users', userRoutes)
app.use('/mail', mailRoutes)
app.use('/upload',uploadRoutes)

app.use('/uploads', express.static('uploads'))

module.exports = app;
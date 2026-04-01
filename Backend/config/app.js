require('dotenv').config();

const express = require('express')
const cors = require('cors')

const userRoutes =  require('../routes/users.routes')
const restaurantRoutes = require('../routes/restaurant.routes')
const adminRestaurantRoutes = require('../routes/admin-restaurant.routes')
const mailRoutes = require('../routes/mail.routes')
const menuItemRoutes= require('../routes/menu-item.routes')
const addressRoutes = require('../routes/address.routes')


const app = express();

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// routes
app.use('/restaurants', restaurantRoutes)
app.use('/admin/restaurants', adminRestaurantRoutes)
app.use('/users', userRoutes)
app.use('/mail', mailRoutes)
app.use('/menuitems', menuItemRoutes)
app.use('/addresses', addressRoutes)

app.use('/uploads', express.static('uploads'))

app.use((err, _req, res, next) => {
	if (err?.code === 'LIMIT_FILE_SIZE') {
		return res.status(413).json({
			error: 'A feltöltött kép túl nagy. Maximum 20 MB/fájl engedélyezett.'
		});
	}

	if (err?.type === 'entity.too.large') {
		return res.status(413).json({
			error: 'A feltöltött kép(ek) mérete túl nagy. Kérlek használj kisebb fájlt vagy tömörített képet.'
		});
	}

	if (err?.message === 'Csak képfájl tölthető fel') {
		return res.status(400).json({ error: err.message });
	}

	return next(err);
});

module.exports = app;
const app = require('./config/app');
const {sequelize} = require('./models/index');
(async () => {
    try{
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        sequelize.sync({alter : true});

        app.listen(process.env.PORT, () => {
        
        console.log(`Server is listening on http://localhost:${process.env.PORT}`)
    });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
}



})();
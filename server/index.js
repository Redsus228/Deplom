require('dotenv').config();
console.log(process.env.DB_URL); 

const { Client } = require('pg'); // Для проверки строки подключения
const express = require('express');
const cors = require('cors');
const coachDB = require('./nano-coachDB.js');
const PORT = process.env.PORT || 5000;
const app = express();
const cookieParser = require('cookie-parser');
const sequelize = require('./sequelize.js');
const router = require('./router/Router.js');
const errorMiddleware = require('./middlewares/error-middleware');

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL
}));
app.use('/api',router);
app.use(errorMiddleware);

app.use((req, res, next) => {
    console.log(`Запрос: ${req.method} ${req.url}`);
    next();
});

const start = async () => {
  try {
    console.log('Attempting to connect to the PostgreSql database...');  // Уведомление о попытке подключения
    await sequelize.authenticate()
    await sequelize.sync()
    console.log('Connected to the PostgreSql database successfully');
    app.listen(PORT)
    console.log('Server is running on port', PORT);
    console.log('Attempting to connect to CouchDB...');
    const response = await coachDB.info();
    console.log('Connected to CouchDB successfully:', response);
  } catch (error) {
    console.log('Failed to connect to the database:', error);
  }
};

start();




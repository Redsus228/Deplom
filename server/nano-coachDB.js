const nano = require('nano')({
    url: `http://${process.env.C_DATABASE_USER}:${process.env.C_DATABASE_PASSWORD}@${process.env.C_DATABASE_HOST}:${process.env.C_DATABASE_PORT}`
});

const coachDB = nano.db.use(process.env.C_DATABASE_NAME);

module.exports = coachDB;

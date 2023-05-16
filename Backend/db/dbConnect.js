const mongoose = require('mongoose');
require('dotenv').config();

async function dbConnect(){
    mongoose.connect(process.env.DB_URL)
    .then(() => (console.log("Database successfully connected!")))
    .catch((err) => console.log(err));
}

module.exports = dbConnect;
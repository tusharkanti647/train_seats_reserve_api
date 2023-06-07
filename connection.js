const mongoose = require("mongoose");

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const db = process.env.DATABASE;

mongoose.connect(db)
    .then(() => {
        console.log("server is connect with mongodb");
    }).catch((err) => {
        console.log(err);
    });
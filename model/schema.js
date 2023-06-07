const mongoose = require("mongoose");


const usersSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true, //left and right side of the name if have any spce it trimes
    },
    seatsData: [],
});

const userModel = mongoose.model("users", usersSchema);

//Seats schema
//----------------------------------------------------------------
const seatsSchema = new mongoose.Schema({
    seatNumber: {
        type: Number,
        required: true,
    },

    user: {}
});

const seatsModel = mongoose.model("seats", seatsSchema);

module.exports = { userModel, seatsModel };
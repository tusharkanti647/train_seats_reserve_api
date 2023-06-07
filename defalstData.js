
const { seatsModel } = require("./model/schema");

let seatsdata=[];
for(let i = 0; i < 80; i++){
    seatsdata.push({seatNumber : i + 1, user: ""})
}

const DefaultData = async()=>{
    try {
        
         await seatsModel.deleteMany({});
        const storeData = await seatsModel.insertMany(seatsdata);
        console.log(storeData);
    } catch (error) {
        console.log(error);
    }
};

module.exports = DefaultData;
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");

router.use(bodyParser.json());

const { userModel, seatsModel } = require("../model/schema");


//seats get path
//-------------------------------------------------------------------------------
router.get("/get-seats", async (req, res) => {
    try {
        const data = await seatsModel.find();
        res.status(200).send(data);

    } catch (err) {
        console.log(err);
        res.status(404).send(err);
    }
});

//seats reserve path
//-------------------------------------------------------------------------------
router.put("/seats-reserved", async (req, res) => {
    try {
        const { userName, seatCount } = req.body;
        //if userName is not present or seatCount is less than 1 or getarthan 7 returns
        if (!userName) {
            res.status(400).send("Please enter UserName");
            return;
        }
        if (seatCount <= 0 || seatCount > 7) {
            res.status(400).send("Please enter Number of seat between 1 to 7 range");
            return;
        }

        //find the empty seats
        let seatsDatas = await findSeatData(seatCount, userName);
        let seatsData = [];

        //if all seats are booked return a messge
        if (seatsDatas.message !== "") {
            res.status(200).json({seatData: {seatsData:[], userName:""}, message: seatsDatas.message });
            return;
        }else{
            seatsData = seatsDatas.data;
        }

        //set user reserve seat and update status status reserve
        const userData = await userModel.findOne({ userName: userName });
        if (userData) {
            seatsData = [...userData.seatsData, ...seatsData]
            const response = await userModel.findOneAndUpdate({ userName: userName }, {
                seatsData: seatsData,
            }, {
                new: true
            });
            res.status(200).json({ seatData: response, message:"" });
        } else {
            const user = new userModel({
                userName: userName,
                seatsData: seatsData,
            });
            const response = await user.save();
            res.status(200).json({ seatData: response, message:"" });
        }
    } catch (err) {
        console.log(err);
        res.status(404).send(err);
    }
});

//get all seats path
//------------------------------------------------------------------------
router.get("/seats-get", async (req, res) => {
    try {
        const response = await seatsModel.find();
        res.status(200).send(response);
    } catch (err) {
        console.log(err);
        res.status(404).send(err);
    }
})



//change the seat status to reserved
//------------------------------------------------------------------------
const changeSeatStatus = async (seatsData, userName) => {
    seatsData.map(async (seat) => {
        const response = await seatsModel.findOneAndUpdate({ seatNumber: seat }, {
            user: userName,
        }, {
            new: true
        });
    });
}

//find availability of seats and assign them seats
//------------------------------------------------------------------------
async function findSeatData(seatCount, userName) {
    let seats = await seatsModel.find();
    let seatsData = [];

    //if empty row find where the seatCount equal number of seat empty
    //------------------------------------------------------------------------
    for (let i = 0; i < 80; i++) {
        let j = i;
        for (; j < i + 7 && j < 80; j++) {
            if (!seats[j].user) {
                seatsData.push(j + 1);
                if (seatsData.length === parseInt(seatCount)) {
                    await changeSeatStatus(seatsData, userName);
                    return { message: "", data: seatsData };
                }
            }
        }
        i = j - 1;
        seatsData = [];
    }

    //if empty row not find where the seatCount equal number of seat not empty
    //------------------------------------------------------------------------
    let arr = [];
    for (let i = 0; i < 80; i++) {
        if (!seats[i].user) {
            arr.push(i + 1);
        }
    }

    //if the arr.length <seatCount it means there has seatCount equal number of
    //empty seat not present
    //------------------------------------------------------------------------
    if (arr.length < seatCount) {
        return { message: "seats are not available", data: [] };
    }

    let ans = [arr[0]], q = [];
    let numberOfDifferent = 0, maxdiff = 0;

    let cuAns = [arr[0]];
    let cuMaxdiff = 0;

    let i = 1;
    for (; i < seatCount; i++) {
        let cuDiff = arr[i] - arr[i - 1];
        if (cuDiff !== 1) {
            cuMaxdiff = cuDiff > cuMaxdiff ? cuDiff : cuMaxdiff;
            q.push(cuDiff);
        }
        ans.push(arr[i]);
        cuAns.push(arr[i]);
    }

    maxdiff = maxdiff > cuMaxdiff ? maxdiff : cuMaxdiff;
    numberOfDifferent = q.length;

    for (; i < arr.length; i++) {
        let cuDiff = arr[i] - arr[i - 1];
        if (cuDiff !== 1) {
            cuMaxdiff = cuDiff > cuMaxdiff ? cuDiff : cuMaxdiff;
            q.push(cuDiff);
        }
        cuAns.push(arr[i]);

        cuDiff = arr[i - seatCount + 1] - arr[i - seatCount];
        if (cuDiff !== 1) {
            if (cuDiff === q[0]) {
                q.splice(0, 1);
                cuMaxdiff = Math.max(...q);
            }
        }
        cuAns.splice(0, 1);

        if (q.length < numberOfDifferent) {
            numberOfDifferent = q.length;
            ans = [...cuAns];
        } else if (q.length === numberOfDifferent) {
            if (cuMaxdiff < maxdiff) {
                maxdiff = cuMaxdiff;
                ans = [...cuAns];
            }
        }

    }

    await changeSeatStatus(ans, userName);
    return { message: "", data: ans };
}



module.exports = router;
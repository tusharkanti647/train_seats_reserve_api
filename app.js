const dotenv = require("dotenv");
const cors = require('cors');
const mongoose = require("mongoose");
const express = require("express");
const DefaultData = require("./defalstData");
const app = express();

dotenv.config({ path: "./config.env" });
const port = process.env.PORT || 8000;

require("./connection");

app.use(cors());
//we can coonect the router file ushinh this middelwear
app.use(require("./router/routes"));

app.listen(port, () => {
    console.log(`connect my backend surver at ${port} port`);
})

//DefaultData();
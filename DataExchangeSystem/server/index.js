const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerJsdoc = require("swagger-jsdoc")
const swaggerUI = require("swagger-ui-express")

require("dotenv").config();

// routes
var hospitalRoutes = require("./routes/hospitalRoutes");


const app = express();

// middlewares 
app.use(cors());
app.use(cookieParser());

// connection to database
mongoose.connect(process.env.MONGOURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.connection.on("connected", (req, res) => {
    console.log("connected to mongo");
});
mongoose.connection.on("error", (err) => {
    console.log("error while connecting ", err);
});

app.get("/", (req, res) => {
    res.send("this is home of server");
})

//models 
require("./models/hospital");


app.use(express.json());

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'Healthcare Data Exchange System',
            description: "Healthcare Data Exchange System APIs information",
            contact: {
                name: "Dimpal Kataniya, Abhinav Singh"
            },
            servers: ["http://localhost:5000"]
        }
    },
    apis: ["./routes/*.js"]
}
const swaggerDocs = swaggerJsdoc(swaggerOptions);

//route middlewares
app.use('/swagger-ui', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// routes 
app.use("/api/hospital", hospitalRoutes);

const PORT = process.env.PORT || 5000;  


app.listen(PORT, (req, res) => {
    console.log("server is running on port " + PORT);
});
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const Hospital = require("../models/hospital");

module.exports = {
    /*  
       Purpose = to check whether a hospital is loggedin or not
       Input = cookie containg jwt token
       Output = If hospital is loggin it will execute next function
   */
    Authenticate: async (req, res, next) => {
        try {
            //console.log(req.cookies);
                const token = req.cookies.jwt
                if (!token) {
                    req.user = undefined;
                    throw new Error("User not found");
                }
                //console.log(token);
                const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
                //console.log(decoded);
                const hospital = await Hospital.findById(decoded._id)
                if (hospital) {
                    req.user = hospital;
                }
                else {
                    throw new Error("Hospital not found");
                }
                //console.log(req.user);
                next();
        }
        catch (err) {
            res.status(401).send("Unauthorized:No token provided");
            console.log("Error in checking for auth", err.message)
        }

    },
};
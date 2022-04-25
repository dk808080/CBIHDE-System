const axios = require("axios");
const express = require("express");
var json2html = require('json2html');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/node-mailer");
require("dotenv").config();

//validations 
const validateHospitalRegisterInput = require('../validations/hospitalRegister')
const validateHospitalLoginInput = require('../validations/hospitalLogin');
const validateForgotPassword = require("../validations/forgotPassword");
const validateOTP = require("../validations/otpValidation");
const validateRequestForAccessInput = require("../validations/requestForAccess");
const validateAllowAccessInput = require("../validations/allowAccess");
const validateRequestForDataInput = require("../validations/requestForData");

//models
const Hospital = require("../models/hospital");

module.exports = {
    /*  
       Purpose = to register a new hospital
       Input = name, email, url, password, confirmPassword
       Output = new hospital with given info will be added in system
   */
    registerNewHospitalFunc: async (req, res, next) => {
        try {
            const { errors, isValid } = validateHospitalRegisterInput(req.body);
            if (!isValid) {
                return res.status(400).json(errors)
            }
            const { name, email, url, password, confirmPassword, avatar } = req.body;

            if (password !== confirmPassword) {
                errors.confirmNewPassword = 'Password Mismatch'
                return res.status(400).json(errors);
            }

            const hospital = await Hospital.findOne({ email })
            if (hospital) {
                errors.email = "Email already exist"
                return res.status(400).json(errors)
            }

            const hidHelper = 100

            const hospitals = await Hospital.find({})
            let helper = (hospitals.length + hidHelper).toString();

            let hashedPassword;
            hashedPassword = await bcrypt.hash(password, 10)
            var components = [
                "HOS",
                helper
            ];

            var hid = components.join("");
            const newHospital = await new Hospital({
                name,
                email,
                password: hashedPassword,
                hid,
                url,
                avatar
            })
            await newHospital.save()
            res.status(200).json({ result: newHospital.hid })
        }
        catch (err) {
            res.status(400).json({ message: `Invalid request", ${err.message}` })
        }

    },
    /*  
      Purpose = to login into a hospital account 
      Input = hid, email and password 
      Output = jwt token inside a cookie
  */
    hospitalLoginFunc: async (req, res, next) => {
        try {
            const { errors, isValid } = validateHospitalLoginInput(req.body);

            // Check Validation
            if (!isValid) {
                return res.status(400).json(errors);
            }
            const { hid, email, password } = req.body;

            const hospital = await Hospital.findOne({ hid, email })
            if (!hospital) {
                errors.hid = 'HID or Email not found';
                return res.status(404).json(errors);
            }
            const isCorrect = await bcrypt.compare(password, hospital.password)

            if (!isCorrect) {
                errors.password = 'Invalid Credentials';
                return res.status(400).json(errors);
            }

            hospital.password = undefined;
            const token = jwt.sign(hospital.toJSON(), process.env.JWT_SECRET);

            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 25892000000),
                httpOnly: true
            });
            res.cookie("hospital", hospital);
            res.status(200).json({ message: "loggedIn successfully" });
        }
        catch (err) {
            res.status(400).json({ message: `Invalid request", ${err.message}` })
        }

    },
    /*  
      Purpose = to logout from a hospital account (clears cookie)
  */
    hospitalLogoutFunc: async (req, res, next) => {
        try {
            res.clearCookie("jwt");
            res.clearCookie("hospital");
            res.status(200).json({ message: "hospital logged out" });
        } catch (err) {
            res.status(400).json({ message: `Invalid request", ${err.message}` })
        }
    },

    /*  
      Purpose = to get list of allowed hids 
      Input = hid of currently loggedin hospital
      Output = list of hids that are allowed to access data
  */

    getAllowedListFunc: async (req, res, next) => {
        try {
            const hospital = await Hospital.findOne({ hid: req.user.hid }, { _id: 0, password: 0 });
            if (!hospital) {
                return res.status(404).json({ message: "No hospital found for given hid" })
            }
            res.status(200).json({ result: hospital.allowedList });
        }
        catch (err) {
            res.status(400).json({ message: `Invalid request", ${err.message}` })
        }

    },

    allowAccessFunc: async (req, res, next) => {
        try {
            const { errors, isValid } = validateAllowAccessInput(req.body);
            // Check Validation
            if (!isValid) {
                return res.status(400).json(errors);
            }
            const { hid } = req.body;

            const hospital = await Hospital.findOne({ hid: req.user.hid });
            if (!hospital) {
                return res.status(404).json({ message: "No hospital found for given hid" });
            }
            hospital.allowedList.push(hid);
            await hospital.save();
            const hospital2 = await Hospital.findOne({ hid })
            var htmlToSend = `<div><h4>${req.user.name} granted access to request data to your hospital</h4><p>Hospital Name : ${req.user.name}</p><p>Hospital unique ID (HId) : ${req.user.hid}</p></div>`;
            await sendEmail(hospital2.email, "granted permission to data access", htmlToSend)
            res.status(200).json({ message: "Email has been sent to hospital you allowed access to" })
        }
        catch (err) {
            res.status(400).json({ message: `Invalid request", ${err.message}` })
        }
    },

    /*  
     Purpose = to get list of not allowed hids 
     Input = hid of currently loggedin hospital
     Output = list of hids that are not allowed to access data
    */

    getAllNotAllowedHIdsFunc: async (req, res, next) => {
        try {
            const hospital = await Hospital.findOne({ hid: req.user.hid }, { _id: 0, password: 0, name: 0, url: 0, email: 0, otp: 0 });
            const allHospitals = await Hospital.find({}, { _id: 0, password: 0, name: 0, url: 0, email: 0, otp: 0, allowedList: 0, __v: 0 })
            if (!hospital) {
                return res.status(404).json({ message: "No hospital found for given hid" })
            }
            const notallowedlist = allHospitals.filter((hos) => {
                if (!hospital.allowedList.includes(hos.hid) && (hos.hid !== hospital.hid)) {
                    return hos;
                }
            })
            res.status(200).json({ result: notallowedlist });
        }
        catch (err) {
            res.status(400).json({ message: `Invalid request", ${err.message}` })
        }
    },

    /*  
      Purpose = to request for allowing access 
      Input = hid
      Output = will send email to hospital (hospital want data from)
  */
    requestForAccessFunc: async (req, res, next) => {
        try {
            const { errors, isValid } = validateRequestForAccessInput(req.body);

            // Check Validation
            if (!isValid) {
                return res.status(400).json(errors);
            }
            const { hid } = req.body;

            const hospital = await Hospital.findOne({ hid })
            if (!hospital) {
                errors.hid = 'HID not found';
                return res.status(404).json(errors);
            }
            var htmlToSend = `<div><h4>${req.user.name} requested data access from your hospital</h4><p>Hospital Name : ${req.user.name}</p><p>Hospital unique ID (HId) : ${req.user.hid}</p></div>`;
            await sendEmail(hospital.email, "Request for data access", htmlToSend)
            res.status(200).json({ message: "Email has been sent to hospital you requested data access from" })

        }
        catch (err) {
            res.status(400).json({ message: `Invalid request", ${err.message}` })
        }

    },
    /*  
         Purpose = to request for patient data 
         Input = hid, addharcard number
         Output = will send clinical document in html form
     */
    requestForDataFunc: async (req, res, next) => {
        try {
            const { errors, isValid } = validateRequestForDataInput(req.body);

            // Check Validation
            if (!isValid) {
                return res.status(400).json(errors);
            }
            const { hids, anumber } = req.body;

            //console.log(hid);
            //console.log(anumber);
                const curr = hids[0];
                const hospital = await Hospital.findOne({ hid:curr })
                //console.log(hospital);
                if (!hospital) {
                    errors.hid = 'HID not found';
                    return res.status(404).json(errors);
                    // console.log("not found");
                }
                // console.log(req.cookies.hospital.hid);
                if (!hospital.allowedList.includes(req.cookies.hospital.hid)) {
                    console.log("not found");
                    return res.status(401).json("You are unauthorized to access data from given hospital");
                }

                //console.log(hospital.url+"getehrid/"+anumber);
                axios.get(hospital.url + "getehrid/" + anumber)
                    .then((response) => {
                       // console.log(response);
                        if (response.data.length !== 0) {
                            // console.log(response.data.length);
                            const ehrid = response.data[0].ehrId;
                            console.log(ehrid);
                            axios.get(hospital.url + "getdocument/" + ehrid)
                                .then((response2) => {
                                    //console.log(typeof(JSON. stringify(response2.data)));
                                    let currJson = response2.data;
                                   // console.log(currJson);
                                    //const hname = hospital.name;
                                    //console.log(hname);
                                    //res.status(200).json({html});
                                  //  myJson = myJson.concat(currJson);
                                  res.writeHead(200, { 'Content-Type': 'text/html' });
                                  res.end(json2html.render(currJson));
                                })
                                .catch(err => console.log(err));

                        } else {
                            console.log("none");
                            res.status(404).json({ message: "Patient with given addhar number is not found in our hospital" });
                        }
                    })
                    .catch((err) => console.log(err));
            }
            /*console.log(myJson);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(json2html.render(myJson));*/
        catch (err) {
            res.status(400).json({ message: `Invalid request", ${err.message}` })
        }

    },


    /*
  Purpose = To sent OTP for password reset
  Input = email id
  Output = OTP will be sent to email which will be valid for 5 mins
*/
    forgotPasswordFunc: async (req, res, next) => {
        try {
            const { errors, isValid } = validateForgotPassword(req.body);
            if (!isValid) {
                return res.status(400).json(errors);
            }
            const { email } = req.body
            const hospital = await Hospital.findOne({ email })
            if (!hospital) {
                errors.email = "Email Not found, Provide registered email"
                return res.status(404).json(errors)
            }
            function generateOTP() {
                var digits = '0123456789';
                let OTP = '';
                for (let i = 0; i < 6; i++) {
                    OTP += digits[Math.floor(Math.random() * 10)];
                }
                return OTP;
            }
            const OTP = await generateOTP()
            hospital.otp = OTP
            await hospital.save()
            var htmlToSend = `<div><h4>OTP to reset your password is : ${OTP}</h4><p>This OTP will be valid for 5 minutes</p></div>`;
            await sendEmail(email, "OTP to reset Reinforce password", htmlToSend)
            res.status(200).json({ message: "check your registered email for OTP" })
            const helper = async () => {
                hospital.otp = ""
                await hospital.save()
            }
            setTimeout(function () {
                helper()
            }, 300000);
        }
        catch (err) {
            res.status(400).json({ message: `Invalid request", ${err.message}` })
        }
    },
    /*
        Purpose = To reset the password 
        Input = email id, otp, new password and confirm password
        Output = new password will be stored after hashing 
    */
    resetPasswordFunc: async (req, res, next) => {
        try {
            const { errors, isValid } = validateOTP(req.body);
            if (!isValid) {
                return res.status(400).json(errors);
            }
            const { email, otp, newPassword, confirmNewPassword } = req.body
            if (newPassword !== confirmNewPassword) {
                errors.confirmNewPassword = 'Password Mismatch'
                return res.status(400).json(errors);
            }
            const hospital = await Hospital.findOne({ email });
            if (hospital.otp !== otp) {
                errors.otp = "Invalid OTP, check your email again"
                return res.status(400).json(errors)
            }
            let hashedPassword;
            hashedPassword = await bcrypt.hash(newPassword, 10)
            hospital.password = hashedPassword;
            await hospital.save()
            return res.status(200).json({ message: "Password Changed" })
        }
        catch (err) {
            res.status(400).json({ message: `Invalid request", ${err.message}` })
        }
    },
}

const express = require("express");
const router = express.Router();
const {
        requestForDataFunc, 
        registerNewHospitalFunc, 
        hospitalLoginFunc,
        forgotPasswordFunc,
        resetPasswordFunc, 
        getAllowedListFunc, 
        getAllNotAllowedHIdsFunc, 
        requestForAccessFunc,
        allowAccessFunc,
        hospitalLogoutFunc
    } = require("../controllers/hospital");
const {Authenticate} = require("../middlewares/auth");


 /**
* @swagger
*
* /api/hospital/register:
*   post:
*     tags:
*       - Hospital related routes
*     name: register a hospital
*     summary: to register a hospital
*     consumes:
*       - application/json
*     parameters:
*       - name: body
*         in: body
*         schema:
*           type: object
*           properties:
*             registrationNumber:
*               type: string
*             password:
*               type: string
*         required:
*           - registrationNumber
*           - password
*     responses:
*       200:
*         description: logged in successfully
*       404:
*         description: Registration number not found
*       401:
*         description: Unauthorized
*
* /api/hospital/login:
*   post:
*     tags:
*       - Hospital related routes
*     name: login a hospital
*     summary: to login a hospital
*     consumes:
*       - application/json
*     parameters:
*       - name: body
*         in: body
*         schema:
*           type: object
*           properties:
*             registrationNumber:
*               type: string
*             password:
*               type: string
*         required:
*           - registrationNumber
*           - password
*     responses:
*       200:
*         description: logged in successfully
*       404:
*         description: Registration number not found
*       401:
*         description: Unauthorized
*
*
* /api/hospital/request-for-access:
*   post:
*     tags:
*       - Hospital related routes
*     name: to request for data request permission from a hospital
*     summary: to request for data request permission from a hospital
*     consumes:
*       - application/json
*     parameters:
*       - name: body
*         in: body
*         schema:
*           type: object
*           properties:
*             registrationNumber:
*               type: string
*             password:
*               type: string
*         required:
*           - registrationNumber
*           - password
*     responses:
*       200:
*         description: logged in successfully
*       404:
*         description: Registration number not found
*       401:
*         description: Unauthorized
*
* /api/hospital/allow-access:
*   post:
*     tags:
*       - Hospital related routes
*     name: to give permission for data access to a hospital
*     summary: to give permission for data access to a hospital
*     consumes:
*       - application/json
*     parameters:
*       - name: body
*         in: body
*         schema:
*           type: object
*           properties:
*             registrationNumber:
*               type: string
*             password:
*               type: string
*         required:
*           - registrationNumber
*           - password
*     responses:
*       200:
*         description: logged in successfully
*       404:
*         description: Registration number not found
*       401:
*         description: Unauthorized
*
* /api/hospital/request-for-data:
*   post:
*     tags:
*       - Hospital related routes
*     name: to request for patient data to a hospital
*     summary:  to request for patient data to a hospital
*     consumes:
*       - application/json
*     parameters:
*       - name: body
*         in: body
*         schema:
*           type: object
*           properties:
*             registrationNumber:
*               type: string
*             password:
*               type: string
*         required:
*           - registrationNumber
*           - password
*     responses:
*       200:
*         description: logged in successfully
*       404:
*         description: Registration number not found
*       401:
*         description: Unauthorized
*
* /api/hospital/forgot-password:
*   post:
*     tags:
*       - Hospital related routes
*     name: to get OTP to reset password
*     summary:  to get OTP to reset password
*     consumes:
*       - application/json
*     parameters:
*       - name: body
*         in: body
*         schema:
*           type: object
*           properties:
*             registrationNumber:
*               type: string
*             password:
*               type: string
*         required:
*           - registrationNumber
*           - password
*     responses:
*       200:
*         description: logged in successfully
*       404:
*         description: Registration number not found
*       401:
*         description: Unauthorized
*
*/

router.post("/register",registerNewHospitalFunc);
router.post("/login",hospitalLoginFunc);
router.get('/allowed-list',Authenticate,getAllowedListFunc);
router.get("/not-allowed-list",Authenticate,getAllNotAllowedHIdsFunc);
router.post("/request-for-access",Authenticate, requestForAccessFunc);
router.post("/allow-access",Authenticate,allowAccessFunc);
router.post("/request-for-data",requestForDataFunc);
router.post("/forgot-password",forgotPasswordFunc);
router.post("/reset-password",resetPasswordFunc);
router.get("/logout", hospitalLogoutFunc);

module.exports = router
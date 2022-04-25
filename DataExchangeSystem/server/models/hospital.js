const mongoose = require('mongoose')
const { Schema } = mongoose


const hospitalSchema = new Schema({
    hid: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    avatar:{
        type:String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    otp: {
        type: String,
    },
    allowedList:[
        {
            type:String
        }
    ]

})


module.exports = mongoose.model('hospital', hospitalSchema)

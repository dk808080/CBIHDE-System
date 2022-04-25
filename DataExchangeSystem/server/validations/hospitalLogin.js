const Validator = require('validator');
const isEmpty = require('./isEmpty');


const validateHospitalLoginInput = (data) => {
    let errors = {}
    data.hid = !isEmpty(data.hid) ? data.hid : '';
    data.password = !isEmpty(data.password) ? data.password : '';
    data.email = !isEmpty(data.email) ? data.email : '';

    if (!Validator.isLength(data.hid, { min: 6, max: 6 })) {
        errors.hid = 'HID must be of 6 characters';
    }

    if (Validator.isEmpty(data.hid)) {
        errors.hid = 'Registration Number field is required';
    }

    if (!Validator.isEmail(data.email)) {
        errors.email = 'Email is invalid';
    }

    if (Validator.isEmpty(data.email)) {
        errors.email = 'Email field is required';
    }

    if (Validator.isEmpty(data.password)) {
        errors.password = 'Password field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };

}


module.exports = validateHospitalLoginInput 
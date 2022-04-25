const Validator = require('validator');
const isEmpty = require('./isEmpty');


const validateAllowAccessInput = (data) => {
    let errors = {}
    data.hid = !isEmpty(data.hid) ? data.hid : '';

    if (!Validator.isLength(data.hid, { min: 6, max: 6 })) {
        errors.hid = 'HID must be of 6 characters';
    }

    if (Validator.isEmpty(data.hid)) {
        errors.hid = 'HID field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };

}


module.exports = validateAllowAccessInput 
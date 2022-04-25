const Validator = require('validator');
const isEmpty = require('./isEmpty');


const validateRequestForDataInput = (data) => {
    let errors = {}
    data.anumber = !isEmpty(data.anumber) ? data.anumber : '';

    if (!Validator.isLength(data.anumber, { min: 12, max: 12 })) {
        errors.anumber = 'Addhar number must be of 12 digits';
    }

    if (Validator.isEmpty(data.anumber)) {
        errors.anumber = 'Addhar number field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };

}


module.exports = validateRequestForDataInput 
const Validator = require('validator');
const isEmpty = require('./isEmpty');


const validateHospitalRegisterInput = (data) => {
    let errors = {}
    data.url = !isEmpty(data.url) ? data.url : '';
    data.name = !isEmpty(data.name) ? data.name : '';
    data.password = !isEmpty(data.password) ? data.password : '';
    data.confirmPassword = !isEmpty(data.confirmPassword) ? data.confirmPassword : '';
    data.email = !isEmpty(data.email) ? data.email : '';

    if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
        errors.name = 'Hospital name must be of 2 to 30 characters';
    }

    if (Validator.isEmpty(data.name)) {
        errors.name = 'Hospital name field is required';
    }

    if (!Validator.isEmail(data.email)) {
        errors.email = 'Email is invalid';
    }

    if (Validator.isEmpty(data.email)) {
        errors.email = 'Email field is required';
    }

    if (Validator.isEmpty(data.url)) {
        errors.url = 'URL field is required';
    }

    if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
        errors.password = 'Password must contain at least six character';
    } 

    if (Validator.isEmpty(data.password)) {
        errors.password = 'Password field is required';
    }

    if (Validator.isEmpty(data.confirmPassword)) {
        errors.confirmPassword = 'confirmPassword field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };

}


module.exports = validateHospitalRegisterInput 
(() => {
    'use strict';

    const modelconfig = require('../../configs/model');

    module.exports = {
        first_name: {
            type: modelconfig.dataTypes.string,
            required: true,
            validation_message: "First name is required"
        },
        last_name: {
            type: modelconfig.dataTypes.string,
            required: true,
            validation_message: "Last Name is required"
        },
        email: {
            type: modelconfig.dataTypes.string,
            required: true,
            validation_message: "Email is required"
        },
        salutation: {
            type: modelconfig.dataTypes.string,
        },
        user_role: {
            type: modelconfig.dataTypes.string,
            required: true,
            validation_message: "User Role must be specify"
        },
        password: {
            type: modelconfig.dataTypes.string,
            required: true,
            validation_message: "Password is required"
        },
        agree_terms_condition: {
            type: modelconfig.dataTypes.bool,
            required: true,
            validation_message: "check terms and condition"
        }
    };
})();
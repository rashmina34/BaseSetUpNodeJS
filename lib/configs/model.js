(() => {
    'use strict';

    module.exports = {
        dataTypes: {
            string: 'string',
            integer: 'integer',
            float: 'float',
            double: 'double',
            object: 'object',
            array: 'array',
            bool: 'boolean',
            date: 'date',
            time: 'time,'
        },
        validationChecks: {
            isEmail: 'isEmail',
            notEmpty: 'notEmpty',
            isInt: 'isInt',
            isNumber: 'isNumber',
            isBoolean: 'isBoolean',
            isCreditCard: 'isCreditCard',
            isCurrency: 'isCurrency',
            isDataURI: 'isDataURI',
            isDecimal: 'isDecimal',
            isFQDN: 'isFQDN',
            isIP: 'isIP',
            isJSON: 'isJSON',
            isLowercase: 'isLowercase',
            isNumeric: 'isNumeric',
            isURL: 'isURL',
            isUUID: 'isUUID',
            isFloat: 'isFloat',
            isUppercase: 'isUppercase',
            isDesignation: 'isDesignation'
        }
    };
})();
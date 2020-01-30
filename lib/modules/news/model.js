(() => {
    'use strict';

    const modelConfig = require('../../configs/model');

    module.exports = {
        title: {
            type: modelConfig.dataTypes.string,
            required: true,
            validation_message: 'News title is required'
        },

        details: {
            type: modelConfig.dataTypes.string,
            required: true,
            validation_message: 'News detail is required'
        },
        active: {
            type: modelConfig.dataTypes.bool,
            required: true,
            validation_message: "Active status is required"
        }
    }
})();
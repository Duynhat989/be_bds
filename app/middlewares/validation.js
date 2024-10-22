const { validationResult } = require('express-validator');

// Hàm xử lý validate chung
const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: req.t('validation.invalidSyntax'),  
                errors: errors.array().map(error => ({
                    field: error.param,
                    message: error.msg,
                    location: error.location
                })),
                statusCode: 400
            });
        }
        next();
    };
};

module.exports = { validate };

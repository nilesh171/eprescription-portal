const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('../config/awsS3');
const path = require('path');
require('dotenv').config();

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, `prescriptions/${Date.now()}_${path.basename(file.originalname)}`);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;

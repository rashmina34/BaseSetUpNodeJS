const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require("multer-storage-cloudinary");

const uniqueFilename = new Date().toISOString();

const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: "demo",
  allowedFormats: ["jpg", "png", "jpeg"],
  filename: function (req, file, cb) {
    cb(undefined, `${uniqueFilename}`)
  },
});

const upload = multer({
  fileFilter: (req, file, cb) => {

    let ext = path.extname(file.originalname);
    if (ext === '.png' || ext === '.jpg' || ext === '.gif') {
      return cb(null, true)
    }
    return cb(new Error('Only images are allowed'))
  },
  storage: storage
});

const storageFile = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${__dirname}/public/files`);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + file.originalname)
  }
});
const uploadFile = multer({
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    if (ext === '.pdf' || ext === '.txt' || ext === '.docs') {

      return cb(null, true)
    }
    return cb(new Error('Only files are allowed'))
  }
  , storage: storageFile
});

//module.exports = upload;
module.exports = {
  upload_file: uploadFile,
  upload_image: upload,
  file_name: uniqueFilename
};





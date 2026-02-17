const fs =require('fs');
const path = require("path");
const multer = require("multer");

const maxMB = Number(process.env.MAX_FILE_SIZE)
const uploadDir = path.join(__dirname, "..", process.env.UPLOAD_DIR)

if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir)
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
      const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, uniquePrefix + "-" + file.originalname) 
      
    }
  })
  
  function fileFilter(req,file,cb){
    const allowed= [
        "image/png",
        "application/pdf",
        "application/msword",
        "application/json",
        "text/plain",
        "application/vnd.ms-excel"
    ]

    if(!allowed.includes(file.mimetype)){
        return cb(new Error("File type not allowed!"),false)
    }
    cb(null,true)
  }


const upload = multer({
    storage:storage,
    fileFilter,
    limits: {fileSize: maxMB}
});


module.exports =  {upload, uploadDir}
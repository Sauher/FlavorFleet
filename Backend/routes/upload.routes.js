const router = require("express").Router()
const {upload, uploadDir} = require("../middleware/upload.middleware")
const {authenticate} = require("../middleware/auth_middleware")


router.post('/single',upload.single("file"),(req,res)=>{
 if(!req.file){
    return res.status(400).json({message: "No file uploaded!"})
 }

 res.status(200).json({
    url: `${process.env.UPLOAD_DIR}/${req.file.filename}`,
    originalname: req.file.originalname,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype
 })
})

router.post('/multiple',upload.array("files",10),(req,res)=>{
    if(!req.files){
        return res.status(400).json({message: "No file uploaded!"})
    }

    const files = (req.files).map((file) =>({
            url: `${process.env.UPLOAD_DIR}/${file.filename}`,
            originalname: file.originalname,
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype
       
    }))


    return res.status(200).json({files})
})


module.exports = router
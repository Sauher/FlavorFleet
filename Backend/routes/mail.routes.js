const router = require("express").Router();

const {sendMail} = require("../services/mail.service");

router.post('/send', async (req,res)=>{
    try{
        const {to,subject,html} =req.body;
        if(!to || !subject || !html){
            return res.status(400).json({message : "Missing required fields!"})

        }
        const result = await sendMail({to,subject,html})
        res.status(200).json({message:result.message});
    }
    catch(err){
        res.status(500).json({message:"Internal server error", error: err.message });
    }
})


module.exports = router
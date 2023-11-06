const express = require("express");
// const { upload } = require("../helper/upload");
const {
    sendEmail,
    getEmailById
} = require("../controllers/email.controller");
// const { webProtection } = require("../helper/auth");
const router = express.Router();

router.post('/sendemail', sendEmail)
router.get("/getemailbyid/:id", getEmailById)
// router.get('/getuser/:id', getUserById)
// router.post('/loginuser' ,loginUser)
// router.put('/updateuser/:id', upload.single("profile_pic") , updateUser)

module.exports = router;
const express = require("express");
// const { upload } = require("../helper/upload");
const {
    sendEmail,
    getEmailById, getEmailByUserId, getEmailBySearch
} = require("../controllers/email.controller");
// const { webProtection } = require("../helper/auth");
const router = express.Router();

router.post('/sendemail', sendEmail)
router.get("/getemailbyid/:id", getEmailById)
router.get('/getemailbyuserid/:id', getEmailByUserId);
router.post('/getemailbysearch/:search', getEmailBySearch)

module.exports = router;
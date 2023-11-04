const express = require("express");
const { upload } = require("../helper/upload");
const {
  getUserById,
  registration,
  loginUser,
  updateUser
} = require("../controllers/user.controller");
// const { webProtection } = require("../helper/auth");
const router = express.Router();

router.get('/getuser/:id', getUserById)
router.post('/registration', registration)
router.post('/loginuser' ,loginUser)
router.put('/updateuser/:id', upload.single("profile_pic") , updateUser)

module.exports = router;

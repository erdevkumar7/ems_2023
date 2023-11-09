const {
  generateToken,
  hashPassword,
  isValidPassword,
} = require("../helper/auth");

require("dotenv").config();
const db = require("../models/index.model");

const jsonwebtoken = require("jsonwebtoken");
const { capitalizeFirstLetter } = require("../helper/help");
const { generateHashPass } = require("../helper/generatePassword");
const sendEmails = require("../helper/sendMails");
const User = db.User;
const fs = require("fs");

exports.getUserById = async (req, res) => {
  const userId = req.params.id;
  try {
    const getUserById = await User.findOne({
      where: { id: userId },
    });

    if (getUserById) {
      res.status(200).json(getUserById);
    }
    if (!getUserById) {
      res.status(404).json("User not Found!");
    }
  } catch (e) {
    res.status(400).json(e);
  }
};

exports.registration = async (req, res) => {
  const genPass = JSON.parse(await generateHashPass());
  const {
    first_name,
    last_name,
    email,
    phone_number,
    date_of_birth,
    password,
    profile_pic,
    loggedin_by,
  } = req.body;

  const findUser = await User.findOne({
    where: { email: email },
  });
  if (
    (email && loggedin_by === "facebook") ||
    (email && loggedin_by === "google")
  ) {
    //  return res.send('fb or google')

    if (findUser !== null) {
      // return res.status(400).json("Email already Registered!")
      const user = await User.update(
        {
          first_name: first_name,
          last_name: last_name,
          email: email,
          profile_pic: profile_pic,
          loggedin_by: loggedin_by,
        },
        { where: { id: findUser.dataValues.id } }
      );
      const updatedUser = await User.findOne({
        where: { id: findUser.dataValues.id },
      });
      const token = await generateToken({
        id: findUser.dataValues.id,
        email: email,
      });
      return res.status(201).json({ updatedUser, loginToken: token });
    } else {
      const user = await User.create({
        first_name: first_name,
        last_name: last_name,
        email: email,
        profile_pic: profile_pic,
        loggedin_by: loggedin_by,
      });
      const token = await generateToken({
        id: user.dataValues.id,
        email: email,
      });

      return res.status(201).json({ user, loginToken: token });
    }
  } else {
    if (findUser) {
      // learner self registration
      return res.status(400).json("Email already Registered!");
    } else if (!email) {
      return res.status(400).json("Email faild is Required!");
    } else {
      const user = await User.create({
        first_name,
        last_name,
        email,
        phone_number,
        date_of_birth,
        password: await hashPassword(
          password ? password : process.env.TEMPPASS
        ),
      });

      return res.status(201).json(user);
    }
  }
};

exports.loginUser = async (req, res) => {
  const { email, password, identifier } = req.body;

  if (email && identifier === "userautologinwithemail") {
    const user = await User.findOne({
      where: { email: email, is_deleted: false },
    });
    const token = await generateToken({
      id: user.id,
      email: user.email,
    });
    res.status(200).json({
      userDetails: user,
      loginToken: token,
    });
  } else {
    const user = await User.findOne({
      where: { email: email },
    });
    if (!user) {
      return res.status(404).json("User not exist with this Email!");
    }
    const validPassword = await isValidPassword(password, user.password);
    if (!validPassword) {
      res.status(400).json("Password Incorrect!");
    }
    if (validPassword) {
      const token = await generateToken({
        id: user.id,
        email: user.email,
      });

      res.status(200).json({
        userDetails: user,
        loginToken: token,
      });
    }
  }
};

exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  let profile_pic;
  if (req.file) {
    profile_pic = req.file.path;
  }
  const findUser = await User.findOne({
    where: { id: userId },
  });
  if (!findUser) {
    res.status(404).json("User not Found!");
  }

  if (findUser) {
    const { first_name, last_name, email, phone_number, date_of_birth } =
      req.body;

    const token = req.headers.logintoken;
    const decode = jsonwebtoken.verify(token, process.env.SIGNING_KEY);
    const checkEmail = await User.findOne({ where: { email: email } });
    const existUser = await User.findOne({
      where: { email: email, id: userId },
    });
    if (!checkEmail || existUser) {
      const update = await User.update(
        {
          first_name,
          last_name,
          phone_number,
          date_of_birth,
          email,
          profile_pic: profile_pic,
        },
        { where: { id: userId } }
      );
      const updatedUser = await User.findOne({ where: { id: userId } });
      return res.status(201).json(updatedUser);
    }

    if (checkEmail) {
      return res.status(400).json("Email already Registered!");
    }
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const decode = jsonwebtoken.verify(token, process.env.SIGNING_KEY);
    const user_id = decode.id;

    const findUser = await User.findOne({
      where: { id: user_id },
    });

    if (!findUser) {
      console.log("user not Found!");
      return res.status(400).json("user not Found!");
    }

    if (findUser) {
      findUser.password = await hashPassword(password);
      findUser.save();

      res.status(202).json("password change succesfully!");
    }
  } catch (e) {
    res.status(400).json(e);
  }
};

exports.forgotPassword = async (req, res) => {
  const { to, emailType } = req.body;
  const findUser = await User.findOne({
    where: { email: to },
  });

  if (!findUser) {
    return res.status(400).json("Email not found!");
  }

  //   const findEmailSendingData = await EmailManage.findOne({
  //     where: { emailtype: emailType },
  //   });

  if (findUser) {
    const send = require("gmail-send")({
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
      to,
      subject: "Reset password request",
    });
    try {
      const genToken = await generateToken({
        id: findUser.id,
        email: findUser.email,
      });

      let result = `<div style="max-width: 600px; margin: 0px auto;" class="email-container bg_white" ;>
        <div style="text-align: center">
           <div style="background: #E8661B;height:10px;margin-bottom:10px;"></div>
        <div style="background: #E8661B;height:2px;margin-top:10px;"></div>
        </div>
           <div style="padding:15px">
              <h1 style="font-size: 23px;color: #E8661B;font-weight: bold;text-align:center;margin-top:10px">RESET PASSWORD</h1>
              <p style="margin-bottom:10px">Hi {{username}}, </p>
              <p style="margin-bottom:10px">We’ve received a request to reset the password for your account!
                 <span>If you did not make this request then please ignore this email.</span>
              </p>
              <p style="margin-bottom:10px">Otherwise, please click this link to change your password - 
                 <a href="http://localhost:3000/resetpassword?token={{forgotPasswordToken}}" style="color:#22489e"> Reset Password </a></p>
                    <span>Thanks & Regards,</span><br/>
                    <span style="color:#E8661B">EmailManagement System</span><br/>
                  
           </div>
           <div style="background: #E8661B;height:2px;margin-bottom:10px;">
           </div>
        </div>`;

      // console.log("result: ", result);
      const { full } = await send({
        html: `${result
          .replace(
            "{{username}}",
            `${capitalizeFirstLetter(findUser?.first_name)} ${
              findUser?.last_name
            }`
          )
          .replace("{{forgotPasswordToken}}", genToken)}`,
        // files: [filepath],
      });

      // console.log(full)
      res.status(200).json(result);
    } catch (error) {
      res.json(error);
    }
  }
};

exports.getUserByEmail = async (req, res) => {
  const search = req.params.search;

  const findUser = await User.findOne({
    where: { email: search },
  });

  if (findUser) {
    res.status(200).json(findUser);
  } else {
    res.status(404).json("Email Not Found");
  }
};

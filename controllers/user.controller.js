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
const EmailManage = db.EmailManage;
const Site = db.Site;
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
    if ((email && loggedin_by === "facebook") || (email && loggedin_by === "google")) {
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
        const { first_name, last_name, email, phone_number, date_of_birth } = req.body;

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
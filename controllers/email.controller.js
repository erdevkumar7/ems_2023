
require("dotenv").config();
const db = require("../models/index.model");
const Email = db.Email;
const User = db.User;
const fs = require("fs");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

exports.sendEmail = async (req, res) => {
    const token = req.headers.logintoken;
    const {
        user_id,
        to_email,
        subject,
        cc,
        bcc,
        content,
        attachment,
        is_read,
        sender_email_id,
        created_by,
        updated_by,
        reply_by,
    } = req.body;

    // if (!token) {
    //     res.status(401).json("Unauthorized access,login token required");
    // } else {
        try {
            const send = require("gmail-send")({
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASS,
                to: to_email,
                subject,
            });
            const { full } = await send({
                html: `${content}`,
                // files: [filepath],
            });
            // res.status(200).json(result);
            if (full.messageId === '') {
                res.status(400).json('Unable to sent email');
            } else {
                const emailCreated = await Email.create({
                    user_id,
                    to_email,
                    subject,
                    cc,
                    bcc,
                    content,
                    attachment,
                    is_read,
                    created_by,
                    updated_by,
                    reply_by,
                    sender_email_id
                })
                return res.status(201).json(emailCreated);
            }
        } catch (e) {
            res.status(400).json(e);
        }
    // }
}

exports.getEmailById = async (req, res) => {
    const emailId = req.params.id
    const token = req.headers.logintoken;

    if (!token) {
        res.status(401).json("Unauthorized access,login token required");
    } else {
        try {
            const getEmailById = await Email.findOne({
                where: { id: emailId }
            })

            if (getEmailById) {
                res.status(200).json(getEmailById)
            } else {
                res.status(404).json("Email Not Found")
            }
        } catch (e) {
            res.status(400).json(e);
        }
    }
};

exports.getEmailByUserId = async (req, res) => {
    const userId = req.params.id
    const token = req.headers.logintoken;

    if (!token) {
        res.status(401).json("Unauthorized access,login token required");
    } else {
        try {
            const getEmailByUserId = await Email.findAll({
                where: { user_id: userId }
            })

            if (getEmailByUserId) {
                res.status(200).json(getEmailByUserId)
            } else {
                res.status(404).json("Email Not Found")
            }
        } catch (e) {
            res.status(400).json(e);
        }
    }

}

exports.getEmailBySearch = async (req, res) => {
    const search = req.params.search;

    const getEmailBySearched = await Email.findOne({
        where: {   to_email: search},
    });
    if (getEmailBySearched) {
        res.status(200).json(getEmailBySearched)
    } else {
        res.status(404).json("Email Not Found")
    }
};

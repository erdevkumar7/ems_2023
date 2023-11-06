
require("dotenv").config();
const db = require("../models/index.model");
const Email = db.Email;
const User = db.User;
const fs = require("fs");

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
        created_by,
        updated_by,
        reply_by,
    } = req.body;

    if (!token) {
        res.status(401).json("Unauthorized access,login token required");
    } else {
        try {
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
            })

            return res.status(201).json(emailCreated);
        } catch (e) {
            res.status(400).json(e);
        }
    }
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
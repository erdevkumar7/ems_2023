'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {

    class Email extends Model {
        static associate(model) { }
    }
    Email.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
        },
        to_email: {
            type: DataTypes.STRING,
        },
        user_id: {
            type: DataTypes.STRING,
        },
        subject: {
            type: DataTypes.STRING,
        },
        cc: {
            type: DataTypes.STRING,
        },
        bcc: {
            type: DataTypes.STRING,
        },
        attachment: {
            type: DataTypes.STRING,
        },
        is_read: {
            type: DataTypes.STRING,
        },
        reply_by: {
            type: DataTypes.STRING,
        },
        sender_email_id:{
            type: DataTypes.STRING,
        },
        content: {
            type: DataTypes.STRING,
        },
        created_by: {
            type: DataTypes.INTEGER,
        },
        updated_by: {
            type: DataTypes.INTEGER,
        },
    },
        {
            sequelize,
            modelName: "emails"
        })
    // sequelize.sync({ alter: true }).then(() => {
    //     console.log('Email table created successfully!');
    // }).catch((error) => {
    //     console.error('Unable to create table : ', error);
    // })

    return Email
}

const Promise = require('promise')
const mongoose = require("mongoose");
const usermodel = require('../model/users')
const bcrypt = require('bcrypt');
const { response } = require('../app');
const { reject, resolve } = require('promise');





module.exports = {

    dosignup: (userData) => {


        return new Promise(async (resolve, reject) => {
            let { otp, logname, logemail, lognumber, logpassword, confirmpassword } = userData
            logemail = logemail.toLowerCase()

            logpassword = await bcrypt.hash(logpassword, 10)
            user = new usermodel({
                logname,
                logemail,
                lognumber,
                logpassword
            })


            user.save().then((data) => {
                console.log(data)
                resolve(data)
            }).catch((err) => {
                console.log(err)
            })

        })
    }





    ,
    dologin: (logindata) => {

        const { logemail, logpassword } = logindata

        return new Promise(async (resolve, reject) => {
            let user = await usermodel.findOne({ logemail }).populate('membership').lean()
            const response = {}

            if (user) {
                bcrypt.compare(logpassword, user.logpassword, (err, valid) => {
                    if (valid) {
                        response.valid = true
                        response.user = user
                        resolve(response)
                    } else {
                        response.valid = false
                        resolve(response)
                    }
                })
            } else {
                response.valid = false
                resolve(response)
            }
        })



    },
    userexist: (userdata) => {

        return new Promise(async (resolve, reject) => {

            let { logname, logemail, lognumber, logpassword } = userdata
            const response = {}
            let user = await usermodel.findOne({ logemail })
            if (user) {
                response.alreadyregistered = true;
                resolve(response)
            } else {

                response.alreadyregistered = false;
                resolve(response)
            }

        })
    },
    mobileexist: (lognumber) => {
        return new Promise((resolve, reject) => {
            const response = {}
           
            usermodel.findOne({ lognumber }).then((user) => {
                console.log(user+"user")
                if (user) {
                    response.user = user;
                    response.userfound = true;
                    resolve(response)
                } else {
                    response.userfound = false;
                    resolve(response)
                }
            }).catch((err) => { reject(err) })

        })

    }






}
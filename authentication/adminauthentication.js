const Promise = require('promise')
const mongoose = require("mongoose");
const adminmodel = require('../model/adminlogin')
const bcrypt = require('bcrypt');

module.exports={

    // adminlogin: (userData) => {
        
    //     console.log(userData);
    //     return new Promise(async (resolve, reject) => {
    //         let { adminname, adminemail, adminnumber, adminpassword } = userData
    //         console.log(adminpassword);

    //         adminpassword = await bcrypt.hash(adminpassword, 10)
    //         admin = new adminmodel({
    //             adminname,
    //             adminemail,
    //             adminnumber,
    //             adminpassword
    //         })

    //         admin.save().then((data) => {
    //             console.log(data)
    //             resolve(data)
    //         }).catch((err) => {
    //             console.log(err)
    //         })
    //     })
    // },
    adminlogin: (logindata) => {

        const { adminemail, adminpassword } = logindata

        return new Promise(async (resolve, reject) => {
            let admin = await adminmodel.findOne({ adminemail })
            const response = {
                adminnotfound: false
            }
            console.log(admin+"dologin");
            if (admin){
                bcrypt.compare(adminpassword, admin.adminpassword, (err, valid) => {
                    if (valid) {
                        response.adminvalid = true
                        response.admin=admin
                        resolve(response)
                    } else {
                        response.adminvalid = false
                        resolve(response)
                    }
                    if(err){
                        reject(err)
                    }
                })
            }else{
                response.adminvalid = false
                resolve(response)
            }
        })



    },
    mobileexist:(adminnumber)=>{

        console.log("mob exist fun working");
        return new Promise(async(resolve,reject)=>{
            const response={}
            let admin = await adminmodel.findOne({ adminnumber })
            if(admin){
                console.log('user found');
                response.admin=admin;
                response.adminfound=true;
                resolve(response)
            }else{
                console.log('usernot found');
                response.adminfound=false;
                resolve(response)
            }
        })

    }


}
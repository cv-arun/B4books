const mongoose = require("mongoose");


const AdminSchema = new mongoose.Schema({
    adminname:{
        type: String,
       
    }
    ,
    adminemail:{
        type:String
        
    },
    adminnumber:{
        type:String,
        
    },
    adminpassword:{
        type:String
        

    }
}) ;

module.exports = mongoose.model("admin",AdminSchema);
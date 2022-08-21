const mongoose = require("mongoose");

Schema = mongoose.Schema

const UserSchema = new mongoose.Schema({
    logname:{
        type: String,
       
    }
    ,
    logemail:{
        type:String
        
    },
    lognumber:{
        type:String,
        
    },
    logpassword:{
        type:String
    },
    status:{
        type:Boolean,
        default:true
    },
    verified:{
        type:Boolean,
        default:true
    },
    membership:{
        type:Schema.Types.ObjectId,
        ref:'Membership'
    },
    membershipdate:{
        type:Date
    },
    membershipstatus:{
        type:Boolean,
        default:false
    }

}) ;

module.exports = mongoose.model("User",UserSchema);
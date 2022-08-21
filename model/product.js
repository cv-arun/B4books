const mongoose = require("mongoose"),

Schema = mongoose.Schema


const ProductSchema = new mongoose.Schema({
    title:{
        type: String, 
    },
    author:{
        type: String, 
    },
    publisher:{
        type: String,
        default:'Publication' 
    },
    rating:{
        type: Number, 
    },
    description:{
        type: String, 
    },
    aboutAuthor:{
        type: String, 
    },
    catagory:{
        type: Schema.Types.ObjectId,
        ref:'Catagory'
    },
    subCatogory:{
        type:Schema.Types.ObjectId,
        ref:'SubCatagory'
    },
    PremiumLevel:{
        type: String, 
    },
    stock:{
        type:Number,
    },
    orderCount:{
        type:Number,
    },
    activeStatus:{
        type:String,
        default:'active'
    }

   
   
}) 

module.exports = mongoose.model("Product",ProductSchema);
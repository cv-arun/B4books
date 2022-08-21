const mongoose = require("mongoose"),

Schema = mongoose.Schema
const WishSchema=new mongoose.Schema({
    userid:{
      type: Schema.Types.ObjectId,
        ref:'User'
    },
    wishlist:[{
        type: Schema.Types.ObjectId,
          ref:'Product'
      }]
   
 },{
    timestamps:true
 }) 

 module.exports=mongoose.model("Wishlist",WishSchema);
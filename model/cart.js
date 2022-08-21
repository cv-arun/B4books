const mongoose = require("mongoose"),

Schema = mongoose.Schema
const CartSchema=new mongoose.Schema({
    userid:{
      type: Schema.Types.ObjectId,
        ref:'User'
    },
    cartItems:[{
        type: Schema.Types.ObjectId,
          ref:'Product'
      }]
   
 },{
    timestamps:true
 }) 

 module.exports=mongoose.model("Cart",CartSchema);
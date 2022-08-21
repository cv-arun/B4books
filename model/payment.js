const mongoose=require('mongoose')


const PaymentSchema=new mongoose.Schema({
    userid: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    amount:String,
    success:{
        type:Boolean,
        default: false
    },
    membership:{
        type:Schema.Types.ObjectId,
        ref:'Membership'
    },
    membershipName:String
  
},{
   timestamps:true
}) 

module.exports=mongoose.model("Payment",PaymentSchema);
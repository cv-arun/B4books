const mongoose=require('mongoose')


const BannerSchema=new mongoose.Schema({
   banner:{
       type:String,
   },
  
},{
   timestamps:true
}) 

module.exports=mongoose.model("Banner",BannerSchema);
 const mongoose=require('mongoose')


 const CatogorySchema=new mongoose.Schema({
    catagory:{
        type:String,
    },
   
 },{
    timestamps:true
 }) 

 module.exports=mongoose.model("Catagory",CatogorySchema);
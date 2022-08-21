const mongoose = require('mongoose'),
   Schema = mongoose.Schema

const SubCatogorySchema = new mongoose.Schema({
   subCatagory: {
      type: String,
   },
   Catagory: {
      type: Schema.Types.ObjectId,
      ref: 'Catagory'
   }
}, {
   timestamps: true
})

module.exports = mongoose.model("SubCatagory", SubCatogorySchema);
const mongoose = require("mongoose"),

    Schema = mongoose.Schema
const returngschema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    items: [{

        type: String,
    }],
    address: {
        type: Schema.Types.ObjectId,
        ref: 'Adress'
    },
    completed:{
        type:Boolean,
        default: false
    }

}, {
    timestamps: true
})

module.exports = mongoose.model("Return", returngschema);
const mongoose = require("mongoose"),

    Schema = mongoose.Schema
const OrderSchema = new mongoose.Schema({
    userid: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    product: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }],
    adress: {
        type: Schema.Types.ObjectId,
        ref: 'Adress'
    },
    delivered: {
        type: Boolean,
        default: false
    },
    shipped:{
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
})

module.exports = mongoose.model("Order", OrderSchema);
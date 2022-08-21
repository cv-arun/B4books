const mongoose = require("mongoose"),

    Schema = mongoose.Schema
const LogSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    log: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        }, deliveredat: {
            type: Date,
            default: new Date().getTime()
        },
        return: {
            type: Boolean,
            default: false
        },
        returnat: {
            type: Date,
        },
        returnRequest: {
            type: Boolean,
            default: false
        }
    }]

}, {
    timestamps: true
})

module.exports = mongoose.model("Orderlog", LogSchema);
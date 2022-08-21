const mongoose = require("mongoose"),

    Schema = mongoose.Schema
const Holdingschema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    log: [{

        type: Schema.Types.ObjectId,
        ref: 'Product'

    }]

}, {
    timestamps: true
})

module.exports = mongoose.model("Holding", Holdingschema);
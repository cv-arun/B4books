const mongoose = require('mongoose')
Schema = mongoose.Schema

const AddressSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    fullname: {
        type: String,
    },
    mobile: {
        type: String,
    },
    line1: {
        type: String,
    },
    line2: {
        type: String,
    },
    pincode: {
        type: String,
    },
    district: {
        type: String,
    },
    state: {
        type: String,
    },

}, {
    timestamps: true
})

module.exports = mongoose.model("Adress", AddressSchema);
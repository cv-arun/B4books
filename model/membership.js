const mongoose = require('mongoose');

const MembershipSchema = new mongoose.Schema({

    plan: {
        type: String,
    },
    registrationFee: {
        type: String,
    },
    cautionDeposit: {
        type: String,
    },
    membershipFee: {
        type: String
    },
    perDeliveryLimit: {
        type: String
    },
    holdingLimit: {
        type: String
    },
    planDuration: {
        type: String
    },
    status: {
        type: Boolean,
        default: true
    }

    
})

module.exports = mongoose.model("Membership",MembershipSchema);
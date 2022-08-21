const mongoose = require('mongoose');
const usermodel = require('../model/users')
const membershipmodel = require('../model/membership')
const bannermodel = require('../model/banner')
const ordermodel = require('../model/order')
const logmodel = require('../model/orderLog')
const returnmodel = require('../model/retuenRequest')
const holdingmodel = require('../model/holding')
const paymentmodel = require('../model/payment')




const adminhelper = {

    showAllUsers: () => {


        return new Promise((resolve, reject) => {
            try {
                let user = usermodel.find({}).sort({ createdAt: -1 }).lean()
                resolve(user)
            }
            catch (err) {
                reject(err)
            }

        })
    },


    blockUser: (userId) => {


        return new Promise((resolve, reject) => {
            console.log(userId)
            usermodel.findByIdAndUpdate(userId, { status: false }).then((response) => {
                resolve(response)
            }).catch((error) => { reject(err) })
        })
    },

    UnblockUser: (userId) => {

        return new Promise((resolve, reject) => {
            console.log(userId)
            usermodel.findByIdAndUpdate(userId, { status: true }).then((response) => {
                resolve(response)
            }).catch((err) => { reject(err) })
        })

    },
    membership: (planData) => {
        const { plan, registrationFee, cautionDeposit,
            membershipFee, perDeliveryLimit, holdingLimit,
            planDuration } = planData

        return new Promise((resolve, reject) => {
            let membershipPlan = new membershipmodel({
                plan, registrationFee, cautionDeposit,
                membershipFee, perDeliveryLimit, holdingLimit,
                planDuration
            })

            membershipPlan.save().then((response) => {
                resolve(response)
            }).catch((err) => {
                reject(err)
            })
        })


    },
    showMembershipPlans: () => {
        return new Promise((resolve, reject) => {
            membershipmodel.find({ status: true }).lean().then((membershipPlans) => { resolve(membershipPlans) })
                .catch((err) => { reject(err) });

        })
    },
    showMembershipPlan: (planId) => {
        return new Promise((resolve, reject) => {
            membershipmodel.findById(planId).lean().then((membershipPlans) => { resolve(membershipPlans) })
                .catch((err) => { reject(err) })

        })
    },
    updatePlandetails: (planId, planDetails) => {

        const { plan, registrationFee, cautionDeposit,
            membershipFee, perDeliveryLimit, holdingLimit,
            planDuration } = planDetails

        return new Promise((resolve, reject) => {

            membershipmodel.findByIdAndUpdate(planId, {
                plan, registrationFee, cautionDeposit,
                membershipFee, perDeliveryLimit, holdingLimit,
                planDuration
            }).then((data) => { resolve(data) }).catch((err) => reject(err))
        })

    },
    deletePlan: (planId) => {
        return new Promise((resolve, reject) => {
            membershipmodel.findByIdAndUpdate(planId, { status: false }).then((data) => { resolve(data) }).catch((err) => { reject(err) })
        })
    },
    addbanner: (banner) => {
        return new Promise((resolve, reject) => {

            banner = new bannermodel({ banner })
            banner.save().then((data) => {
                resolve(data._id)
            }).catch((err) => { reject(err) })
        })
    },
    deleteBanner: (bannerId) => {
        return new Promise((resolve, reject) => {
            bannermodel.findByIdAndDelete(bannerId).then((data) => { resolve(data) }).catch((err) => { reject(err) })

        })
    },
    showOrders: () => {
        return new Promise((resolve, reject) => {
            ordermodel.find({}).populate('adress').sort({ createdAt: -1 }).populate('userid').populate('product').lean().then((data) => {
                resolve(data)
            }).catch((err) => { reject(err) })
        })
    },
    shiped: (orderId) => {
        return new Promise((resolve, reject) => {
            ordermodel.findByIdAndUpdate(orderId, { shipped: true }).then((data) => {
                resolve(data)
            }).catch((err) => { reject(err) })
        })

    },
    delivered: (orderId, userId) => {
        return new Promise((resolve, reject) => {
            ordermodel.findByIdAndUpdate(orderId, { delivered: true }).then((data) => {

                data.product.forEach((curr) => {
                    let item = { product: curr }
                    logmodel.updateOne({ userid: data.userid }, { $push: { log: item } }).then((response) => {
                        resolve(data)
                    })
                })

            }).catch((err) => { reject(err) })
        })
    },
    returnRequests: () => {
        return new Promise((resolve, reject) => {
            returnmodel.find().populate('address').sort({ createdAt: -1 }).populate('items.product').populate('user').lean().then((data) => {
                resolve(data)
            }).catch((err) => { reject(err) })
        })
    },
    returned: (returnId) => {
        return new Promise((resolve, reject) => {
            returnmodel.findByIdAndUpdate(returnId, { completed: true }).then(async (data) => {

                let userId = data.user
                let returnitems = data.items
                holdingmodel.findOne({ user: userId }).then((holding) => {
                    logmodel.findOne({ user: userId }).then((orderlog) => {

                        returnitems.forEach((returned) => {

                            holding.log.forEach((curr, index) => {
                                console.log(returned + "retured" + curr)
                                if (returned == curr) {

                                    holding.log.splice(index, 1)
                                }
                            })
                            orderlog.log.forEach((curr, index) => {

                                if (returned == curr.product) {

                                    orderlog.log[index].return = true
                                }
                            })
                        })
                        logmodel.findOneAndUpdate({ user: userId }, { log: orderlog.log }).then((retunupdate) => {
                            holdingmodel.findOneAndUpdate({ user: userId }, { log: holding.log }).then((response) => {
                                resolve(response)
                            }).catch((err) => { reject(err) })

                        }).catch((err) => { reject(err) })

                    })
                })


            })
        })
    },
    paymentDetails: () => {
        return new Promise((resolve, reject) => {
            paymentmodel.find().populate('membership').populate('userid').sort({ createdAt: -1 }).lean().then((payment) => {
                resolve(payment)
            }).catch((err) => { reject(err) })

        })
    },
    incomePerPlan: () => {
        return new Promise(async (resolve, reject) => {



            amounttoint = {
                $addFields: {
                    convertedamount: { $toInt: "$amount" },
                }
            };
            incomeperplan = {
                $group: { _id: "$membershipName", income: { $sum: "$convertedamount" } }
            };
            let incomePerPlan = await paymentmodel.aggregate([
                amounttoint, incomeperplan,
            ])

            console.log(incomePerPlan)
            resolve(incomePerPlan)
        })
    },
    totalRevenue: () => {
        return new Promise(async (resolve, reject) => {

            filterSuccess = {
                $match: {
                    success: true
                }
            }
            amounttoint = {
                $addFields: {
                    convertedamount: { $toInt: "$amount" },
                }
            };
            totalRevenue = {
                $group: { _id: null, income: { $sum: "$convertedamount" } }
            };
            let revenue = await paymentmodel.aggregate([
                filterSuccess,amounttoint, totalRevenue,
            ])

            console.log(revenue)
            resolve(revenue)
        })
    },
    orderCount: () => {

        return new Promise((resolve, reject) => {
            ordermodel.countDocuments({}).then((orderCount) => {
                resolve(orderCount)
            }).catch((err) => { reject(err) })
        })
    },
    userCount: () => {

        return new Promise((resolve, reject) => {



            usermodel.countDocuments({}).then((userCount) => {
                resolve(userCount)
            }).catch((err) => { reject(err) })
        })
    },
    lastWeekRevenue: () => {
        return new Promise(async (resolve, reject) => {

            let lastWdate = formatDate()

            paymentmodel.find({ createdAt: { $gt: `${lastWdate}` }, success: true }).then((lastWeekRevenue) => {
                console.log(lastWeekRevenue)
                resolve(lastWeekRevenue)
            })


            function formatDate() {
                let now = new Date();
                let d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),

                    month = '' + (d.getMonth() + 1),
                    day = '' + d.getDate(),
                    year = d.getFullYear();

                if (month.length < 2)
                    month = '0' + month;
                if (day.length < 2)
                    day = '0' + day;

                return [year, month, day].join('-');
            }
        })
    }




}

module.exports = adminhelper
const mongoose = require('mongoose');
const { resolve, reject } = require('promise');
const { response } = require('../app');
const adminhelper = require('./adminhelper')

const cartmodel = require('../model/cart')
const usermodel = require('../model/users')
const membershipmodel = require('../model/membership')
const addressmodel = require('../model/adress')
const bannermodel = require('../model/banner')
const ordermodel = require('../model/order')
const logmodel = require('../model/orderLog')
const holdingmodel = require('../model/holding')
const paymentmodel = require('../model/payment')
const orderlogmodel = require('../model/orderLog')
const returnmodel = require('../model/retuenRequest')
const wishmodel = require('../model/wishlist')
const Razorpay = require('razorpay');
const crypto = require("crypto");
const  env=require('dotenv').config();

var instance = new Razorpay({
   
    key_id: process.env.razor_pay_key_id,
    key_secret:process.env.razor_pay_key_secret
});

const userhelper = {

    addToCart: (userId, ProductId) => {
        userId = mongoose.Types.ObjectId(userId);
        ProductId = mongoose.Types.ObjectId(ProductId);

        const response = {
            duplicate: false
        }

        return new Promise(async (resolve, reject) => {
            //check if user already have a cart
            let checkCart = await cartmodel.findOne({ userid: userId })
            if (checkCart) {
                //check for duplicate product
                let checkproduct = await cartmodel.findOne({ userid: userId, cartItems: ProductId })
                if (checkproduct) {
                    response.duplicate = true
                    resolve(response)
                    console.log("duplicate")

                } else {
                    cartmodel.updateOne({ userid: userId }, { $push: { cartItems: { "$each":[ProductId ], "$position": 0 }} }).then((data) => {

                        resolve(data)
                    }).catch((err) => {
                        reject(err)
                    })
                }



            } else {

                cart = new cartmodel({
                    userid: userId,
                    cartItems: ProductId
                })
                cart.save().then((data) => {
                    resolve(data)
                }).then((err) => {
                    reject(err)
                })
            }



        })
    },
    showCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
        
           try{
            let cartProduct = await cartmodel.findOne({ userid: userId }).populate('cartItems').lean()
            resolve(cartProduct)
           }catch(err){
            reject(err)
           }
        })
    },
    deleteFromCart: (userId, productId) => {

        return new Promise((resolve, reject) => {
            cartmodel.updateOne({ userid: userId }, { $pull: { cartItems: productId } }).then((data) => {

                resolve(data)
            }).catch((err) => {
                reject(err)
            })
        })

    },
    cartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartProduct = await cartmodel.findOne({ userid: userId }).populate('cartItems');
            var count = 0
            if (cartProduct) {
                count = cartProduct.cartItems.length
            }
            resolve(count)
        })

    }
    ,

    showUser: (userid) => {

        userobjectId = mongoose.Types.ObjectId(userid)
        return new Promise((resolve, reject) => {
            let user = usermodel.findOne({ _id: userobjectId }).populate('membership').lean()
            resolve(user)

        })
    }

    ,
    updateUser: (userData) => {

        const { fullname, mailid, mobnumber, userId } = userData
        console.log(userData)
        userobjectId = mongoose.Types.ObjectId(userId)

        return new Promise(async (resolve, reject) => {
        

            let user = await usermodel.findById(userId)


            if (user.logemail != mailid) {
                var emailexist = await usermodel.findOne({ logemail: mailid })
            }

            if (!emailexist) {
                usermodel.updateOne({ _id: userobjectId },
                    {
                        logname: fullname,
                        logemail: mailid,
                        lognumber: mobnumber
                    }).then((response) => {
                        resolve(response)
                        console.log(response)
                    })
            } else {
                const response = {
                    duplicate: true
                }
                resolve(response)
            }
          

        })
    },
    choosePlan: (userId, planId, renewal) => {
        return new Promise(async (resolve, reject) => {

            let amount;
            adminhelper.showMembershipPlan(planId).then((plan) => {
                if (!renewal) {
                    amount = parseInt(plan.membershipFee) + parseInt(plan.cautionDeposit) + parseInt(plan.registrationFee)
                } else {
                    amount = parseInt(plan.membershipFee)
                }
                let newPayment = new paymentmodel({
                    userid: userId,
                    amount: amount,
                    membership: planId,
                    membershipName:plan.plan

                })

                newPayment.save().then((orderDetails) => {
                    orderDetails.amount = parseInt(orderDetails.amount) * 100  //converting to paisa
                    
                    generateRazorpay(orderDetails).then((order) => {
                        resolve(order)
                    }).catch((err) => {reject(err)});

                })
            })

            //function for generating razorpay order
            function generateRazorpay(orderDetails) {
                return new Promise((resolve, reject) => {
                    var options = {
                        amount: orderDetails.amount,  // amount in the smallest currency unit
                        currency: "INR",
                        receipt: `${orderDetails._id}`
                    };
                    instance.orders.create(options, function (err, order) {
                        resolve(order)
                    });
                })
            }

        })
    },
    verifyPayment: (data, userid) => {
        return new Promise((resolve, reject) => {
            let body = data.order.id + "|" + data.response.razorpay_payment_id;
            var expectedSignature = crypto.createHmac('sha256', instance.key_secret)
                .update(body.toString())
                .digest('hex');
            console.log("sig received ", data.response.razorpay_signature);
            console.log("sig generated ", expectedSignature);


            var response = { signatureIsValid: false }
            if (expectedSignature === data.response.razorpay_signature) {
                response = { signatureIsValid: true }
                response.user = assignPlan(userid, data.order.receipt)

            }
            resolve(response);
        })
        //to find membership id from payment collection orderid is payment collection id
        async function assignPlan(userid, orderid) {
            paymentmodel.findByIdAndUpdate(orderid, { success: true }).then((data) => {

                usermodel.findByIdAndUpdate(userid, {
                    membership: data.membership,
                    membershipstatus: true,
                    membershipdate: new Date().getTime()
                }).then(response => {
                    return (response)
                })

            })


        }

    }
    ,
    addAdress: (userId, adress) => {

        return new Promise((resolve, reject) => {
            newAdress = new addressmodel({
                user: userId,
                fullname: adress.fullname,
                mobile: adress.mobile,
                line1: adress.line1,
                line2: adress.line2,
                pincode: adress.pincode,
                district: adress.district,
                state: adress.state
            })

            newAdress.save().then((response) => {
                resolve(response)
            })
        })

    },
    showAdress: (userId) => {
        return new Promise(async (resolve, reject) => {
            addressmodel.find({ user: userId }).lean().then((useradress) => {
                resolve(useradress)
            }).catch((error) => { reject(error) })
        })
    },
    editAddress: (addressId, adress) => {
        return new Promise((resolve, reject) => {
            addressmodel.findByIdAndUpdate(addressId, {

                fullname: adress.fullname,
                mobile: adress.mobile,
                line1: adress.line1,
                line2: adress.line2,
                pincode: adress.pincode,
                district: adress.district,
                state: adress.state
            }).then((response) => resolve(response)).catch((error) => reject(error))
        })
    },
    deleteAddress: (addressId) => {
        return new Promise((resolve, reject) => {
            addressmodel.findByIdAndDelete(addressId).then((response) => resolve(response)).catch((error) => reject(error))
        })
    },
    showbanner: () => {
        return new Promise((resolve, reject) => {
            bannermodel.find({}).lean().then((banner) => {

                resolve(banner)

            }).catch((error) => reject(error))
        })
    },
    placeOrder: (addressId, userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await userhelper.showCartProducts(userId)
            console.log(cart.cartItems + "hello")

            newOrder = new ordermodel({
                userid: userId,
                adress: addressId,
                product: cart.cartItems,


            })
            newOrder.save().then(async (result) => {


                let holding = await holdingmodel.findOne({ user: userId })
                if (!holding) {
                    let arr = [result.product[0]]
                    let holding = new holdingmodel({
                        user: result.userid,
                        log: arr
                    })
                    holding.save().then((response) => {

                    })
                }
                let log = await logmodel.findOne({ user: result.userid })


                if (!log) {
                    let arr = [result.product[0]]
                    let orderlog = new logmodel({
                        user: result.userid,
                        log: arr
                    })
                    orderlog.save().then((response) => {

                    })
                }


                result.product.forEach((curr) => {

                    holdingmodel.updateOne({ userid: result.userid }, { $push: { log: curr } }).then((response) => {
                        console.log(response)
                    })
                })

                cartmodel.findOneAndDelete({ userid: userId }).then((result) => {

                    resolve(result)
                })
            }).catch((error) => { reject(error) })

        })
    },
    showOrder: (userId) => {
        return new Promise((resolve, reject) => {
            ordermodel.find({ userid: userId }).sort({createdAt: -1}).populate('product').populate('adress').lean().then((orders) => {
                resolve(orders)
            })
        })
    },//checking for adding to cart, it include product just ordered
    checkHolding: (userId, productId) => {
        return new Promise(async (resolve, reject) => {
            holdingmodel.findOne({ user: userId, log: productId }).then((holding) => {
                if (holding) {
                    resolve(true)

                } else {
                    resolve(false)
                }
            })

        })
    },//it include only delivered products
    holdingproducts: (userId) => {
        return new Promise((resolve, reject) => {
            orderlogmodel.findOne({ user: userId }).populate('log.product').lean().then((holdingProducts) => {
                console.log(holdingProducts)
                resolve(holdingProducts)
            }).catch((error) => { reject(error) })
        })

    },

    returnRequest: (returnProduct, userId, addressId) => {
        return new Promise((resolve, reject) => {
            newreturn = new returnmodel({
                user: userId,
                items: returnProduct,
                address: addressId
            })
            newreturn.save().then((response) => {

                orderlogmodel.findOne({ user: userId }).then((orderlog) => {
                    orderlog.log.forEach((curr, index) => {
                        returnProduct.forEach((returned) => {

                            if (returned == curr.product) {
                                console.log(index + "index")
                                orderlog.log[index].returnRequest = true
                            }
                        })
                    })
                    orderlogmodel.findOneAndUpdate({ user: userId }, { log: orderlog.log }).then((response) => {
                        resolve(response)
                    }).catch((error) => { reject(error) })

                }).catch((error) => { reject(error) })


            }).catch((error) => { reject(error) })
        })
    },
    removePlan: (userId) => {
        return new Promise((resolve, reject) => {
            usermodel.findByIdAndUpdate(userId, { membershipstatus: false }).then((response) => {
                resolve(response)
            }).catch((error) => { reject(error) })
        })
    },
    wishlist: (productId, userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let wishlist = await wishmodel.findOne({ userid: userId }).lean()
                if (wishlist) {
                    let wishproduct = await wishmodel.findOne({ userid: userId, wishlist: productId }).lean()
                    if (wishproduct) {
                        wishmodel.findOneAndUpdate({ userid: userId }, { $pull: { wishlist: productId } }).then((data) => {

                            resolve(false)
                        }).catch((err) => { reject(err) });
                    } else {
                        wishmodel.findOneAndUpdate({ userid: userId }, { $push: { wishlist: productId } }).then((data) => {
                            resolve(true)
                        }).catch((err) => { reject(err) });
                    }
                } else {
                    let wish = new wishmodel({
                        userid: userId,
                        wishlist: productId
                    })

                    wish.save().then((data) => {
                        resolve(true)
                    }).catch((error) => { reject(error) })
                }
            }
            catch (err) {
                reject(err)
            }
        })
    },
    showWishlist: (userId) => {
        return new Promise((resolve, reject) => {
            wishmodel.findOne({ userid: userId }).populate('wishlist').lean().then((data) => {
                resolve(data)
            }).catch((err) => { reject(err) });
        })
    },
    isInWishlist: (productId, userId) => {
        return new Promise((resolve, reject) => {
            wishmodel.findOne({ userid: userId, wishlist: productId }).then((data) => {
                resolve(data)
            }).catch((err) => { reject(err) });
        })
    }
    ,
    wishCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            
            wishmodel.findOne({ userid: userId }).then((wishlist) => {
                let wishcount = 0;
                if (wishlist) {
                    wishcount = wishlist.wishlist.length
                    console.log(wishcount,wishlist)
                }
                resolve(wishcount)
            }).catch((err) => { reject(err) })
        })
    }
}





module.exports = userhelper
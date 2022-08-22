var express = require('express');
var router = express.Router();
const otpverify = require('../authentication/otpverify')
const authentication = require('../authentication/authentication');
const { response } = require('../app');
const producthelper = require('../helpers/producthelper');
const userhelper = require('../helpers/userhelper');
const adminhelper = require('../helpers/adminhelper');

//middleware
const verified = (req, res, next) => {
  if (req.session.userlogedin) {
    if (req.session.user.status) {
      next()
    } else {
      res.redirect('/login')
    }

  } else {


    res.redirect('/login')
  }
}


/* GET home page. */
router.get('/', function (req, res, next) {
  let user = req.session.user

  if (user && user.membership) {
    userhelper.showUser(req.session.user._id).then((user) => {
      req.session.user = user
      let endtime = Date.parse(user.membershipdate) + 1000 * 60 * 60 * 24 * 30 * parseInt(user.membership.planDuration)
      const remaining = endtime - Date.parse(new Date());
      let time = remaining / (1000 * 60 * 60 * 24)
      req.session.user.planend = time.toFixed(0)
      console.log(time.toFixed(0))
    })

  }

  producthelper.showAllProduct().then(async (product) => {
    let banner = await userhelper.showbanner()

    res.render('user/homepage', { product, user, userhead: true, banner });
  }).catch((err) => { next(err) })
});

router.get('/productDetails/:id', function (req, res, next) {
  producthelper.showProduct(req.params.id).then((product) => {
    res.render('user/productPage', { product, userhead: true })
  }).catch((error) => {
    res.status(404)
    next(error)
  })
})

router.get('/register', function (req, res, next) {
  req.session.register = true;
  res.redirect('/login');
});

router.get('/login', function (req, res, next) {
  let userlog = { ...req.session }
  req.session.invalid = null;
  req.session.alreadyregistered = null
  req.session.register = null
  req.session.userMobileNotFound = null

  if (!req.session.userlogedin) {
    res.render('user/Login', { userlog });
  } else {
    res.redirect('/')
  }
});

router.post('/usersignup', function (req, res, next) {

  let user = req.body;
  req.session.user = req.body
  authentication.userexist(req.body).then((response) => {
    if (response.alreadyregistered) {
      req.session.alreadyregistered = true
      res.redirect('/register')
    } else {
      otpverify.getotp(req.body.lognumber).then((response) => {
        console.log('otp send');
        res.render('user/otpvalidation', { user })
      })

    }
  }).catch((error) => {
    res.status(404)
    next(error)
  })
});


router.post('/check-otp', function (req, res, next) {

  console.log('check-otp');
  otpverify.checkOtp(req.body.otp, req.body.lognumber).then((data) => {
    console.log(data);
    if (data === 'approved') {

      if (req.session.otpsend) {
        req.session.userlogedin = true
        res.redirect('/')
      } else {
        authentication.dosignup(req.body).then((data) => {
          req.session.user = data
          req.session.userlogedin = true
          res.redirect('/')
        })
      }
    } else {
      res.send('not approved')
    }
  }).catch((error) => {
    res.status(404)
    next(error)
  })

});

router.post('/userlogin', function (req, res, next) {
  console.log('login post');
  authentication.dologin(req.body).then((data) => {
    if (data.valid) {
      if (data.user.status) {
        req.session.userlogedin = true;
        req.session.user = data.user;
        res.redirect('/')
      } else {
        req.session.userlog.blocked = true
        res.redirect('/login')
      }

    } else {
      req.session.invalid = true
      res.redirect('/login')
    }
  }).catch((err) => {
    res.status(404)
    next(err)
  })
})

router.post('/loginwithotp', function (req, res, next) {
  let user = req.body
  authentication.mobileexist(user.lognumber).then((response) => {
    req.session.user = response.user
    if (response.userfound) {
      otpverify.getotp(user.lognumber).then((data) => {
        req.session.otpsend = true
        res.render('user/otpvalidation', { user })
      })
    } else {
      req.session.userMobileNotFound = true;
      res.redirect('/login')
    }
  }).catch((err) => {
    res.status(404)
    next(err)
  })
})

router.get('/logout', function (req, res, next) {
  req.session.destroy();
  res.redirect('/')

})
///cart
//////////////////////////////need to cartmake the code clean
router.get('/add-to-cart/:proid', verified, async function (req, res, next) {
  //check for cart limit

  let cartcount = await userhelper.cartCount(req.session.user._id)
  let user = await userhelper.showUser(req.session.user._id)

  req.session.user = user
  if (user.membership) {
    var perDeliveryLimit = user.membership.perDeliveryLimit
  } else {
    perDeliveryLimit = 5
  }
  userhelper.checkHolding(req.session.user._id, req.params.proid).then((data) => {
    if (!data) {
      if (parseInt(cartcount) < parseInt(perDeliveryLimit)) {
        userhelper.addToCart(req.session.user._id, req.params.proid).then((response) => {
          res.json({ response })
        }).catch((err) => {
          next(err)
        })
      } else {
        let response = { limitExceed: true }
        res.json({ response })
      }
    } else {
      let response = { holding: true }
      res.json({ response })
    }
  }).catch((err) => { next(err) })

})

router.get('/cart-page', verified, function (req, res, next) {
  const userId = req.session.user._id;
  if (req.session.user.planend < 1) {
    userhelper.removePlan(userId).then((response) => {
      console.log(response)
    }).catch((err) => { next(err) })
  }
  userhelper.showCartProducts(userId).then((cart) => {

    res.render('user/cart', { cart, userhead: true, user: req.session.user })
  }).catch((err) => {
    res.status(404)
    next(err)
  })
})

router.get('/remove-from-cart/:id', verified, function (req, res, next) {
  const productId = req.params.id
  const userId = req.session.user._id;
  userhelper.deleteFromCart(userId, productId).then((cart) => {
    res.redirect('/cart-page')
  }).catch((err) => {
    res.status(404)
    next(err)
  })



})

router.get('/cart-count', verified, function (req, res, next) {

  userhelper.cartCount(req.session.user._id).then((count) => {
    res.json({ count })
  }).catch((err) => { next(err) })
})
//membership plan////////////////////////////////////

router.get('/membership', verified, function (req, res, next) {
  adminhelper.showMembershipPlans().then(async (membershipPlans) => {
    let user = await userhelper.showUser(req.session.user._id)
    let time = req.session.user.planend
    req.session.user = user
    res.render('user/membershipPlan', { userhead: true, user, membershipPlans, time })
  }).catch((err) => {
    next(err)
  })
})

router.get('/choosePlan/:planId', verified, function (req, res, next) {
  userhelper.choosePlan(req.session.user._id, req.params.planId, req.session.user.membership)
    .then((order) => {
      console.log(order)
      res.render('user/paymentPage', { order })
    }).catch((err) => {
      next(err)
    })

})

router.post('/checkPayment', verified, function (req, res, next) {
  console.log(req.body)
  userhelper.verifyPayment(req.body, req.session.user._id).then((response) => {
    res.json({ response })
  }).catch((err) => { next(err) })

})

//my account

router.get('/my-account', verified, function (req, res, next) {
  let userid = req.session.user._id
  let duplicate = req.session.duplicate
  req.session.duplicate = null
  userhelper.showUser(userid).then((user) => {
    req.session.user = user
    res.render('user/myAccount', { user, userhead: true, profile: true, duplicate })
  }).catch((err) => { next(err) })

})

router.post('/update-user', verified, function (req, res, next) {
  userhelper.updateUser(req.body).then((response) => {
    if (response.duplicate) { req.session.duplicate = true }
    res.redirect('/my-account');

  }).catch((err) => { next(err) })
})


//adress management
router.get('/userAddress', verified, function (req, res, next) {
  let user = req.session.user
  userhelper.showAdress(req.session.user._id).then((adress) => {
    res.render('user/address', { userhead: true, profile: true, adress, user })
  }).catch((err) => { next(err) })

})

router.post('/add-adress', verified, function (req, res, next) {

  userhelper.addAdress(req.session.user._id, req.body).then((response) => {

    res.redirect('/userAddress')
  }).catch((err) => { next(err) })
})

router.post('/edit-adress/:id', verified, function (req, res, next) {
  let adressId = req.params.id
  userhelper.editAddress(adressId, req.body).then((response) => {
    res.redirect('/userAddress')
  }).catch((err) => { next(err) })
})

router.get('/deleteAdress/:id', verified, function (req, res, next) {
  addressId = req.params.id
  userhelper.deleteAddress(addressId).then((response) => {
    res.redirect('/userAddress')
  }).catch((err) => { next(err) })
})

//order management

router.get('/checkout', verified, function (req, res, next) {
  if (req.session.user.membershipstatus) {
    userhelper.showAdress(req.session.user._id).then((adress) => {
      userhelper.showCartProducts(req.session.user._id).then((cart) => {
        res.render('user/placeOrder', { adress, cart, userhead: true })
      })

    }).catch((err) => { next(err) })
  } else {
    res.redirect('/membership')
  }
})

router.post('/placeOrder', verified, function (req, res, next) {
  console.log(req.body.addressId + "addressId")
  userhelper.placeOrder(req.body.addressId, req.session.user._id).then((response) => {
    res.redirect('/')
  }).catch((err) => { next(err) })
})

router.get('/showOrders', verified, function (req, res, next) {
  let user = req.session.user
  userhelper.showOrder(req.session.user._id).then((order) => {
    console.log(order)
    res.render('user/orderDetails', { userhead: true, profile: true, order, user })
  }).catch((err) => { next(err) })
})

//return book

router.get('/return', verified, function (req, res, next) {
  let user = req.session.user
  userhelper.showAdress(req.session.user._id).then((adress) => {
    userhelper.holdingproducts(req.session.user._id).then((holding) => {
      res.render('user/return', { adress, holding, userhead: true, user, profile: true })
    })
  }).catch((err) => { next(err) })
})

router.post('/return', verified, function (req, res, next) {
  let arr = Object.values(req.body)
  let returnProducts = arr.slice(1)
  console.log(returnProducts + "return products")

  userhelper.returnRequest(returnProducts, req.session.user._id, arr[0]).then((response) => {
    res.redirect('/')
  }).catch((err) => { next(err) })
})

/////////////wish list //////////////////////////////////
//add or remove to wish list
router.get('/wishlist/:id', verified, function (req, res, next) {

  userhelper.wishlist(req.params.id, req.session.user._id).then((response) => {
    console.log(response)
    res.json({ response })
  }).catch((err) => { next(err) })
})

router.get('/wish', verified, function (req, res, next) {
  userhelper.showWishlist(req.session.user._id).then((response) => {

    res.render('user/wishlist', { userhead: true, response })
  })
})

router.get('/isInWishlist/:id', verified, function (req, res, next) {
 
  userhelper.isInWishlist(req.params.id, req.session.user._id).then((response) => {

    res.json({ response })
  })
})

router.get('/wish-count', verified, function (req, res, next) {

  userhelper.wishCount(req.session.user._id).then((wishcount) => {
    res.json({ wishcount })
  }).catch((err) => { next(err) })
})
module.exports = router;

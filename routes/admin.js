var express = require('express');
const { response } = require('../app');
const adminauthentication = require('../authentication/adminauthentication');
const otpverify = require('../authentication/otpverify');
const adminhelper = require('../helpers/adminhelper');
const producthelper = require('../helpers/producthelper');
const userhelper = require('../helpers/userhelper');


var router = express.Router();


const verify = (req, res, next) => {
  if (req.session.adminlogedin) {
    next()
  } else {
    res.redirect('/admin/login')
  }
}

/* GET users listing. */
router.get('/', verify, function (req, res, next) {
  res.render('admin/home', { admin: true })
});

router.get('/stats', verify, function (req, res, next) {
  res.render('admin/home', { admin: true })
});

router.get('/incomePerPlan', verify, function (req, res, next) {
  adminhelper.incomePerPlan().then((incomeperplan) => {
    res.json({ incomeperplan })
  })
})

router.get('/login', function (req, res, next) {
  if (req.session.adminlogedin) { res.redirect('/admin') }
  res.render('admin/login', { session: req.session })
});

router.post('/login', function (req, res) {
  adminauthentication.adminlogin(req.body).then((data) => {
    if (data.adminvalid) {
      console.log('succesfully loginedin');
      req.session.admin = data.admin;
      req.session.adminlogedin = true;
      res.redirect('/admin')
    } else {
      req.session.invalid = true;
      res.redirect('/admin/login')
    }
  }).catch((err) => { err.admin=true;next(err) })

})
router.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('/admin/login')
})

router.post('/loginwithotp', function (req, res) {
  adminnumber = req.body.adminnumber

  adminauthentication.mobileexist(adminnumber).then((response) => {

    if (response.adminfound) {
      req.session.admin = response.admin;
      otpverify.getotp(adminnumber).then((data) => {
        res.render('admin/verifyotp', { adminnumber })
      })
    } else {
      req.session.wrongMobileNumber = true
      res.redirect('/admin/login')

    }

  }).catch((err) => { err.admin=true;next(err) })

})
router.post('/check-otp', function (req, res) {
  let { otp, adminnumber } = req.body

  otpverify.checkOtp(otp, adminnumber).then((data) => {
    if (data === 'approved') {
      req.session.adminlogedin = true
      res.redirect('/admin')
    }
  }).catch((err) => { err.admin=true;next(err) })
})

//product
router.get('/product-page', verify, function (req, res, next) {
  producthelper.showAllProduct().then((products) => {

    res.render('admin/product', { products, admin: true })
  }).catch((err) => { err.admin=true;next(err) })

});

router.get('/add-newproduct', verify, function (req, res, next) {
  producthelper.showCatagory().then((catagories) => {

    res.render('admin/addNewProduct', { catagories, admin: true })
  }).catch((err) => { err.admin=true;next(err) })

});

router.post('/add-product', verify, function (req, res, next) {
  producthelper.addProduct(req.body).then((id) => {
    console.log(id);
    if (req.files) {
      if (req.files.image1) {
        req.files.image1.mv('public/images/product-image/' + id + '1.jpg', (err, done) => {
          if (err) { console.log(err) }
        })
      }
      if (req.files.image2) {
        req.files.image2.mv('public/images/product-image/' + id + '2.jpg', (err, done) => {
          if (err) { console.log(err) }
        })
      }

      if (req.files.image3) {
        req.files.image3.mv('public/images/product-image/' + id + '3.jpg', (err, done) => {
          if (err) { console.log(err) }
        })
      }
    }
    res.redirect('/admin/add-newproduct')
  }).catch((err) => { err.admin=true;next(err) })
});


router.get('/deleteProduct/:id', verify, function (req, res, next) {

  let prodectId = req.params.id
  console.log(prodectId)
  producthelper.deleteProduct(prodectId).then((response) => {
    res.redirect('/admin/product-page')
  }).catch((err) => { err.admin=true;next(err) })
})


router.get('/prodectUpdatePage/:id', verify, function (req, res, next) {

  let prodectId = req.params.id
  producthelper.showProduct(prodectId).then((product) => {
    producthelper.showCatagory().then((catagories) => {
      res.render('admin/updateProduct', { admin: true, product, catagories })
    })

  }).catch((err) => {
    err.admin=true;next(err)
  })



})

router.post('/updateProduct/:id', verify, function (req, res, next) {
  try {
    let prodectId = req.params.id
    producthelper.updateProduct(prodectId, req.body).then((response) => {
      if (req.files) {

        if (req.files.image1) {
          req.files.image1.mv('public/images/product-image/' + prodectId + '1.jpg', (err, done) => {
            if (err) { console.log(err) }
          })
        }

        if (req.files.image2) {
          req.files.image2.mv('public/images/product-image/' + prodectId + '2.jpg', (err, done) => {
            if (err) { console.log(err) }
          })
        }

        if (req.files.image3) {
          req.files.image3.mv('public/images/product-image/' + prodectId + '3.jpg', (err, done) => {
            if (err) { console.log(err) }
          })
        }
      }



      res.redirect('/admin/product-page')
    })
  }
  catch (err) {
    err.admin=true;next(err)
  }


})


router.get('/prodectDetails/:id', verify, function (req, res, next) {
  producthelper.showProduct(req.params.id).then((product) => {
    res.render('admin/singleProduct', { admin: true, product })
  }).catch((err) => { err.admin=true;next(err) })
})


//catagory management

router.get('/catogory-mangement', verify, function (req, res, next) {

  let updateErr = req.session.duplicateCatagory
  let AddErr = req.session.CatagoryExist

  req.session.duplicateCatagory = null
  req.session.CatagoryExist = null

  producthelper.showCatagory().then((data) => {

    res.render('admin/catagoryManagement', { data, admin: true, updateErr, AddErr })
  }).catch((err) => { err.admin=true;next(err) })

});

router.post('/add-catagory', verify, function (req, res, next) {
  producthelper.addCatagory(req.body).then((response) => {
    if (response) {
      res.redirect('/admin/catogory-mangement')
    } else {
      req.session.CatagoryExist = 'This catagory alredy exist';
      res.redirect('/admin/catogory-mangement')
    }
  }).catch((err) => { err.admin=true;next(err) })
});

router.post('/add-subcatagory', verify, function (req, res, next) {
  producthelper.addSubCatagory(req.body).then((response) => {

    res.redirect('/admin/catogory-mangement')
  }).catch((err) => { err.admin=true;next(err) })
});

router.get('/show-subCatagory/:id', function (req, res, next) {

  try {
    let id = req.params.id

    producthelper.ShowSubCatagory(id).then((data) => {
console.log(data)
      res.json({ data })

    })
  }
  catch (err) {
    err.admin=true;next(err)
  }

});

router.post('/editCatogory/:id', verify, function (req, res, next) {

  try {
    producthelper.editCatagory(req.params.id, req.body).then((response) => {
      if (response) {
        res.redirect('/admin/catogory-mangement')
      } else {
        req.session.duplicateCatagory = 'This catagory alredy exist';
        res.redirect('/admin/catogory-mangement')
      }
    })
  }
  catch (err) {
    err.admin=true;next(err)
  }
})


//user management
router.get('/user-management', verify, function (req, res, next) {

  adminhelper.showAllUsers().then((users) => {
    console.log(users);
    res.render('admin/user-management', { users, admin: true })
  }).catch((err) => { err.admin=true;next(err) })

})

router.get('/view-user/:id', verify, function (req, res, next) {
  try {
    userId = req.params.id

    userhelper.showUser(userId).then((user) => {
      userhelper.holdingproducts(userId).then((orderlog) => {
        res.render('admin/view-user', { user, admin: true, orderlog })
      })

    })
  }
  catch (err) {
    err.admin=true;next(err)
  }

})

router.get('/blockUser/:id', verify, function (req, res, next) {
  try {
    let userId = req.params.id
    adminhelper.blockUser(userId).then(() => {
      res.redirect('/admin/view-user/' + userId)
    })
  }
  catch (err) {
    err.admin=true;next(err)
  }
})

router.get('/UnblockUser/:id', verify, function (req, res, next) {
  try {
    let userId = req.params.id
    adminhelper.UnblockUser(userId).then(() => { res.redirect('/admin/view-user/' + userId) })
  }
  catch (err) {
    err.admin=true;next(err)
  }
})

//Membership management


router.get('/membershipManagement', verify, function (req, res, next) {
  adminhelper.showMembershipPlans().then((membershipPlans) => {
    res.render('admin/membershipManagement', { admin: true, membershipPlans })

  }).catch((err) => { err.admin=true;next(err) })
})



router.post('/addNewPlan', verify, function (req, res, next) {
  adminhelper.membership(req.body).then((response) => {
    console.log(response)
    res.redirect('/admin/membershipManagement')
  }).catch((err) => { err.admin=true;next(err) })

})

router.get('/editPlan/:id', verify, function (req, res, next) {
  adminhelper.showMembershipPlan(req.params.id).then((membershipPlan) => {
    res.render('admin/editPlan', { admin: true, membershipPlan })
  }).catch((error) => {
    res.status(404)
    err.admin=true;next(err)
  })

})

router.post('/updatePlan/:id', verify, function (req, res, next) {
  adminhelper.updatePlandetails(req.params.id, req.body).then((response) => {
    console.log(response)
    res.redirect('/admin/membershipManagement')
  }).catch((error) => {
    res.status(404)
    err.admin=true;next(err)
  })

})

router.get('/deletePlan/:id', verify, function (req, res, next) {
  try {
    adminhelper.deletePlan(req.params.id).then((data) => {
      res.redirect('/admin/membershipManagement')
    }).catch((err) => { err.admin=true;next(err) })
  }
  catch (err) {
    err.admin=true;next(err)
  }
})

//banner mangement

router.get('/banner', verify, function (req, res, next) {
  userhelper.showbanner().then((banner) => {
    res.render('admin/banner', { admin: true, banner })
  }).catch((err) => { err.admin=true;next(err) })

})

router.post('/addbanner', verify, function (req, res, next) {
  adminhelper.addbanner(req.body.banner).then((id) => {
    if (req.files.image) {
      req.files.image.mv('public/images/banner-image/' + id + '.jpg', (err, done) => {
        if (err) { console.log(err) }
        res.redirect('/admin/banner')
      })
    }
  })
})

router.get('/deleteBanner/:id', verify, function (req, res, next) {
  try {
    adminhelper.deleteBanner(req.params.id).then((response) => {
      res.redirect('/admin/banner')
    })
  }
  catch (err) {
    err.admin=true;next(err)
  }
})

//orders management
router.get('/order', verify, function (req, res, next) {

  adminhelper.showOrders().then((orders) => {
    res.render('admin/orderManagement', { orders, admin: true })
  }).catch((err) => { err.admin=true;next(err) })

})

router.get('/delivered/:id', verify, function (req, res, next) {
  try {
    adminhelper.delivered(req.params.id).then((response) => {
      res.json({ response })
    })
  }
  catch (err) {
    err.admin=true;next(err)
  }
})

router.get('/shiped/:id', verify, function (req, res, next) {
  try {
    adminhelper.shiped(req.params.id).then((response) => {
      res.json({ response })
    })
  }
  catch (err) {
    err.admin=true;next(err)
  }
})

router.get('/return', verify, function (req, res, next) {
  adminhelper.returnRequests().then((request) => {
    res.render('admin/returnManagement', { admin: true, request })
  }).catch((err) => { err.admin=true;next(err) })

})

router.post('/returned/:id', verify, function (req, res, next) {
  try {
    adminhelper.returned(req.params.id).then((response) => {
      res.json({ response })
    })
  }
  catch (err) {
    err.admin=true;next(err)
  }

})

/////////////////////////////payments
router.get('/payments', verify, function (req, res, next) {
  adminhelper.paymentDetails().then((payment) => {
    res.render('admin/viewPayment', { admin: true, payment })
  }).catch((err) => { err.admin=true;next(err) })
})





//////chart////////////////////////////////////////////////////////////////
router.get('/paymentChart', verify, function (req, res, next) {
  adminhelper.paymentDetails().then((payment) => {
    res.json({ payment })
  })
})

router.get('/ordertChart', verify, function (req, res, next) {
  adminhelper.showOrders().then((orders) => {

    adminhelper.returnRequests().then((request) => {
      res.json({ orders, request })
    }).catch((err) => { err.admin=true;next(err) })

  }).catch((err) => { err.admin=true;next(err) })

})

//// admin dashbord

router.get('/orderCount', verify, function (req, res, next) {
  adminhelper.orderCount().then((orderCount) => {
    res.json({ orderCount })
  })
})

router.get('/userCount', verify, function (req, res, next) {
  adminhelper.userCount().then((userCount) => {
    res.json({ userCount })
  })
})


router.get('/revenue', verify, function (req, res, next) {
  adminhelper.totalRevenue().then((revenue) => {
    res.json({ revenue })
  })
})

router.get('/lastWeekRevenue', verify, function (req, res, next) {
  adminhelper.lastWeekRevenue().then((lastWeekOrder) => {
    res.json({ lastWeekOrder })
  })
})

router.use((req,res,next)=>{
  let err = {}
  err.admin = true
  next(err)
})

module.exports = router;

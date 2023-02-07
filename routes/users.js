var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helpers')
var userHelper = require('../helpers/user-helpers')

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', async function (req, res) {

  let user = req.session.user //checking user loggned or not 
  // console.log(user);
  let cartCount = null
  if (user) {
    cartCount = await userHelper.getCartCount(req.session.user._id)
  }
  productHelper.getAllProducts().then((products) => {
    // console.log(products);
    res.render('user/view-products', { user, products, admin: false, cartCount })
  })
});

router.get('/login', (req, res) => {
  if (req.session.loggedIn === true) {
    res.redirect('/')
  } else {
    res.render('user/login', { "loginErr": req.session.logginErr })
    req.session.logginErr = false
  }
})

router.get('/signup', (req, res) => {
  res.render('user/signup')
})

router.post('/signup', (req, res) => {
  userHelper.doSignup(req.body).then((response) => {
    // console.log(response);
    req.session.loggedIn = true
    req.session.user = response.user
    res.redirect('/')
  })
})

router.post('/login', (req, res) => {
  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect('/')
    } else {
      req.session.logginErr = "Invalid user name or password"
      res.redirect('/login')
    }
  })
})

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/')
})

router.get('/cart', verifyLogin, async (req, res) => {
  let products = await userHelper.getCartProducts(req.session.user._id)
  // console.log(products);
  res.render('user/cart', { products, user: req.session.user })
})

router.get('/add-to-cart/:id', (req, res) => {
  // console.log('api call.....');
  let id = req.params.id
  userHelper.addToCart(id, req.session.user._id).then(() => {
    res.json({status:true})
  })
})



module.exports = router;

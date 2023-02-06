var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helpers')
var userHelper = require('../helpers/user-helpers')

const verifyLogin = (req, res,next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', function (req, res) {

  let user = req.session.user //checking user loggned or not 
  // console.log(user);
  productHelper.getAllProducts().then((products) => {
    // console.log(products);
    res.render('user/view-products', { user, products, admin: false })
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

router.get('/cart',verifyLogin, async(req, res) => {
  let products =await  userHelper.getCartProducts(req.session.user._id)
  console.log(products);
  res.render('user/cart')
})

router.get('/add-to-cart',verifyLogin,(req,res)=>{
  let id = req.query.id
  userHelper.addToCart(id,req.session.user._id).then(()=>{
    res.redirect('/')
  })
})



module.exports = router;

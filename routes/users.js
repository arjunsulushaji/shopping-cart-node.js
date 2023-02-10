const { response } = require('express');
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
  let total = await userHelper.getTotalAmount(req.session.user._id)
  // console.log(products);
  res.render('user/cart', { products, 'user': req.session.user, total })
})

router.get('/add-to-cart/:id', (req, res) => {
  // console.log('api call.....');
  let id = req.params.id
  userHelper.addToCart(id, req.session.user._id).then(() => {
    res.json({ status: true })
  })
})

router.post('/change-product-quantity', (req, res) => {
  // console.log(req.body);
  userHelper.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelper.getTotalAmount(req.body.user)
    res.json(response)
  })
})

router.post('/remove-cart-item', (req, res) => {
  // console.log(req.body)
  userHelper.removeCartItem(req.body).then((response) => {
    res.json(response)
  })
})

router.get('/place-order', verifyLogin, async (req, res) => {
  let total = await userHelper.getTotalAmount(req.session.user._id)
  res.render('user/order', { total, user: req.session.user });
})

router.post('/place-order', async (req, res) => {
  // console.log(req.body);
  let products = await userHelper.getCartProdList(req.body.userid)
  let totalPrice = await userHelper.getTotalAmount(req.body.userid)
  await userHelper.placeOrder(req.body, products, totalPrice).then((orderId) => {
    // console.log(response);
    if (req.body['payment'] === 'cod') {
      res.json({ codsuccess: true })
    } else {
      userHelper.generateRazorpay(orderId,totalPrice).then((response)=>{
        res.json(response)
      })
    }
  })
})

router.get('/order-success', (req, res) => {
  res.render('user/order-success', { user: req.session.user })
})

router.get('/orders', async (req, res) => {
  let orders = await userHelper.getAllOrders(req.session.user._id)
  // console.log(orders);
  res.render('user/orders', { orders })
})

router.post('/verify-payment',(req,res)=>{
  console.log(req.body);
})


module.exports = router;

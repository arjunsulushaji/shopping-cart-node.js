const { response } = require('express');
var express = require('express');
var router = express.Router();

var productHelper = require('../helpers/product-helpers')

/* GET users listing. */
router.get('/', function (req, res, next) {
  productHelper.getAllProducts().then((products) => {
    // console.log(products);
    res.render('admin/view-products', { products, admin: true })
  })
});

router.get('/add-products', (req, res) => {
  res.render('admin/add-products')
})

router.post('/add-products', (req, res) => {
  // console.log(req.body);
  productHelper.addProduct(req.body, (id) => {
    let image = req.files.productImage
    image.mv('./public/product-images/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.render('admin/add-products')
      } else {
        console.log(err);
      }
    })
  })
})

router.get('/delete-product/', (req, res) => {
  let proId = req.query.id
  // console.log(proId);
  productHelper.deleteProduct(proId).then((response) => {
    res.redirect('/admin')
  })
})

router.get('/edit-products', async (req, res) => {
  let product = await productHelper.getProductDetails(req.query.id)
  console.log(product);
  res.render('admin/edit-products', { product })
})

router.post('/edit-products', async (req, res) => {
  let id = req.query.id
  await productHelper.updateProduct(req.query.id, req.body).then((response) => {
    res.redirect('/admin')
    if (req.files.productImage) {
      let image = req.files.productImage
      image.mv('./public/product-images/' + id + '.jpg')
    }
  })
})

router.get('/view-orders',async(req,res)=>{
  let allOrders = await productHelper.getAllOrders('placed')
  // console.log(allOrders);
  res.render('admin/view-orders',{allOrders})
})

router.get('/ship-order',(req,res)=>{
  // console.log(req.query.id);
  productHelper.changeOrderStatus(req.query.id).then((response)=>{
    res.redirect('/admin/view-orders')
  })
})

module.exports = router;

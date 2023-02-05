var express = require('express');
var router = express.Router();

var productHelper = require('../helpers/product-helpers')

/* GET users listing. */
router.get('/', function (req, res, next) {
  productHelper.getAllProducts().then((products)=>{
    // console.log(products);
    res.render('admin/view-products', {products, admin: true })
  })
});

router.get('/add-products', (req, res) => {
  res.render('admin/add-products')
})

router.post('/add-products', (req, res) => {
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

module.exports = router;

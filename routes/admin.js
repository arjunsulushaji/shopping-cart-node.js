var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {

  let products = [
    {
      name : "Iphone 11",
      category : "mobile",
      description : "This is a good phone",
      image : "https://www.apple.com/v/iphone-14-pro/c/images/meta/iphone-14-pro_overview__e414c54gtu6a_og.png?202302030110"
    },{
      name : "Iphone 12",
      category : "mobile",
      description : "This is a good phone",
      image : "https://www.apple.com/v/iphone-14-pro/c/images/meta/iphone-14-pro_overview__e414c54gtu6a_og.png?202302030110"
    },{
      name : "Iphone 13",
      category : "mobile",
      description : "This is a good phone",
      image : "https://www.apple.com/v/iphone-14-pro/c/images/meta/iphone-14-pro_overview__e414c54gtu6a_og.png?202302030110"
    },{
      name : "Iphone 14",
      category : "mobile",
      description : "This is a good phone",
      image : "https://www.apple.com/v/iphone-14-pro/c/images/meta/iphone-14-pro_overview__e414c54gtu6a_og.png?202302030110"
    }
  ]

  res.render('admin/view-products',{products,admin : true})
});

router.get('/add-products',(req,res)=>{
  res.render('admin/add-products')
})

router.post('/add-products',(req,res)=>{
  console.log(req.body);
  console.log(req.files.productImage);
})

module.exports = router;

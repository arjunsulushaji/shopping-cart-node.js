var db = require('../config/connection')
var collection = require('../config/collections')

const bcrypt = require('bcrypt')
const { use } = require('../routes/users')

var ObjectId = require('mongodb').ObjectId

module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            userPassword = userData.userPassword.toString()
            userData.userPassword = await bcrypt.hash(userPassword, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                // console.log(userData);
                response.user = userData
                response.status = true
                resolve(response)
            })
        })
    },

    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ userEmail: userData.userEmail })
            if (user) {
                bcrypt.compare(userData.userPassword, user.userPassword).then((status) => {
                    if (status) {
                        console.log('login success..');
                        // console.log(user);
                        response.user = user
                        response.status = true
                        resolve(response)
                    }
                    else {
                        console.log('login failed');
                        resolve({ status: false })
                    }
                })
            } else {
                console.log('user login failed');
                resolve({ status: false })
            }
        })
    },

    addToCart: (proId, userId) => {
        let proObj = {
            items: ObjectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.items == proId)
                // console.log(proExist); //if 0 return true -1 return false
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ 'products.items': ObjectId(proId) }, {
                        $inc: { 'products.$.quantity': 1 }
                    }).then(() => {
                        resolve()
                    })
                } else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectId(userId) },
                        {
                            $push: { products: proObj }
                        }).then((response) => {
                            resolve(response)
                        })
                }
            } else {
                let cartObj = {
                    user: ObjectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve(response)
                })
            }
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(userId) }
                }, 
                {
                    $unwind:'$products'
                },{
                    $project:{
                        items:'$products.items',
                        quantity:'$products.quantity'
                    }
                },{
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'items',
                        foreignField:'_id',
                        as:'products'
                    }
                }
                // {
                //     $lookup: {
                //         from: collection.PRODUCT_COLLECTION,
                //         let: { proList: '$products' },
                //         pipeline: [
                //             {
                //                 $match: {
                //                     $expr: {
                //                         $in: ['$_id', '$$proList']
                //                     }
                //                 }
                //             }
                //         ],
                //         as: 'cartItems'
                //     }
                // }
            ]).toArray()
            // console.log(cartItems[0].products);
            resolve(cartItems)
        })
    },

    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    }
}
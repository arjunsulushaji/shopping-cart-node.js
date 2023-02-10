var db = require('../config/connection')
var collection = require('../config/collections')

const bcrypt = require('bcrypt')
const { use } = require('../routes/users')
const { response } = require('express')

const Razorpay = require('razorpay');
var instance = new Razorpay({
    key_id: 'rzp_test_uT0wiliLFjy3w2',
    key_secret: 'Ucsj7vHYlOJUTXn0d779X2Yq',
});

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
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectId(userId), 'products.items': ObjectId(proId) }, {
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
                    $unwind: '$products'
                }, {
                    $project: {
                        items: '$products.items',
                        quantity: '$products.quantity'
                    }
                }, {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'items',
                        foreignField: '_id',
                        as: 'products'
                    }
                }, {
                    $project: {
                        items: 1,
                        quantity: 1,
                        products: { $arrayElemAt: ['$products', 0] }

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
    },

    changeProductQuantity: (details) => {
        count = parseInt(details.count)
        quantity = parseInt(details.quantity)
        // console.log(count);
        // console.log(quantity);
        return new Promise((resolve, reject) => {
            if (count == -1 && quantity == 1) {
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(details.cart) }, {
                    $pull: { products: { items: ObjectId(details.product) } }
                }).then((response) => {
                    resolve({ removeProduct: true })
                })
            } else {
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(details.cart), 'products.items': ObjectId(details.product) }, {
                    $inc: { 'products.$.quantity': count }
                }).then((response) => {
                    // console.log(response);
                    resolve({ status: true })
                })
            }
        })
    },

    removeCartItem: (details) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(details.cartId) }, {
                $pull: { products: { items: ObjectId(details.proId) } }
            }).then((response) => {
                resolve(true)
            })
        })
    },

    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                }, {
                    $project: {
                        items: '$products.items',
                        quantity: '$products.quantity'
                    }
                }, {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'items',
                        foreignField: '_id',
                        as: 'products'
                    }
                }, {
                    $project: {
                        items: 1,
                        quantity: 1,
                        products: { $arrayElemAt: ['$products', 0] }

                    }
                }, {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$products.productAmount'] } }
                    }
                }
            ]).toArray()
            // console.log(total);
            resolve(total[0].total)
        })
    },

    placeOrder: (order, products, total) => {
        const date = new Date()
        return new Promise((resolve, reject) => {
            let status = order.payment === 'cod' ? 'placed' : 'pending'
            let orderObj = {
                deliveryDetails: {
                    mobile: order.mobileNumber,
                    address: order.address,
                    pincode: order.pincode
                },
                userId: ObjectId(order.userid),
                paymentMethod: order.payment,
                products: products,
                totalAmount: total,
                status: status,
                date: date
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: ObjectId(order.userid) })
                resolve(response.insertedId._id)
            })
        })
    },

    getCartProdList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            resolve(cart.products)
        })
    },

    getAllOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: ObjectId(userId) }).toArray()
            resolve(orders)
        })
    },

    generateRazorpay: (orderId, totalPrice) => {
        return new Promise((resolve, reject) => {

            instance.orders.create({
                amount: totalPrice,
                currency: "INR",
                receipt: ""+orderId,
                notes: {
                    key1: "value3",
                    key2: "value2"
                }
            }, (err, order) => {
                console.log("new order", order);
                resolve(order)
            })
        })
    }
}
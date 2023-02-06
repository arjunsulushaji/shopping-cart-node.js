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

    addToCart:(proId,userId)=>{
        return new Promise(async(resolve,reject)=>{
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
            if(userCart){
                db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(userId)},{
                        $push:{products:ObjectId(proId)}
                }).then((response)=>{
                    resolve(response)
                })
            } else {
                let cartObj = {
                    user : ObjectId(userId),
                    products:[ObjectId(proId)]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve(response)
                })
            }
        })
    },
    getCartProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:ObjectId(userId)}
                },{
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        let :{proList:'$products'},
                        pipeline:[
                            {
                                $match:{
                                    $expr:{
                                        $in:['$_id','$$proList']
                                    }
                                }
                            }
                        ],
                        as:'cartItems'
                    }
                }
            ]).toArray()
            resolve(cartItems[0].cartItems)
        })
    }
}
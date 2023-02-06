var db = require('../config/connection')
var collection = require('../config/collections')
const { response } = require('express')
var ObjectId = require('mongodb').ObjectId

module.exports = {
    addProduct: (product, callback) => {
        // console.log(product);
        db.get().collection('product').insertOne(product).then((data) => {
            // console.log(data);
            callback(data.insertedId)
        })
    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: ObjectId(proId) }).then((response) => {
                // console.log(response);
                resolve(response)
            })
        })
    },
    getProductDetails: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(proId) }).then((product) => {
                resolve(product)
            })
        })
    },
    updateProduct: (proId, proDetails) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(proId) }, {
                $set: {
                    productName: proDetails.productName,
                    productCategory: proDetails.productCategory,
                    productAmount: proDetails.productAmount,
                    productDescription: proDetails.productDescription
                }
            }).then(() => {
                resolve(response)
            })
        })
    }
}
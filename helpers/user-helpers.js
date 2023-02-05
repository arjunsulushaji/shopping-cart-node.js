var db = require('../config/connection')
var collection = require('../config/collections')

const bcrypt = require('bcrypt')
const { use } = require('../routes/users')

module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userPassword = userData.userPassword.toString()
            userData.userPassword = await bcrypt.hash(userPassword, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve(data.insertedId)
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
                        response.user = user
                        response.status = true
                        resolve(response)
                    }
                    else {
                        console.log('login failed');
                        resolve({status:false})
                    }
                })
            } else {
                console.log('user login failed');
                resolve({status:false})
            }
        })
    }
}
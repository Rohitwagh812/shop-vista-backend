const mongoose = require('mongoose')


const orderSchema = new mongoose.Schema({
    userId:{
        type: String,
        require : true
    },
    productId: {
        type: String,
        require : true
    },
    discount: {
    type: Number,
    require : true
    }
})


module.exports = mongoose.model('orderDone' , orderSchema)
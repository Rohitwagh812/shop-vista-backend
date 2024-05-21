
const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email :{
        type: String,
        required: true,
        unique: true
    },
    password :{
        type: String,
        required: true
    },
})


const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    discount: {
        type: String,
        required: true
    }
    // rating: {
    //     rate: {
    //         type: Number,
    //         required: true,
    //     },
    //     count: {
    //         type: Number,
    //         required: true,
    //     },
    // }
}, { _id: { type: String, maxlength: 3 } });


module.exports = {
    seller : mongoose.model('seller', sellerSchema),
    product : mongoose.model('product' , productSchema)
}
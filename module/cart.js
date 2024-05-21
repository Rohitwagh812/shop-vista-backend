const mongoose = require('mongoose')

const cartItemSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
    productId: {
      type:String,
      ref: 'Product', 
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    image:{
        type:String
    },
    title:{
        type:String,
        required: true
    },
    category: {
        type: String,
        required: true,
    }

  });
  
  module.exports = mongoose.model('UserCartProduct', cartItemSchema);
const express = require('express')

const Products = express.Router();


const { seller, product } = require('../module/seller');
const order = require('../module/order');

Products.get('/prod', async (req, res) => {
  res.json({ message: "hello dear seller add your new product " })
})


Products.post('/newprod', async (req, res) => {
  try {
    const { title, description, price, discount, category, image } = req.body;

    const existingProduct = await product.findOne({ title, description, price, discount, category, image });

    if (existingProduct) {
      return res.status(400).json({ message: 'A similar product already exists' });
    }

    const newProd = new product({
      title,
      description,
      price: price / 84,
      discount,
      category,
      image
    });

    const savedProd = await newProd.save();

    res.status(201).json({ message: 'Product created successfully', data: savedProd });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


Products.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await product.findByIdAndDelete(id);
    res.status(200).json({ message: 'Product deleted successfully', data: product });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting product' });
  }
});

Products.patch('/products/:id', async (req, res) => {
    try {
        const productId = req.params.id; // Extract ID from URL parameters
        const updates = req.body; // Extract new data from request body

        const updatedProduct = await product.findByIdAndUpdate(productId, updates, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ message: "No product found with the specified ID." });
        }
        
        res.status(200).json({ message: 'Product updated successfully', data: updatedProduct });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// app.delete('/delete/allcartproducts/:userId', async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     const result = await UserCartProduct.deleteMany({ userId: userId });
//     if (result.deletedCount === 0) {
//       return res.status(404).json({ message: "No cart products found" });
//     }
//     res.json({ message: 'All cart products deleted successfully', count: result.deletedCount });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// }); 


module.exports = Products
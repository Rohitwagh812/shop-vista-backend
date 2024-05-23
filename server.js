const express =  require('express');

const app = express();

const cors = require('cors');

const bodyParser = require('body-parser');

const cookieParser = require('cookie-parser');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

app.use(express.json());

app.use(bodyParser.urlencoded({extended: true}));
// app.use(bodyParser.json({limit: "30mb", extended: true}));
// app.use(bodyParser.urlencoded({limit: "30mb", extended: true}));

app.use(cookieParser());

const cilent = require('./module/cilent')

const { seller , product } = require('./module/seller')

app.set('view engine', 'ejs');

const UserCartProduct = require('./module/cart')


const uri = 'mongodb+srv://rohitwagh0801:SDf9nkEQ813UFZLU@cluster0.whprgnv.mongodb.net/?retryWrites=true&w=majority'

require('dotenv').config();

// const auth = require('connect-auth')
//  app.use(express.createServer());
const session = require("express-session");
app.use(session({
    secret: process.env.JWT_SECRET_KEY,
    resave: false,
    saveUninitialized: false
}));
// db connect to server

const Order = require('./module/order')

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)

const db = mongoose.connection;

db.once('open', async()=>{
    console.log('db connecton succsufully')
})

db.on('error' , (error)=>{
    console.log(error)
})
 
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true 
}));


// app.use(cors({
//   // origin: 'https://shop-vista-six.vercel.app',
//   origin: 'http://localhost:5173',
//   credentials: true  
// }));

const verifyUser = (req , res ,next) =>{
    const token =  req.cookies.token;
    if(!token){
        return res.json("The token was not availabe")
    } else{
        jwt.verify(token , process.env.JWT_SECRET_KEY, (err , decoded) =>{
            if(err) return res.json("Token is wrong")
            next()
        // if(decoded){
        //     res.json(decoded)
        // }
         })
    }

    
}


app.get('/home' , verifyUser , (req , res)=>{
      res.json("Success")
 })
 
// check current user in login 

app.get('/current', (req, res) => {
    // Access token from cookies
    const token = req.cookies.token;
  
    if (!token) {
      res.status(401).json({ message: 'No token provided' });
    }
  
    try { 
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); 
     res.json(decoded) 
      const userData = decoded.user;  
      res.json(userData);
    } catch (error) { 
     res.status(401).json({ message: 'Invalid token' });
    }
  });


app.get('/' , (req , res)=>{
    res.status(200).json({magesse :'pple ka chue'})
});


// user new account create and signup

app.post('/signup', async (req, res) => {
   const {name , email , password} = req.body

   bcrypt.hash(password , 10).then(hash =>{
    cilent.create({name , email , password : hash})
    .then(client => res.json(client))
    .catch(err => res.json(err))
   }).catch(err => console.log(err.message))
}); 


// user signin

   app.post('/signin', async (req, res)=>{
    const { email , password } = req.body;
    cilent.findOne({email : email})
    .then(user =>{
       if(user) {
        bcrypt.compare(password , user.password , (err , response) => {
            if(response){
                const token = jwt.sign({name:user.name, email: user.email, password: user.password ,id: user._id }, process.env.JWT_SECRET_KEY , {expiresIn:"2h"})
                res.cookie('token' , token , {maxAge: 2*60*60*1000} , { httpOnly: true, secure: true, sameSite: 'none' })
                res.json("Success")
            } else{
                res.json("the password is incorrect")
            }
        }) 
       } else{
        res.json("no record existed")
       }
    })
});

// app.post('/signin', async (req, res) => {
//   // Your signin logic
//   const token = 'your_generated_token'; // Example token
//   res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' }); // Example of setting a cookie
//   res.json({ message: 'Signin successful' });
// });




// user has be logout 
app.post('/logout', (req, res) => {
    // Clear session/token or perform any necessary logout actions
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: "Error logging out" });
        }
        res.clearCookie('token'); // Clear any session cookies
        res.status(200).json({ message: "Logged out successfully" });
    });
});


//  user account delete 

app.delete('/cilent', async (req, res) => {
    try {
        const result = await cilent.deleteMany({});
        console.log(`${result.deletedCount} documents deleted`);
        res.status(200).json({ message: `${result.deletedCount} documents deleted` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// user get all products in user display  


app.get('/products' , async (req , res) =>{
    try{
        const products = await product.find()
        res.json(products)
    } catch(err){
     res.status(500).json({error : err.magesse})
    }
})

//  user get all products categorys 

app.get('/products/:category', async (req, res) => {
    try {
      const category = req.params.category;
      const products = await product.find({ category: category }); 

    if (!products || products.length === 0) {
        return res.status(404).json({ message: "No products found for the specified category." });
    }
    res.json({ data: products });


    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  });

  app.get('/products/all/:id', async (req, res) => {
    try {
        const productId = req.params.id; // Use req.params.id to get the ID from the URL parameter
        const products = await product.findById(productId); 

        if (!product) {
             res.status(404).json({ message: "No product found with the specified ID." });
        }
        res.status(201).json({ data: products });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});



//  add to cart products 

app.post('/product/cart', async (req, res) => {
  try { 
    const { userId, productId, quantity, price, image, title, category } = req.body; 
    const existingCartItem = await UserCartProduct.findOne({ userId, productId });

    if (existingCartItem) { 
      existingCartItem.quantity += quantity;
      existingCartItem.price += price; 
      const savedCartItem = await existingCartItem.save(); 
      return res.json(savedCartItem);
    } else { 
      const cartItem = new UserCartProduct({
        userId:userId,
        productId:productId,
        quantity:quantity, 
        price:price,
        image:image,
        title:title,
        category:category
      });
 
      const savedCartItem = await cartItem.save(); 
      res.json(savedCartItem);
    }
  } catch (error) { 
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


//  user all cart products view cart page 

app.get('/product/cart/:userId', async (req, res) => {
  try { 
    const userId = req.params.userId;
 
    const userCartItems = await UserCartProduct.find({ userId});
 
    return res.json({ data: userCartItems});
  } catch (error) { 
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// sall products deleted in user cart products 

app.delete('/delete/allcartproducts/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await UserCartProduct.deleteMany({ userId: userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No cart products found" });
    }
    res.json({ message: 'All cart products deleted successfully', count: result.deletedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}); 


// single product delete in user cart products 

app.delete('/delete/single/product/:id' , async (req , res) =>{
  try{

     const deleteSingleProduct = await UserCartProduct.findByIdAndDelete(req.params.id)
     if(!deleteSingleProduct){
      return res.status(404).json({message: 'product not found'})
     } 
     res.json({ message: 'product deleted', data: deleteSingleProduct })

  } catch (err){
    res.status(404).json({message : err.message})
  }
})

// order done data


app.post('/order/product', async (req , res , next) =>{

  try{
      const { userId, productId , discount } = req.body;

      const newOrder = new Order ({
        userId: userId,
        productId:productId, 
        discount:discount
      })

      const saveOrder = await newOrder.save()

      res.status(201).json({ message: 'Order placed successfully', data: saveOrder })
  } catch (err){
    res.status(505).json({ message: 'Internal server error' });
  }
// next()
})



// app.get('/order/product/:userId', async (req, res) => {
//   // const userId = req.params.userId; // Use req.params.id to access the user ID from the URL parameter

//   try {
//     const order = await Order.findById(req.body.userId); // Assuming Order is your Mongoose model

//     if (!order) {
//       res.status(404).json({ message: 'Order not found', data: order });
//     } else {
//       res.status(200).json({ data: order });
//     }

    
//   } catch (err) {
//     console.error(err);
//     res.status(404).send({ message: 'Internal server error' });
//   }
// });

app.get('/order/product/:userId', async (req, res) => {
  const userId = req.params.userId;  

  try { 
    const orders = await Order.find({ userId });  

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    } else {

      const orderDetails = orders.map(order => { 
        const productIds = order.productId.split(',').map(id => id.trim());
        const uniqueProductIds = [...new Set(productIds)];  
        const chosenProductIds = uniqueProductIds.slice(0, 2);
        return {
          productIds: chosenProductIds,
          discount: order.discount 
        };
      });

      return res.status(200).json({ data: orderDetails  });
    }
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});





// const router = require('./router/user')
// app.use('/cilent' , router)// 
const sellers = require('./router/seller')
app.use('/seller' , sellers)

const Products = require('./router/product')
app.use('/product', Products) 
 

app.listen(3000)
    console.log('server start')
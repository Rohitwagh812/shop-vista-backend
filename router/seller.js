const express = require('express');

const sellers = express.Router();

const { seller , products } = require('../module/seller');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

require('dotenv').config(); 

sellers.get('/name' ,( req , res )=>{

    res.status(200).json({message : ' hello dear seller '})
})


// signup in mongodb database 

sellers.post('/signup' , async (req , res) =>{
    
    const { name , email , password } = req.body;

    bcrypt.hash(password , 10).then(hash =>{
        seller.create({name , email , password : hash})
        .then(seller => res.json(seller))
        .catch(err =>res.json(err) )
    }).catch(err => console.log(err.message))

} )
 

sellers.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const Seller = await seller.findOne({ email: email });

        if (seller) {
            bcrypt.compare(password, Seller.password, (err, response) => {
                if (response) {
                    const tokentwo = jwt.sign({ name: Seller.name, email:Seller.email, id: Seller._id }, process.env.JWT_SECRET_KEYA, { expiresIn: "2h" })
                    res.cookie('tokenTwo', tokentwo, { maxAge: 2 * 60 * 60 * 1000 })
                    res.json({ message: "Success" , data: Seller})
                } else {
                    res.json("The password is incorrect")
                }
            })
        } else {
            console.log("No record found for email:", email);
            res.json("No record exists")
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json("Internal Server Error");
    }
})


// app.post('/signin', async (req, res)=>{
//     const { email , password } = req.body;
//     cilent.findOne({email : email})
//     .then(user =>{
//        if(user) {
//         bcrypt.compare(password , user.password , (err , response) => {
//             if(response){
//                 const token = jwt.sign({name:user.name, email: user.email, password: user.password ,id: user._id }, process.env.JWT_SECRET_KEY , {expiresIn:"2h"})
//                 res.cookie('token' , token , {maxAge: 2*60*60*1000})
//                 res.json("Success")
//             } else{
//                 res.json("the password is incorrect")
//             }
//         }) 
//        } else{
//         res.json("no record existed")
//        }
//     })
// });

sellers.post('/logout', (req, res) => {
    // Clear session/token or perform any necessary logout actions
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: "Error logging out" });
        }
        res.clearCookie('token'); // Clear any session cookies
        res.status(200).json({ message: "Logged out successfully" });
    });
});

module.exports = sellers 
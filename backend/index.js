const port =4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors =require("cors");
const { log } = require("console");
const { type } = require("os");

app.use(express.json());
app.use(cors());

// Database Connection With MongoDB
mongoose.connect("mongodb+srv://almasansari:Shameem%409211@cluster0.vr1ra.mongodb.net/e-commerce");

// API Creation

app.get("/",(req,res)=>{
    res.send("Express App is Running")
})

// Image Storage Engine
const storage =multer.diskStorage({
    destination:'./upload/images',
    filename:(req,file,cb)=>{
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})



const upload = multer({storage:storage})

// Creating Upload Endpoint For Images
app.use('/images',express.static('upload/images'))
app.post("/upload",upload.single('product'),(req,res)=>{
    res.json({
        success:1,
        image_url:`http://localhost:${port}/images/${req.file.filename}`
    })
})

// Schema for Creating Products
const Product = mongoose.model("product",{
    id:{
        type:Number,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    new_price:{
        type:Number,
        required:true,
    },
    old_price:{
        type:Number,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    availabe:{
        type:Boolean,
        default:true,
    },
})

app.post("/addproduct", async(req,res) => {
    let products = await Product.find({});
    let id;
    if(products.length > 0){
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id+1;
    }
    else{
        id = 1;    
    }
        const newProduct = new Product({
            id:id,
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
        });
        
        console.log(newProduct);
        await newProduct.save();
        console.log("Saved");
        
        res.json({
            success: true,
            name: req.body.name,
        });
    
});

//Create API for Deleting Products
app.post('/removeproduct',async(req,res)=>{
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success:true,
        name:req.body.name
    });
    
})

// Create API for Getting All Products
app.get('/allproducts',async(req,res)=>{
    let products = await Product.find({});
    console.log("ALL Products Fetched");
   res.send(products);
});

// Shema creating for user model

const users = mongoose.model('Users',{
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now,
    }   
})

//Creating Endpoints for User Registration the user

app.post('/signup', async(req,res) => {
    try {
        // Changed UserActivation to users model
        let check = await users.findOne({email: req.body.email});
        if(check) {
            return res.status(400).json({success: false, message: "Email Already Exists"});
        }

        let cart = {};
        for (let i = 0; i < 300; i++) {
            cart[i] = 0;
        }

        // Changed username to name to match the request body

        const user = new users({
            name: req.body.name,  
            email: req.body.email,
            password: req.body.password,
            cartData: cart,
        });
    
        await user.save();

        const data = {
            user: {
                id: user.id
            }
        }
        
        const token = jwt.sign(data, 'secret_ecom');
        res.json({
            success: true,
            token
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
});

// Creating endpoint for user login (separate from signup)
app.post('/login', async(req,res) => {
    try {
        let user = await users.findOne({email: req.body.email});
        if(user) {
            const passCompare = req.body.password === user.password;
            if(passCompare) {
                const data = {
                    user: {
                        id: user.id
                    }
                }
                const token = jwt.sign(data, 'secret_ecom');
                res.json({
                    success: true,
                    token
                });
            } else {
                res.json({
                    success: false,
                    message: "Password is Incorrect"
                });
            }
        } else {
            res.json({
                success: false,
                message: "User Not Found"
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
});

// Creating endpoint for NewColelction Data
app.get('/newcollections',async(req,res)=>{
    let products = await Product.find({});
    let newCollection = products.slice(1).slice(-8);
    console.log("New Collection Fetched");
    res.send(newCollection);
    
})

// Creating endpoint for popular in women section

app.get('/popularinwomen',async(req,res)=>{
    let products = await Product.find({ category: "women" }); 
    let popular_in_women = products.slice(0, 4);
    console.log("Popular in women fetched:", popular_in_women); 
    res.json(popular_in_women); 
})

// Creating Middleware to fetch User
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
      return res.status(401).send({ errors: "Please authenticate using a valid token" });
    }
    try {
      const data = jwt.verify(token, 'secret_ecom');
      req.user = data.user;
      next();
    } catch (error) {
      return res.status(401).send({ errors: "Please authenticate using a valid token" });
    }
  }

// creating endpoint for adding products in cartdata
app.post('/addtocart', fetchUser, async (req, res) => {
    console.log("added,req.body.itemId");
    let userData = await users.findOne({ _id: req.user.id });
    userData.cartData[req.body.itemId] += 1;
    await users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    res.send("Added");
  });

// Creating endpoint to remove products from cartdata
app.post('/removefromcart', fetchUser, async (req, res) => {
    console.log("removed,req.body.itemId");
    let userData = await users.findOne({ _id: req.user.id });
    if (userData.cartData[req.body.itemId]>0)
    userData.cartData[req.body.itemId] -= 1;
    await users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    res.send("Removed");

});

// creating  endpoint to get cartdata
app.post('/getcart', fetchUser, async (req, res) => {
    console.log("GetCart");
    let userData = await users.findOne({ _id: req.user.id });
    res.json(userData.cartData);
});

app.listen(port,(error)=>{
    if(!error){
        console.log("Server Running on Port "+port)
    }
    else{
        console.log("Error :"+error);
    }
})

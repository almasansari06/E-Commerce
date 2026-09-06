require("dotenv").config();
const fs = require('fs');

const port =4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
mongoose.set('bufferCommands', false);
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors =require("cors");
const { log } = require("console");
const { type } = require("os");

app.use(express.json());
app.use(cors());

const adminEmail = process.env.ADMIN_EMAIL;
let adminPassword = process.env.ADMIN_PASSWORD;
const adminJwtSecret = process.env.ADMIN_JWT_SECRET || 'shopper_admin_secret';

// Database Connection With MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .catch((error) => console.error("MongoDB connection failed:", error.message));

// API Creation

app.get("/",(req,res)=>{
    res.send("Express App is Running")
})

app.post('/admin/login', (req, res) => {
    if (req.body.email !== adminEmail || req.body.password !== adminPassword) {
        return res.status(401).json({ success: false, message: 'Invalid admin email or password.' });
    }
    const token = jwt.sign({ email: adminEmail, role: 'admin' }, adminJwtSecret, { expiresIn: '8h' });
    res.json({ success: true, token });
});

const adminAuth = (req, res, next) => {
    const token = req.header('admin-token');
    try {
        const data = jwt.verify(token, adminJwtSecret);
        if (data.role !== 'admin') throw new Error('Invalid role');
        req.admin = data;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Admin authentication required.' });
    }
};

// Image Storage Engine
const storage =multer.diskStorage({
    destination:'./upload/images',
    filename:(req,file,cb)=>{
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})



const upload = multer({storage:storage, limits: { files: 10 }})

// Creating Upload Endpoint For Images
app.use('/images',express.static('upload/images'))
app.post("/upload",upload.array('products', 10),(req,res)=>{
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'At least one image is required.' });
    }
    res.json({
        success:1,
        image_urls: req.files.map((file) => `http://localhost:${port}/images/${file.filename}`),
        image_url: `http://localhost:${port}/images/${req.files[0].filename}`,
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
        type:[String],
        required:true,
    },
    description:{
        type:String,
        default:'',
    },
    productType:{
        type:String,
        default:'clothing',
    },
    availableSizes:{
        type:[String],
        default:[],
    },
    reviews:{
        type:[{
            userId: String,
            name: String,
            rating: Number,
            comment: String,
            date: { type: Date, default: Date.now },
        }],
        default:[],
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
    displayOrder:{
        type:Number,
        default:0,
    },
    isNewCollection:{
        type:Boolean,
        default:false,
    },
})

const isDatabaseConnected = () => mongoose.connection.readyState === 1;

app.post("/addproduct", async(req,res) => {
    if (!isDatabaseConnected()) {
        return res.status(503).json({ success: false, message: 'Database is unavailable. Product was not saved.' });
    }
    try {
        const products = await Product.find({}).sort({ displayOrder: 1, date: -1 });
        const id = products.length > 0 ? products[products.length - 1].id + 1 : 1;
        const newProduct = new Product({
            id:id,
            name: req.body.name,
            image: req.body.image,
            description: req.body.description,
            productType: req.body.productType,
            availableSizes: Array.isArray(req.body.availableSizes) ? req.body.availableSizes : [],
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
            isNewCollection: Boolean(req.body.isNewCollection),
        });
        
        await newProduct.save();
        console.log("Saved");
        res.json({
            success: true,
            name: req.body.name,
        });
    } catch (error) {
        console.error('Add product failed:', error.message);
        res.status(500).json({ success: false, message: 'Unable to save product.' });
    }
});

//Create API for Deleting Products
app.post('/removeproduct',async(req,res)=>{
    if (!isDatabaseConnected()) {
        return res.status(503).json({ success: false, message: 'Database is unavailable.' });
    }
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success:true,
        name:req.body.name
    });
    
})

// Create API for Getting All Products
app.get('/allproducts',async(req,res)=>{
    if (!isDatabaseConnected()) {
        return res.json([]);
    }
    try {
        const products = await Product.find({}).sort({ displayOrder: 1, date: -1 });
        console.log("ALL Products Fetched");
        res.send(products);
    } catch (error) {
        console.error('All products unavailable:', error.message);
        res.json([]);
    }
});

app.put('/updateproduct', async (req, res) => {
    if (!isDatabaseConnected()) {
        return res.status(503).json({ success: false, message: 'Database is unavailable.' });
    }

    try {
        const { id, name, image, category, new_price, old_price, description, productType, availableSizes, isNewCollection } = req.body;
        const product = await Product.findOneAndUpdate(
            { id: Number(id) },
            { name, image, category, description, productType, availableSizes, isNewCollection: Boolean(isNewCollection), new_price: Number(new_price), old_price: Number(old_price) },
            { new: true, runValidators: true },
        );
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }
        res.json({ success: true, product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
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
    status:{
        type:String,
        default:'active',
    },
    date:{
        type:Date,
        default:Date.now,
    }   
})

const Order = mongoose.model('Order', {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    items: {
        type: Array,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    address: {
        type: Object,
        required: true,
    },
    paymentMethod: {
        type: String,
        default: 'cod',
    },
    status: {
        type: String,
        default: 'Order Placed',
    },
    cancellationReason: {
        type: String,
        default: '',
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const Coupon = mongoose.model('Coupon', {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountPercentage: { type: Number, required: true, min: 1, max: 100 },
    isActive: { type: Boolean, default: true },
    date: { type: Date, default: Date.now },
});

const ProductType = mongoose.model('ProductType', {
    name: { type: String, required: true, unique: true, trim: true },
    date: { type: Date, default: Date.now },
});

app.post('/coupons/validate', async (req, res) => {
    if (!isDatabaseConnected()) return res.status(503).json({ success: false, message: 'Database is unavailable.' });
    try {
        const code = String(req.body.code || '').trim().toUpperCase();
        const coupon = await Coupon.findOne({ code, isActive: true });
        if (!coupon) return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code.' });
        res.json({ success: true, code: coupon.code, discountPercentage: coupon.discountPercentage });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Unable to validate coupon.' });
    }
});

const localProductTypesFile = path.join(__dirname, 'product-types.json');
const readLocalProductTypes = () => {
    try {
        return JSON.parse(fs.readFileSync(localProductTypesFile, 'utf8'));
    } catch (error) {
        return [];
    }
};
const writeLocalProductTypes = (productTypes) => fs.writeFileSync(localProductTypesFile, JSON.stringify(productTypes, null, 2));

app.get('/product-types', async (req, res) => {
    if (!isDatabaseConnected()) return res.json(readLocalProductTypes());
    try {
        const types = await ProductType.find({}).sort({ name: 1 });
        res.json(types);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Unable to load product types.' });
    }
});

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
    if (!isDatabaseConnected()) {
        return res.json([]);
    }
    try {
        const newCollection = await Product.find({ isNewCollection: true }).sort({ date: -1 }).limit(10);
        console.log("New Collection Fetched");
        res.send(newCollection);
    } catch (error) {
        console.error('New collection unavailable:', error.message);
        res.json([]);
    }
    
})

// Creating endpoint for popular in women section

app.get('/popularinwomen',async(req,res)=>{
    if (!isDatabaseConnected()) {
        return res.json([]);
    }
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
    res.json({ success: true, message: "Added" });
  });

// Creating endpoint to remove products from cartdata
app.post('/removefromcart', fetchUser, async (req, res) => {
    console.log("removed,req.body.itemId");
    let userData = await users.findOne({ _id: req.user.id });
    if (userData.cartData[req.body.itemId]>0)
    userData.cartData[req.body.itemId] -= 1;
    await users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    res.json({ success: true, message: "Removed" });

});

// creating  endpoint to get cartdata
app.post('/getcart', fetchUser, async (req, res) => {
    console.log("GetCart");
    if (!isDatabaseConnected()) {
        return res.json({});
    }
    let userData = await users.findOne({ _id: req.user.id });
    res.json(userData.cartData);
});

app.post('/products/:productId/reviews', fetchUser, async (req, res) => {
    if (!isDatabaseConnected()) return res.status(503).json({ success: false, message: 'Database is unavailable.' });
    const rating = Number(req.body.rating);
    const comment = String(req.body.comment || '').trim();
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment) {
        return res.status(400).json({ success: false, message: 'A rating from 1 to 5 and a review are required.' });
    }

    const product = await Product.findOne({ id: Number(req.params.productId) });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    const alreadyReviewed = product.reviews.some((review) => review.userId === String(req.user.id));
    if (alreadyReviewed) return res.status(409).json({ success: false, message: 'You have already reviewed this product.' });

    product.reviews.push({ userId: String(req.user.id), name: 'Customer', rating, comment });
    await product.save();
    res.status(201).json({ success: true, review: product.reviews[product.reviews.length - 1] });
});

// Create and retrieve authenticated customer orders
app.post('/orders', fetchUser, async (req, res) => {
    if (!isDatabaseConnected()) {
        return res.status(503).json({ success: false, message: 'Database is unavailable.' });
    }

    try {
        const { items, amount, address, paymentMethod } = req.body;
        if (!Array.isArray(items) || items.length === 0 || !address || !amount) {
            return res.status(400).json({ success: false, message: 'Order details are incomplete.' });
        }

        const order = await Order.create({
            userId: req.user.id,
            items,
            amount,
            address,
            paymentMethod: paymentMethod || 'cod',
        });

        const userData = await users.findById(req.user.id).select('cartData');
        const updatedCart = { ...(userData?.cartData || {}) };
        items.forEach((item) => {
            if (item.id !== undefined) updatedCart[item.id] = 0;
        });
        await users.findByIdAndUpdate(req.user.id, { cartData: updatedCart });

        res.status(201).json({ success: true, order });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ success: false, message: 'Unable to place order.' });
    }
});

app.get('/orders', fetchUser, async (req, res) => {
    if (!isDatabaseConnected()) {
        return res.status(503).json({ success: false, message: 'Database is unavailable.' });
    }

    try {
        const orders = await Order.find({ userId: req.user.id }).sort({ date: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        console.error('Order retrieval error:', error);
        res.status(500).json({ success: false, message: 'Unable to retrieve orders.' });
    }
});

app.use('/admin', adminAuth);

app.patch('/admin/password', (req, res) => {
    if (!req.body.currentPassword || req.body.currentPassword !== adminPassword) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }
    if (!req.body.newPassword || req.body.newPassword.length < 8) {
        return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    }
    adminPassword = req.body.newPassword;
    res.json({ success: true, message: 'Admin password changed successfully.' });
});

app.get('/admin/orders', async (req, res) => {
    if (!isDatabaseConnected()) {
        return res.status(503).json({ success: false, message: 'Database is unavailable.' });
    }

    try {
        const orders = await Order.find({}).sort({ date: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Unable to retrieve orders.' });
    }
});

app.patch('/admin/orders/:orderId/status', async (req, res) => {
    if (!isDatabaseConnected()) {
        return res.status(503).json({ success: false, message: 'Database is unavailable.' });
    }

    const allowedStatuses = ['Order Placed', 'Packing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!allowedStatuses.includes(req.body.status)) {
        return res.status(400).json({ success: false, message: 'Invalid order status.' });
    }

    try {
        const status = req.body.status;
        const order = await Order.findByIdAndUpdate(
            req.params.orderId,
            {
                status,
                cancellationReason: status === 'Cancelled'
                    ? 'Due to technical issue, your order has been cancelled.'
                    : '',
            },
            { new: true },
        );
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }
        res.json({ success: true, order });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Invalid order ID.' });
    }
});

app.get('/admin/cancelled-orders', async (req, res) => {
    if (!isDatabaseConnected()) return res.status(503).json({ success: false, message: 'Database is unavailable.' });
    const orders = await Order.find({ status: 'Cancelled' }).sort({ date: -1 });
    res.json({ success: true, orders });
});

app.get('/admin/users', async (req, res) => {
    if (!isDatabaseConnected()) return res.status(503).json({ success: false, message: 'Database is unavailable.' });
    const allUsers = await users.find({}, { password: 0 }).sort({ date: -1 });
    res.json({ success: true, users: allUsers });
});

app.patch('/admin/users/:userId/status', async (req, res) => {
    if (!['active', 'disabled'].includes(req.body.status)) {
        return res.status(400).json({ success: false, message: 'Invalid user status.' });
    }
    const user = await users.findByIdAndUpdate(req.params.userId, { status: req.body.status }, { new: true, projection: { password: 0 } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
});

app.delete('/admin/users/:userId', async (req, res) => {
    const user = await users.findByIdAndDelete(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true });
});

app.get('/admin/coupons', async (req, res) => {
    if (!isDatabaseConnected()) return res.status(503).json({ success: false, message: 'Database is unavailable.' });
    const coupons = await Coupon.find({}).sort({ date: -1 });
    res.json({ success: true, coupons });
});

app.post('/admin/coupons', async (req, res) => {
    if (!isDatabaseConnected()) return res.status(503).json({ success: false, message: 'Database is unavailable.' });
    try {
        const coupon = await Coupon.create({
            code: req.body.code,
            discountPercentage: Number(req.body.discountPercentage),
        });
        res.status(201).json({ success: true, coupon });
    } catch (error) {
        res.status(400).json({ success: false, message: error.code === 11000 ? 'Coupon already exists.' : error.message });
    }
});

app.patch('/admin/coupons/:couponId/toggle', async (req, res) => {
    const coupon = await Coupon.findById(req.params.couponId);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found.' });
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.json({ success: true, coupon });
});

app.delete('/admin/coupons/:couponId', async (req, res) => {
    const coupon = await Coupon.findByIdAndDelete(req.params.couponId);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found.' });
    res.json({ success: true });
});

app.post('/admin/shuffle', async (req, res) => {
    if (!isDatabaseConnected()) return res.status(503).json({ success: false, message: 'Database is unavailable.' });
    const products = await Product.find({});
    const operations = products.map((product, index) => ({
        updateOne: {
            filter: { _id: product._id },
            update: { displayOrder: Math.random() + index },
        },
    })).sort(() => Math.random() - 0.5);
    if (operations.length) await Product.bulkWrite(operations);
    res.json({ success: true, message: 'Products shuffled successfully.' });
});

app.get('/admin/product-types', async (req, res) => {
    if (!isDatabaseConnected()) return res.json({ success: true, productTypes: readLocalProductTypes(), storage: 'local' });
    try {
        const types = await ProductType.find({}).sort({ name: 1 });
        res.json({ success: true, productTypes: types });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Unable to load product types.' });
    }
});

app.post('/admin/product-types', async (req, res) => {
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ success: false, message: 'Product type name is required.' });
    if (!isDatabaseConnected()) {
        const productTypes = readLocalProductTypes();
        if (productTypes.some((productType) => productType.name.toLowerCase() === name.toLowerCase())) {
            return res.status(400).json({ success: false, message: 'Product type already exists.' });
        }
        const productType = { _id: `local-${Date.now()}`, name, date: new Date() };
        productTypes.push(productType);
        writeLocalProductTypes(productTypes);
        return res.status(201).json({ success: true, productType, storage: 'local' });
    }
    try {
        const productType = await ProductType.create({ name });
        res.status(201).json({ success: true, productType });
    } catch (error) {
        res.status(400).json({ success: false, message: error.code === 11000 ? 'Product type already exists.' : error.message });
    }
});

app.patch('/admin/product-types/:typeId', async (req, res) => {
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ success: false, message: 'Product type name is required.' });
    if (!isDatabaseConnected()) {
        const productTypes = readLocalProductTypes();
        const index = productTypes.findIndex((productType) => productType._id === req.params.typeId);
        if (index === -1) return res.status(404).json({ success: false, message: 'Product type not found.' });
        if (productTypes.some((productType, productIndex) => productIndex !== index && productType.name.toLowerCase() === name.toLowerCase())) {
            return res.status(400).json({ success: false, message: 'Product type already exists.' });
        }
        productTypes[index] = { ...productTypes[index], name };
        writeLocalProductTypes(productTypes);
        return res.json({ success: true, productType: productTypes[index], storage: 'local' });
    }
    try {
        const productType = await ProductType.findByIdAndUpdate(req.params.typeId, { name }, { new: true, runValidators: true });
        if (!productType) return res.status(404).json({ success: false, message: 'Product type not found.' });
        res.json({ success: true, productType });
    } catch (error) {
        res.status(400).json({ success: false, message: error.code === 11000 ? 'Product type already exists.' : error.message });
    }
});

app.delete('/admin/product-types/:typeId', async (req, res) => {
    if (!isDatabaseConnected()) {
        const productTypes = readLocalProductTypes();
        const remaining = productTypes.filter((productType) => productType._id !== req.params.typeId);
        if (remaining.length === productTypes.length) return res.status(404).json({ success: false, message: 'Product type not found.' });
        writeLocalProductTypes(remaining);
        return res.json({ success: true, storage: 'local' });
    }
    try {
        const productType = await ProductType.findByIdAndDelete(req.params.typeId);
        if (!productType) return res.status(404).json({ success: false, message: 'Product type not found.' });
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Unable to delete product type.' });
    }
});

if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
    app.listen(port, (error) => {
        if (!error) console.log("Server Running on Port " + port);
        else console.log("Error :" + error);
    });
}

module.exports = app;

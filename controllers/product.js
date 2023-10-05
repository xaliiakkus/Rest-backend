const Product = require('../models/product');
const ProductFilter = require('../utils/productFilter');
const cloudinary = require('cloudinary').v2;


const adminProduct = async (req, res, next) => {
    const products = await Product.find(); 

    res.status(200).json({
        products
    })
}


const allProducts = async (req, res) => {
    const resultPerPage = 10;
    const productFilter = new ProductFilter(Product.find(), req.query).search().filter().pagination(resultPerPage)
    const products = await productFilter.query;
    const productCount = await Product.countDocuments();
    res.status(200).json({
        products,
        productCount
    })
}
const detailProducts = async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.status(200).json({
        product
    })
}
const createProducts = async (req, res,next) => {
    let images = [];
    const product = await Product.create(req.body);
    if (typeof req.body.images === "string") {
        images.push(req.body.images)
    } else {
        images = req.body.images;
    }
    let allImages = [];
    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.uploader.upload(images[i], {
            folder: "products"
        });
        allImages.push({
            public_id: result.public_id,
            url: result.secure_url
        })
    }
    req.body.images = allImages
    res.status(200).json({
        product
    })
}
const deleteProducts = async (req, res,next) => {
    const product = await Product.findById(req.params.id);
    for (let i = 0; i < product.images.length; i++) {
        await cloudinary.uploader.destroy(product.images[i].public_id);

    }
    await product.remove();
    res.status(200).json({
        message: 'Ürün Silindi'
    })
}
const updateProducts = async (req, res,next) => {
    const product = await Product.findById(req.params.id);
    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true  , runValidators:true});
    let images = [];
    if (typeof req.body.images === "string") {
        images.push(req.body.images)
    } else {
        images = req.body.images;
    }

    if (images !==undefined) {
        await cloudinary.uploader.destroy(product.images[i].public_id);

    }
    let allImages = [];
    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.uploader.upload(images[i], {
            folder: "products"
        });
        allImages.push({
            public_id: result.public_id,
            url: result.secure_url
        })
    }
    req.body.images = allImages
    req.body.user = req.user.id
    res.status(201).json({
        product
    })
}
const createReviews = async (req, res, next) =>{
    const { productId, comment, rating } = req.body
    const review = {
        user: req.user._id,
        name: req.user._id,
        comment,
        rating: Number(rating)
    }
    const product = await Product.findById(productId);
    product.reviews.push(review)
    let avg = 0; 
    product.rewievs.forEach(rev => {
        avg += avg.rating
    })
    product.rating = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false })
    res.status(200).json({
        message:'Yorumunuz Başarıla eklendi ... '
    })
}

module.exports = {
    allProducts, detailProducts,
    createProducts, deleteProducts, updateProducts,
    createReviews,adminProduct
};
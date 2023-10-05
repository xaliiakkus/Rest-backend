const express = require('express')
const { allProducts, detailProducts, createProducts, deleteProducts, updateProducts,createReviews,adminProduct } = require('../controllers/product.js')
const { authorizationMid, roleChecked } = require('../middleware/auth.js')

const router = express.Router()

router.get('/products', allProducts)
router.get('/admin/products', adminProduct, authorizationMid, roleChecked("admin"), adminProduct)
router.get('/products/:id', detailProducts)
router.post('/products/new', createProducts )
router.delete('/products/:id',authorizationMid,  roleChecked("admin"),deleteProducts)
router.patch('/products/:id',authorizationMid,  roleChecked("admin"), updateProducts)
router.post('/reviews/newReview', createReviews)


module.exports = router
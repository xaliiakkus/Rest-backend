const mongoose = require('mongoose');



const ProductSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref:'User',
        require:true,
    },
    name: {
        type: String,
        required: true,
        trim:true
    },
    description: {
        type: String,
        required: true,
        trim:true
    },
    price: {
        type: Number,
        default:0
    },
    stock: {
        type: Number,
        default:0
    },
    date: {
        type: Date,
        default:new Date()
    },
    category: {
        type: String,
        require: true
    },
    rating: {
        type: Number,
        default:0,
    },
    images: [
        {
            public_id: {
                type: String,
                require:String,
            },
            url: {
                type: String,
                require:String,
            },

        }
    ],
    rewievs: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref:'User',
                require:true,
            },
            name: {
                type: String,
                require:true,
            },
            comment: {
                type: String,
                require:true,
            },
            rating: {
                type: Number,
                require:String,
            },

        }
    ]
})
module.exports = mongoose.model('Product', ProductSchema);
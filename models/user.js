const mongoose = require('mongoose')


const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: Number,
        required: true,
        minLength: 6
    },
    avatar: {
        public_id: {
            type: String,
           
        },
        url: {
            type: String,
       
        }
    },
    role: {
        type: String,
        default: "user",
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpire: {
        type: Date
    }
},{timetamps:true})

module.exports = mongoose.model("User", UserSchema)

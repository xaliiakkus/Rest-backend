const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
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
        type: String,
        required: true,
        minLength: 6
    },
    avatar: {  
        public_id: {
            type: String,
            default: null // Varsayılan olarak boş olabilir
        },
        url: {
            type: String,
            default: null // Varsayılan olarak boş olabilir
        }
    },
    role: {
        type: String,
        default: "user",
    },
    resetPasswordToken: {
        type: String,
        default: undefined
    },
    resetPasswordExpire: {
        type: Date,
        default: undefined
    }
}, { timestamps: true }); 

module.exports = mongoose.model("User", UserSchema);

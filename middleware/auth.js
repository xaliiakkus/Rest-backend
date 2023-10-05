const jwt = require("jsonwebtoken")
const User = require("../models/user")
const authorizationMid = async (req, res, next) => {
    const token = req.cookies;

    if (!token) {
        return res.status(500).json({
            message: "Unauthorized"
        })
    }
    const decodedData = jwt.verify(token, process.env.SECRET_TOKEN)
    if (!decodedData) {
        return res.status(500).json({ message: "not Token " })
    }
    req.user = await User.findById(decodedData.id)

    next()
}


const roleChecked = (...roles) => {
    
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Yetkiniz yok"
            })
        }
        next()
    }
}



module.exports = {authorizationMid,roleChecked};
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary').v2;
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// create a new user
const register = async (req, res) => {
    const avatar = await cloudinary.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 100,
        height: 150,
        crop: 'cover'
    });
    const { name, email, password } = req.body;
    const user = await User.findOne({ email })
    if (user) {
        return res.status(404).json({ errors: [{ msg: 'Kullanıcı Mevcut' }] })
    }
    const passwordHahs = await bcrypt.hash(password, 10)

    if (password.length < 6) {
        return res.status(404).json({ errors: [{ msg: 'Şifre en az 6 karakter olmalıdır' }] })
    }
    const newUser = await User.create({
        name,
        email,
        password: passwordHahs,
        avatar: {
            public_id: avatar.public_id,
            url: avatar.secure_url
        }
    })
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' })

    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    }

    res.status(201).cookie("token", token, cookieOptions).json(
        newUser,
        token
    )
}

// login user
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ errors: [{ msg: 'Böyle bir kullanıcı bulunamadı' }] })
    };
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) { 
        return res.status(404).json({ errors: [{ msg: 'Şifre yanlış' }] })
    };
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' })

    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    }

    res.status(200).cookie("token", token, cookieOptions).json(
        user,
        token
    )
}
// logout user
const logout = async (req, res) => {
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now())
    }

    res.status(200).cookie("token",null,cookieOptions).json({ msg: 'Çıkış Yapıldı' })
}

// fogward password
const forwardPassword = async (req, res) => {
    const user = await User.findOne({ email: req.body.email })
    
    if (!user) {
        return res.status(404).json({ message: "Doğrulama kodunuz Emailinize İletildi !! " });
    }
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 5 * 60 * 1000;
    // save the user
    await user.save({ validateBeforeSave: false });
    
    const passwordUrl = `${req.protocol}://${req.get('host')}/reset/${resetToken}`
    const message = `
    <h1>Şifrenizi sıfırlamak için tıklayınız</h1>
    <a href="${passwordUrl}">Şifrenizi Sıfırla</a>
    `;

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            service:"gmail",
            port: 587,
            auth: {
                user: process.env.REACT_APP_EMAIL,
                pass: process.env.REACT_APP_EMAIL_PASS
            }
        })

        let mailData = await transporter.sendMail({
            from: `"new messages" 👻${process.env.REACT_APP_EMAIL}`, 
            to: req.body.email, 
            subject: 'Sifre Sıfırlama', 
            text: message,

        });
        
        await transporter.sendMail(mailData)

        res.status(200).json({
            message:'Mailinizi Kontrol Edin !! '
        })

    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
    }
    await user.save({ validateBeforeSave: false });
    
    res.status(404).json({
        message: error.message
    })

}

// reset Password
const resetPassword = async (req, res) => {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt :Date.now()}
    })
    
    if (!user) {
        return res.status(404).json({message:"Geçersiz Token !!"})
    }
    user.password = req.body.password;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;
    
    await user.save();

    const token = jwt.sign({id:user._id}, process.env.SECRET_TOKEN, {expiresIn:"1h"})

    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    }

    res.status(200).cookie("token", token, cookieOptions).json(
        user,
        token
    )
}

const userDetails = async (req, res, next) => {
    const user = await User.findById(req.params.id)
    res.status(200).json({
        user
    })
}

module.exports = {
    register,
    login,
    logout,
    resetPassword,
    forwardPassword,
    userDetails
}
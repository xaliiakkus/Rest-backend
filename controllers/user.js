const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ errors: [{ msg: 'Tüm alanlar zorunludur' }] });
        }

        if (password.length < 6) {
            return res.status(400).json({ errors: [{ msg: 'Şifre en az 6 karakter olmalıdır' }] });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ errors: [{ msg: 'Kullanıcı zaten mevcut' }] });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: passwordHash
        });

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ user: newUser, token });
    } catch (error) {
        console.error('Error during user registration:', error);
        res.status(500).json({ errors: [{ msg: 'Sunucu hatası' }] });
    }
};
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log("📩 Gelen İstek:", req.body); // Hata ayıklama için ekledik

        if (!email || !password) {
            return res.status(400).json({ errors: [{ msg: 'Email ve şifre gereklidir' }] });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ errors: [{ msg: 'Kullanıcı bulunamadı' }] });
        }

        console.log("👤 Kullanıcı bulundu:", user);

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ errors: [{ msg: 'Şifre yanlış' }] });
        }

        console.log("✅ Şifre doğru, token oluşturuluyor...");

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200)
            .cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            })
            .json({ user, token });

    } catch (error) {
        console.error("❌ Login Hatası:", error); // Hata mesajını logla
        res.status(500).json({ errors: [{ msg: 'Sunucu hatası' }] });
    }
};


const logout = async (req, res) => {
    res.status(200)
        .cookie('token', '', { httpOnly: true, secure: true, expires: new Date(0) })
        .json({ msg: 'Çıkış yapıldı' });
};

const forwardPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ message: 'Böyle bir kullanıcı bulunamadı' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 5 * 60 * 1000;
        await user.save({ validateBeforeSave: false });

        const passwordUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
        const message = `<h1>Şifrenizi sıfırlamak için tıklayınız</h1><a href="${passwordUrl}">Şifrenizi Sıfırla</a>`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: req.body.email,
            subject: 'Şifre Sıfırlama',
            html: message,
        });

        res.status(200).json({ message: 'Mailinizi kontrol edin!' });
    } catch (error) {
        console.error('Error in forwardPassword:', error);
        res.status(500).json({ errors: [{ msg: 'Sunucu hatası' }] });
    }
};

const resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
        
        if (!user) {
            return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş token!' });
        }

        user.password = await bcrypt.hash(req.body.password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ message: 'Şifreniz başarıyla sıfırlandı' });
    } catch (error) {
        console.error('Error in resetPassword:', error);
        res.status(500).json({ errors: [{ msg: 'Sunucu hatası' }] });
    }
};

const userDetails = async (req, res) => {
    try {
        const user = await User.findById(req.user.id); // Token içinden alınmalı!
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }
        res.status(200).json({ user });
    } catch (error) {
        console.error('Error in userDetails:', error);
        res.status(500).json({ errors: [{ msg: 'Sunucu hatası' }] });
    }
};

module.exports = {
    register,
    login,
    logout,
    resetPassword,
    forwardPassword,
    userDetails,
};

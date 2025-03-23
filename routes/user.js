const express = require('express');
const router = express.Router();
const {
    register,
    login,
    logout,
    resetPassword,
    forwardPassword,
    userDetails
} = require('../controllers/user');
const { authorizationMid } = require('../middleware/auth');

// Kullanıcı Bilgileri (Yetki Kontrolü ile)
router.get('/me', authorizationMid, userDetails);

// Kullanıcı Kayıt & Giriş İşlemleri
router.post('/register', register);
router.post('/login', login);

// Kullanıcı Çıkış
router.post('/logout', authorizationMid, logout);

// Şifre İşlemleri
router.post('/forgot-password', forwardPassword);  // E-posta ile sıfırlama kodu gönderme
router.patch('/reset-password/:token', resetPassword);  // Yeni şifreyi kaydetme

module.exports = router;

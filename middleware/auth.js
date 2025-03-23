const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authorizationMid = async (req, res, next) => {
    try {
        // Authorization header kontrolü
        if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Yetkilendirme başarısız, token eksik" });
        }

        // Token'ı al
        const token = req.headers.authorization.split(" ")[1];

        // Token doğrulama
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        if (!decodedData) {
            return res.status(401).json({ message: "Geçersiz token" });
        }

        // Kullanıcıyı MongoDB'den getir
        req.user = await User.findById(decodedData.id);
        if (!req.user) {
            return res.status(404).json({ message: "Kullanıcı bulunamadı" });
        }

        next();
    } catch (error) {
        console.error("Authorization Hatası:", error);
        return res.status(401).json({ message: "Yetkilendirme başarısız, geçersiz token" });
    }
};

// Rol Kontrolü Middleware
const roleChecked = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Yetkiniz yok" });
        }
        next();
    };
};

module.exports = { authorizationMid, roleChecked };

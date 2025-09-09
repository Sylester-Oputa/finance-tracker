const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

exports.protect = async (req, res, next) => {
    let token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if it's an access token
        if (decoded.type !== 'access') {
            return res.status(401).json({ message: "Invalid token type" });
        }

        // Check session validity
        const session = await prisma.session.findFirst({
            where: {
                userId: decoded.id,
                token,
                revoked: false,
                expiresAt: { gt: new Date() },
            },
        });
        if (!session) {
            return res.status(401).json({ message: "Session expired or revoked" });
        }

        const user = await prisma.user.findUnique({
            where: { 
                id: decoded.id,
                deletedAt: null,
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                profileImageUrl: true,
                defaultCurrency: true,
                status: true,
                emailVerifiedAt: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            return res.status(401).json({ message: "Not authorized, user not found" });
        }

        // Check if user is verified
        if (user.status !== "ACTIVE") {
            return res.status(403).json({ 
                message: "Email not verified",
                needsVerification: true 
            });
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: "Token expired",
                expired: true 
            });
        }
        console.error("Auth middleware error:", err);
        res.status(401).json({ message: "Not authorized, token failed" });
    }
};

// Optional middleware for routes that don't require authentication but can use it
exports.optionalAuth = async (req, res, next) => {
    let token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.type === 'access') {
            const user = await prisma.user.findUnique({
                where: { 
                    id: decoded.id,
                    deletedAt: null,
                },
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImageUrl: true,
                    defaultCurrency: true,
                    status: true,
                    emailVerifiedAt: true,
                    lastLoginAt: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            
            req.user = user || null;
        }
    } catch (err) {
        req.user = null;
    }
    
    next();
};
const jwt = require("jsonwebtoken")
function ensureSecret(){
    if (!process.env.JWT_SECRET) {
        console.log("JWT_SECRET is not defined");

    }
    return process.env.JWT_SECRET;
}

function generateToken(user){
    const secret = ensureSecret();
    const token = jwt.sign({ id: user.id }, secret, { expiresIn: "1h" });
    return token;
}

function verifyToken(token){
    const secret = ensureSecret();
    return jwt.verify(token, secret);
}

function authenticate(req, res, next){
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }
    try {
        const decoded = verifyToken(token);
        if (!decoded?.id) {
            return res.status(401).json({ message: "Invalid token payload" });
        }
        req.user = decoded;
        next();
    } catch (_err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

module.exports = { generateToken, verifyToken, authenticate };
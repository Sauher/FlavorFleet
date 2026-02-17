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
    try {
        const decoded = jwt.verify(token, secret);
        return decoded;
    } catch (err) {
        console.log(err);
    }
}

function authenticate(req, res, next){
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }
    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: err.message });
    }
}

module.exports = { generateToken, verifyToken, authenticate };
const jwt = require('jsonwebtoken')

// verify token
module.exports = verifyToken = (req, res, next) => {

    const token = req.header('token')

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized : token missing?' })
    }

    jwt.verify(token, 'your-secret-key', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token is not valid' })
        }

        if (!decoded) {
            return res.status(403).json({ message: 'Forbidden: Invalid token' });
        }

        req.user = decoded
        next()
    })
}
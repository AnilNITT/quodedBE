const jwt = require('jsonwebtoken');
var config = require('../helper/config');

exports.authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']

    if (token == null || token === "") {
        return res.status(401).send({
            status: "fail",
            message: "Token is required",
        })
    }
    
    try{
        jwt.verify(token, config.secret_key, (err, user) => {
            if (err) {
                return res.status(401).send({
                    status: "fail",
                    error: "Invalid Token",
                })
            }
            req.user = user
            next()
        })
    } catch (err) {
        return res.status(401).send({
            status: "fail",
            error: err,
        })
    }
}
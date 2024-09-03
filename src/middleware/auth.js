const jwt = require("jsonwebtoken");
const Register = require("../models/registers");

const auth = async (req,res,next) => {
    try {
        // Check if the cookie exists
        if (!req.cookies.jwt) {
            return res.status(401).send("Authentication required.");
        }
        // Verify the token
        const token = req.cookies.jwt;
        const verifyuser = jwt.verify(token,process.env.SECRET_KEY);
        console.log(verifyuser);

        // Find the user
        const user = await Register.findOne({ _id: verifyuser._id });
      
        // If no user is found, return a 404
        if (!user) {
            return res.status(404).send("User not found.");
        }

        console.log(user);
        req.user = user;
        req.token = token;

        // Call the next middleware
        next();
    } catch (error) {
        console.error(error);
        res.status(401).send("Invalid token or user.");
    }
};

module.exports = auth;

require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 8000;
const path = require("path");
const hbs = require("hbs");
require("./db/connection");
const Register = require("./models/registers.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookiparser = require("cookie-parser");
const auth = require("./middleware/auth.js");

const staticpath = path.join(__dirname,"../public");
const tempatespath = path.join(__dirname,"../templats/views");
const patialspath = path.join(__dirname,"../templats/partials");

// console.log(process.env.SECRET_KEY);
app.use(express.json());
app.use(cookiparser());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(staticpath));
app.set("view engine","hbs");
app.set("views",tempatespath);
hbs.registerPartials(patialspath);

app.get("/",(req,res) => {
    res.render("index");
});
app.get("/secret",auth,(req,res) => {
    res.render("secret");
    console.log(`this is the cookie in the  ${req.cookies.jwt}`);
});

app.get("/logout",auth,async (req,res) => {
    try {
        // for single logout
        // console.log(req.user);
        // req.user.tokens = req.user.tokens.filter((curruntele) => {
        //     return curruntele.token != req.token;
        // })

        //logout for all devies

        req.user.tokens = [];

        res.clearCookie("jwt");
        console.log("logoutsuccessfully");

        await req.user.save();
        res.render("login")

    } catch (error) {
        res.status(500).send(error)
    }
})
app.get("/login",(req,res) => {
    res.render("login");
});

app.get("/register",(req,res) => {
    res.render("register");
});

// Create a new user in our database
app.post("/register",async (req,res) => {
    try {
        const body = Object.keys(req.body).reduce((acc,key) => {
            acc[key.trim()] = req.body[key].trim();
            return acc;
        },{});

        console.log("Request body:",body);
        const password = body.password;
        const cpassword = body.Confirmpassword;
        if (password === cpassword) {

            const registeremploy = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                age: req.body.age,
                password: password,
                Confirmpassword: cpassword,
            })

            console.log(registeremploy);
            const token = await registeremploy.genrateAuthtoken();
            console.log(token);

            res.cookie("jwt",token,{
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 3600000
            });
            //password hash 
            const registeddata = await registeremploy.save();
            console.log("Registered data:",registeddata);

            res.status(201).render("index");
        }

    } catch (error) {
        console.log("Error:",error);
        res.status(400).send(error);
    }
});




// //login check
app.post("/login",async (req,res) => {
    try {
        const email = req.body.email.trim();
        const password = req.body.password.trim();

        // Find the user by email
        const user = await Register.findOne({ email: email });

        if (!user) {
            return res.status(400).send("Invalid Login Details");
        }

        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password,user.password);

        if (!isMatch) {
            return res.status(400).send("Invalid Login Password Details");
        }

        // Generate an authentication token for the user
        const token = await user.genrateAuthtoken();

        // Set the JWT cookie
        res.cookie("jwt",token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Set secure only in production
            maxAge: 3600000, // 1 hour
        });

        // If password matches, render the index page
        res.status(201).render("index");
    } catch (error) {
        console.log("Error:",error);
        res.status(400).send("Invalid Login Details");
    }
});










//use the password seccour in bcryptjs npm 


// const bcrypt = require("bcryptjs");

// const secourepassword = async (password)=>{

//  const passwordhash =   await bcrypt.hash(password,10);
//  console.log(passwordhash);


//  const passwordmatch =   await bcrypt.compare("rahul",passwordhash);
//  console.log(passwordmatch);
// } 


// secourepassword("rahul");



// const jwt = require("jsonwebtoken");
// // const { verify } = require("crypto");

// const createtoken = async () =>{

//  const token = await  jwt.sign({_id:"66a77cb256757dfb393e0cf7"},"mynameisrahulgoyaniiamawebdevlopment",{
//     expiresIn:"2 days"
//  });
//  console.log(token);

//  const userverfication = await  jwt.verify(token,"mynameisrahulgoyaniiamawebdevlopment")
// console.log(userverfication);
// }
//  createtoken();

app.listen(port,() => {
    console.log(`Server is started on port ${port}`);
});

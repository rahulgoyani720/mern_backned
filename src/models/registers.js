const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const employeeSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    gender: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },
    age: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    Confirmpassword: {
        type: String,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
});

//genrate token
employeeSchema.methods.genrateAuthtoken = async function () {
    try {
        const token = jwt.sign({ _id: this._id.toString() },process.env.SECRET_KEY);
        return token;
    } catch (error) {
        console.log(`the error part ${error}`);
    }
}

//converting to password hash
employeeSchema.pre("save",async function (next) {

    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password,10);
        this.Confirmpassword = await bcrypt.hash(this.password,10);
    }
    next();
})

// create a coolections
const Register = mongoose.model("Register",employeeSchema);

module.exports = Register;

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";

//create token
const createToken = (id) => {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");
    return jwt.sign({id}, process.env.JWT_SECRET);
}

//login user
const loginUser = async (req,res) => {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";
    try{
        if (!email || !password) {
            return res.json({success:false,message:"Email and password are required"})
        }
        const user = await userModel.findOne({email})

        if(!user){
            return res.json({success:false,message: "User does not exist"})
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            return res.json({success:false,message: "Invalid credentials"})
        }

        const token = createToken(user._id)
        res.json({success:true,token,user:{id:user._id,name:user.name,email:user.email}})
    } catch (error) {
        console.error("Login error:", error);
        res.json({success:false,message: error.message || "Internal server error during login"})
    }
}

//register user
const registerUser = async (req,res) => {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";
    try{
        if (!name || !email || !password) {
            return res.json({success:false,message:"Name, email and password are required"})
        }
        //check if user already exists
        const exists = await userModel.findOne({email})
        if(exists){
            return res.json({success:false,message: "User already exists"})
        }

        // validating email format & strong password
        if(!validator.isEmail(email)){
            return res.json({success:false,message: "Please enter a valid email address"})
        }
        if(password.length<8){
            return res.json({success:false,message: "Password must be at least 8 characters long"})
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({name, email, password: hashedPassword})
        const user = await newUser.save()
        const token = createToken(user._id)
        res.json({success:true,token,user:{id:user._id,name:user.name,email:user.email}})

    } catch(error){
        console.error("Register error:", error);
        res.json({success:false,message: error.message || "Internal server error during registration"})
    }
}

export {loginUser, registerUser}

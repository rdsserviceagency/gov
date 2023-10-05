const DastavejUser = require("../models/DastavejUser");
const bcrypt=require("bcrypt");
const cookieParser=require("cookie-parser");
const jwt=require("jsonwebtoken");

async function dastavejRegister(req, res) {
    const { name, phone, email, password, profession, upi, mapLink, address,Jila,Office } = req.body;
    const Password= await bcrypt.hash(req.body.password,10);

    const existingUser = await DastavejUser.findOne({ email: email }).exec();
    if (existingUser) {
        res.status(500).json({ error: "User already exists" });
        return
    } else {
        // Create a new user (you should insert into your database)
        const newUser = new DastavejUser(
            { 
                name:name,
                phone:phone, 
                email:email,
                profession:profession,
                upi:upi,
                Jila:Jila,
                Office:Office,
                mapLink:mapLink,
                address:address,
                password:Password
            }
            );
        await newUser.save().then(()=>{
            const token= jwt.sign({
            },process.env.SECRET_KEY)
            res.cookie("dastvej",token,{
                expires: new Date(Date.now()+ 24*60*60*1000*3),
                httpOnly: true
            })
            res.cookie("userid",email,{
                expires: new Date(Date.now()+ 24*60*60*1000*3),
                httpOnly: true
            })
        });
        res.status(200).json({ success: "Registration successful" });
    }
}

module.exports = dastavejRegister;
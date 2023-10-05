const DastavejUser = require("../models/DastavejUser");
const bcrypt=require("bcrypt");
const cookieParser=require("cookie-parser");
const jwt=require("jsonwebtoken");

async function DastavejLogin(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    console.log(req.body)
    // Check if the user exists (you should check against your database)
    DastavejUser.findOne({email:email}).then(async (user) => {

        if (user) {
            const isMatch=await bcrypt.compare(password,user.password);
            if(isMatch){
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
                await res.redirect("/");
            }else{
                res.status(402).json({ error: "Password is incorrect" });

            }

        } else {
            res.status(401).json({ error: "User is not Registered" });
        }
    }).catch((err) => {
        res.status(500).json({ error: "Internal server error" });
    });
}

module.exports = DastavejLogin;
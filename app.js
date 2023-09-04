const express=require("express") 
const app = express();
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const nodemailer=require("nodemailer")
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb+srv://admin-tushar:tushar123@cluster0.bry27q8.mongodb.net/govdb",{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
  console.log("Successfully connected to database");
}).catch((e)=>{
  console.log(e);
})

const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:"t.guptacool1909@gmail.com",
        pass:"hdquiboomzjchpiz"
    },
    port: 465,
    host:"smtp.gmail.com"
})


var OTP;
const userSchema= new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    type: String,
    phone: String,
    position: String,
    subscription:String
  });

const User= mongoose.model("User",userSchema);

// login route
var login_valid=0;
app.get("/login",(req,res)=>{
    res.render("login",{login_valid:login_valid});
    login_valid=0;
})

app.post("/login",(req,res)=>{
    const Email= req.body.email;
    const Password= req.body.password;
    User.findOne({email: Email}).then(async(found)=>{
        if(!found){
            login_valid=1;
            res.redirect("/login")
        }else{
            const isMatch=await bcrypt.compare(Password,found.password);
            if(isMatch){
                var OTP1=Math.floor(Math.random()*10000)+10000;
                OTP=OTP1;
                const mailOptions={
                    from:"emailtushar1910@gmail.com",
                    to:Email,
                    subject:"OTP Verification",
                    text:`OTP: ${OTP1}`
                }
                transporter.sendMail(mailOptions)
                res.redirect("/otp");
            }else{
                login_valid=2;
                res.redirect("/login")
            }
        }
    })
})

// Register route

var register_valid=0;
app.get("/register",(req,res)=>{
    res.render("register",{register_valid:register_valid});
    register_valid=0;
})

app.post("/register",(req,res)=>{
    const name=req.body.name;
    const email=req.body.email;
    const phone=req.body.phone;
    const password=req.body.password;
    const Conform=req.body.Conform;
    User.findOne({email:email}).then(async (found)=>{
        if(!found){
                if(password.length>7){
                    if(password==Conform){
                        const Password= await bcrypt.hash(password,10);
                        const user=new User({
                            name: name,
                            email: email,
                            password: Password,
                            type: "Public",
                            phone: phone,
                            position: "Not",
                            subscription:"Not"
                        })

                        await user.save().then(()=>{
                            var OTP1=Math.floor(Math.random()*10000)+10000;
                            OTP=OTP1;
                            const mailOptions={
                                from:"emailtushar1910@gmail.com",
                                to:Email,
                                subject:"OTP Verification",
                                text:`OTP: ${OTP1}`
                            }
                            transporter.sendMail(mailOptions)
                            res.redirect("/otp");
                        }).catch((e)=>{
                            console.log(e)
                        })
                    }else{
                        register_valid=3;
                        res.redirect("/register")
                    }

                }else{
                    register_valid=2;
                    res.redirect("/register")
                }
        }else{
            register_valid=1;
            res.redirect("/register")
        }
    })
    
})

// Register as professional route

var Pregister_valid=0;
app.get("/register_pro",(req,res)=>{
    res.render("register_pro",{ Pregister_valid: Pregister_valid});
    Pregister_valid=0;
})

app.post("/register_pro",(req,res)=>{
    const name=req.body.name;
    const email=req.body.email;
    const phone=req.body.phone;
    const password=req.body.password;
    const Conform=req.body.Conform;
    const Position=req.body.Position;
    User.findOne({email:email}).then(async (found)=>{
        if(!found){
                if(password.length>7){
                    if(password==Conform){
                        const Password= await bcrypt.hash(password,10);
                        const user=new User({
                            name: name,
                            email: email,
                            password: Password,
                            type: "Professional",
                            phone: phone,
                            position: Position,
                            subscription:"1 month"
                        })

                        await user.save().then(()=>{
                            var OTP1=Math.floor(Math.random()*10000)+10000;
                            OTP=OTP1;
                            const mailOptions={
                                from:"emailtushar1910@gmail.com",
                                to:Email,
                                subject:"OTP Verification",
                                text:`OTP: ${OTP1}`
                            }
                            transporter.sendMail(mailOptions)
                            res.redirect("/otp");
                        }).catch((e)=>{
                            console.log(e)
                        })
                    }else{
                        Pregister_valid=3;
                        res.redirect("/register_pro")
                    }

                }else{
                    Pregister_valid=2;
                    res.redirect("/register_pro")
                }
        }else{
            Pregister_valid=1;
            res.redirect("/register_pro")
        }
    })
    
})

// OTP route
var otp_valid=0;
app.get("/otp",(req,res)=>{
    res.render("otp",{otp_valid:otp_valid});
    otp_valid=0;
})

app.post("/otp",(req,res)=>{
    const otp=req.body.otp;
    if(otp==OTP){
        res.redirect("/home");
    }else{
        otp_valid=1;
        res.redirect("/otp");
    }
})

// home page route
app.get("/",(req,res)=>{
    res.render("index");
})

// conventor
let unit_array=["Hector","Decimal","VargFeet","Vargmeter","Acre"]
app.get("/converter",(req,res)=>{
    res.render("conventor",{input:1,input_unit:"Hector",output_unit:"Decimal",output:1,uarray:unit_array})
})

app.post("/converter",(req,res)=>{
    const input=req.body.input;
    const input_unit=req.body.input_unit;
    const output_unit=req.body.output_unit;
    let output;
    if(input_unit=="Hector"){
        output=0.00
    }
    else if(input_unit=="Decimal"){
        if(output_unit=="Hector"){
            output=input*0.004
        }
        else if(output_unit=="Decimal"){
            output=input*1.0
        }
        else if(output_unit=="VargFeet"){
            output=input*435.6

        }
        else if(output_unit=="Vargmeter"){
            output=input*40.48

        }
        else{
            output=input*0.01
        }

    }
   else if(input_unit=="VargFeet"){
    if(output_unit=="Hector"){
        output=input*(0.009/1000)
    }
    else if(output_unit=="Decimal"){
        output=input*(2/1000)
    }
    else if(output_unit=="VargFeet"){
        output=input*(1/1000)

    }
    else if(output_unit=="Vargmeter"){
        output=input*(92.94/1000)

    }
    else{
        output=input*(0.02/1000)
    }

    }
    else if(input_unit=="Vargmeter"){
        output=0.00
    }
    else{
      output=0.00
    }
    res.render("conventor",{input:input,input_unit:input_unit,output_unit:output_unit,output:output,uarray:unit_array})

})


// home
app.get("/home",(req,res)=>{
    res.render("home");
})

app.listen(3000,(req,res)=>{
    console.log("Server started at port 3000")
})
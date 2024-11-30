

require("dotenv").config()
const express=require("express") 
const app = express();
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const nodemailer=require("nodemailer");
const multer=require("multer");
const axios=require("axios");
const cookieParser=require("cookie-parser");
const jwt=require("jsonwebtoken");
const fs = require('fs');
const path = require("path")
const xlsx = require("xlsx");
const { name } = require("ejs");
app.set("views",path.join(__dirname,"views"))
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());



// Middleware for dastvej login
const isAuth1=async (req,res,next)=>{
    
    if(await req.cookies.dastvej===undefined){
        res.redirect("/dastavejAuthenticate");
    }
    else{
        const token=await req.cookies.dastvej;
        try{
            await jwt.verify(token,process.env.SECRET_KEY);
            next();
        }catch(e){
            console.log(e);
            res.redirect("/dastavejAuthenticate");
        }
        

    }
}


// Middleware for User login
const isAuth=async (req,res,next)=>{
    
    if(await req.cookies.user===undefined){
        res.redirect("/login");
    }
    else{
        const token=await req.cookies.user;
        try{
            await jwt.verify(token,process.env.SECRET_KEY);
            next();
        }catch(e){
            console.log(e);
            res.redirect("/login");
        }
        

    }
}



//controllers
const dastavejUpdate = require("./controller/DastavejUpdate");
// const vigyaapnUpload = require("./controller/vigyaapnUpload");
// const documentUpload = require("./controller/documentUpload");
// const sampatiVivran = require("./controller/sampatiVivran");
const datsavejLogin = require("./controller/DastavejLogin");
const datsavejRegister = require("./controller/DasavejRegister");

//Models
const DocumentSchema = require('./models/Documents');
const DastavejUser = require("./models/DastavejUser");
const JilaModel = require('./models/JilaModel');
const Condition1Model = require("./models/Condition");
const EJilaModel = require('./models/eJilaModel');
const ECondition1Model = require("./models/eCondition");
const { generateKeyPair } = require("crypto");


// multer configuration for Adhaar and pan
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder;
        if (file.fieldname === 'aadhaarPDF') {
            folder = 'uploads/adhaar';
        } else if (file.fieldname === 'panPDF') {
            folder = 'uploads/pancard';
        } 
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        const extname = path.extname(file.originalname);
        let filename;
        if (file.fieldname === 'aadhaarPDF') {
            filename = `${req.body.aadhaarNumber}${extname}`;
        } else if (file.fieldname === 'panPDF') {
            filename = `${req.body.panNumber}${extname}`;
        } 
        cb(null, filename);
    },
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('File must be in PDF format'), false);
        }
    },
});

// multer configuration for Important

const storage2 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/important');
    },
    filename: (req, file, cb) => {
        const fileName = `${req.body.important}_${Date.now()}.pdf`;
        cb(null, fileName);
    },
});

const fileFilter1 = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Only .pdf files are allowed.'), false); // Reject the file
    }
};

const upload120 = multer({ storage: storage2, fileFilter: fileFilter1 });

// multer configuration for Help

const storage200 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/help');
    },
    filename: (req, file, cb) => {
        const fileName = `${req.body.Vilakh}_${req.body.Dastavej}_${req.body.name}.pdf`;
        cb(null, fileName);
    },
});

const fileFilter200 = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Only .pdf files are allowed.'), false); // Reject the file
    }
};

const upload200 = multer({ storage: storage200, fileFilter: fileFilter200 });

// multer configuration for Checklist

const storage201 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/checklist');
    },
    filename: (req, file, cb) => {
        const fileName = `${req.body.Vilakh}_${req.body.Dastavej}_${req.body.name}.pdf`;
        cb(null, fileName);
    },
});

const fileFilter201 = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Only .pdf files are allowed.'), false); // Reject the file
    }
};

const upload201 = multer({ storage: storage201, fileFilter: fileFilter201 });


// Multer configuration for Bulk Uploding Conditions
const storage1 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/conditions'); // Set the destination directory
    },
    filename: (req, file, cb) => {
        // Keep the original file name
        const fileName = file.originalname;
        cb(null, fileName);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Only .xlsx files are allowed.'), false); // Reject the file
    }
};

const uploadCondition = multer({ storage: storage1, fileFilter: fileFilter });



mongoose.connect("mongodb+srv://drypure:123@cluster0.mzafxrg.mongodb.net/govdb",{
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

// Create a schema and model for your form data
const formDataSchema = new mongoose.Schema({
    drawing: String, // Store the drawing data URL as a string
});

const FormDataa = mongoose.model("FormDataa", formDataSchema);


const vigyapnSchema = new mongoose.Schema({
    deed: { type: String, required: true, enum: ['Buy', 'Sell'] },
    type: { type: String, required: true, enum: ['Rent', 'Purchase'] },
    villageName: { type: String, required: true },
    landType: { type: String, required: true, enum: ['Plot', 'House'] },
    price: { type: Number, required: true },
    area: {
        type: Number,
        required: function () {
            return this.landType === 'Plot'; // Required only for landType 'Plot'
        }
    },
    bhk: {
        type: Number,
        required: function () {
            return this.landType === 'House'; // Required only for landType 'House'
        }
    },
    houseType: {
        type: String,
        enum: ['Fully furnished', 'Semi furnished', 'Unfurnished', 'N/A'],
        required: function () {
            return this.landType === 'House'; // Required only for landType 'House'
        }
    },
    address: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
});


const applicationSchema = new mongoose.Schema({
  number:Number,
  Dastavej:[
    {
        document:String,
        docdescription:String,
        pakshkar:String,
        subdocument:String,
        subdocdescription:String,
        Sampati:[
            {
                valid:String,
                number:String,
                office:String,
                date:String,
                file:String
            }
        ],
        Aadiwasi:[
            {
                valid:String,
                number:String,
                office:String,
                date:String,
                file:String
            }
        ],
        Loan:[
            {
                amount:Number
            }
        ],
    
        Ledge:[
            {
                amount:Number,
                rate:Number,
                year:Number
            }
        ],
        Partifal:[
            {
                type1:String,
                amount:String,
                date:String,
                bank:String,
                check:String
            }
        ],
      }
  ],
  Pakshkar:[
    {
        type1:String,
        gender:String,
        verify:String,
        category:String,
        religion:String,
        number1:String,
        Designation:String,
        DOB:String,
        number:String,
        name:String,
        relition:String,
        age:String,
        panCardRadio:String,
        panNumber:String,
        father:String,
        अंगूठा:String,
        हस्ताक्षर:String
  }
],
Stamp:[
    {
        stamp:String,
        upkar:String,
        janpad:String,
        stamp_total:String,
        balance:String,
        panjiyan:String,
        total:String
    }
],
Sampati:[
    {
        marketValue:String
    }
],
sampati1:[
    {
        maukya:String,
        maukyadistance:String,
        unit:String,
        makan:String,
        makantype:String,
        kua:String,
        kuatype:String,
        tree:String,
        treetype:String,
        kisam:String,
        bhumi:String,
        town:String,
        town1:String,
        town2:String,
        town3:String,
        rara:String,
        rara1:String,
        दानग्रहीता:String,
        पंजीयनशुदा:String,
        तिहाई:String,
    }
],
diagram:[
    {
        dia:String,
    }
],
katchat:[
    {
        बाजार:String,
        प्रतिफल:String,
        निर्माण1:String,
        निर्माण:String,
        खसरा1:String,
        खसराि:String,
        City:String,
        Gao:String,
        Patwari:String,
        Rajiv:String,
        Tehsil:String,
        Jila:String,
    
    }
],
prauta:[
    {
        प्रारुपकर्ता:String,
        name:String,
        date:String,
        jila:String,
        कार्यालय:String,
        लाइसेंस:String,
        पंजीयन:String,
        पंजी:String,
    }
],
map:[
    {
        drawing: String,
    }
],
Templete:[
    {
        name:String,
        body:String
    }
]
});

const helpSchema= new mongoose.Schema({
    name: String,
    vilakh: String,
    dastavej: String,
    link: String,
  });
  
const Help= mongoose.model("Help",helpSchema);

const checkSchema= new mongoose.Schema({
    name: String,
    vilakh: String,
    dastavej: String,
    link: String,
  });
  
const Check= mongoose.model("Check",checkSchema);

const userSchema= new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    type: String,
    phone: String,
    position: String,
    subscription:String,
    vigypaan:[vigyapnSchema],
    application:[applicationSchema]
  });
  
const User= mongoose.model("User",userSchema);


const docSchema= new mongoose.Schema({
    name: String,
    description: String,
    par: String,
    adi: String,
    PRATIFAL:String,
    Sampati:String,
    Loan:String,
    Ledge:String,
    sub: [
        {
            name: String,
            description: String,
            Stamp:Number,
            Upkar:Number,
            Janpad:Number,
            Partiton:Number,
            SamptiRequi:String,
            Pakshsam:String,
            SamptiMauk:String,
            PanType:String,
            Paksh:String,
            panjikar: Number,
            Type:String,
            Reason:[
                {
                    name:String,
                }
            ],
            templete:[
                {
                    name:String,
                    description:String
                }
            ]
        }   
    ],
    people:[{
        name:String
        }
    ],
    pakskarbutt:[{
            name:String,
            minimum:String,
            partition:String,
        }
    ]
  });

const Doc= mongoose.model("Doc",docSchema);



const tempSchema= new mongoose.Schema({
    name: String,   
    description: String,   
  });

const Templete= mongoose.model("Templete",tempSchema);

const verifySchema= new mongoose.Schema({
    name: String,   
  });

const Verify= mongoose.model("Verify",verifySchema);

const SampatiSchema= new mongoose.Schema({
    name: String,
    other: String,
  });

const Sampati= mongoose.model("Sampati",SampatiSchema);

const RoadSchema= new mongoose.Schema({
    name: String,
    Percentage: String,
  });

const Road= mongoose.model("Road",RoadSchema);

const FasalSchema= new mongoose.Schema({
    name: String,
    Percentage: String,
  });

const Fasal= mongoose.model("Fasal",FasalSchema);

const ExtraSchema= new mongoose.Schema({
    name: String,
    Percentage: String,
  });

const Extra= mongoose.model("Extra",ExtraSchema);

const IncompleteSchema= new mongoose.Schema({
    name: String,
    Percentage: String,
  });

const Incomplete= mongoose.model("Incomplete",IncompleteSchema);

const TalSchema= new mongoose.Schema({
    name: String,
    Percentage: String,
  });

const Tal= mongoose.model("Tal",TalSchema);

const makanSchema= new mongoose.Schema({
    city: String,
    sampati: String,
    sagrachna: String,
    upbad: String,
    second:String,
    tal:String,
    avskarn:String,
  });

const Makan= mongoose.model("Makan",makanSchema);

const impSchema= new mongoose.Schema({
    name: String,   
    path: String,   
  });

const Imp= mongoose.model("Imp",impSchema);

const TreeSchema= new mongoose.Schema({
    name: String,   
    quality: String,   
    size:String,
    price:Number
  });

const Tree= mongoose.model("Tree",TreeSchema);

const FruitSchema= new mongoose.Schema({
    name: String,   
    price: Number,   
  });

const Fruit= mongoose.model("Fruit",FruitSchema);

const FamousSchema= new mongoose.Schema({
    name: String,   
    price: Number,   
  });

const Famous= mongoose.model("Famous",FamousSchema);


const DastvajJilaSchema= new mongoose.Schema({
    name: String,   
    office: [
        {
            name:String,
        }
    ],   
  });

const DastvajJila= mongoose.model("DastvajJila",DastvajJilaSchema);


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
                res.redirect(`${Email}/otp`);
            }else{
                login_valid=2;
                res.redirect("/login")
            }
        }
    })
})



app.get("/logout",(req,res)=>{
    res.clearCookie("user");
    res.clearCookie("useremail");
    res.redirect("/");
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
                            subscription:"Not",
                            vigypaan:[]
                        })

                        await user.save().then(()=>{
                            var OTP1=Math.floor(Math.random()*10000)+10000;
                            OTP=OTP1;
                            const mailOptions={
                                from:"emailtushar1910@gmail.com",
                                to:email,
                                subject:"OTP Verification",
                                text:`OTP: ${OTP1}`
                            }
                            transporter.sendMail(mailOptions)

                            res.redirect(`${email}/otp`);
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
                            subscription:"1 month",
                            vigypaan:[]
                        })

                        await user.save().then(()=>{
                            var OTP1=Math.floor(Math.random()*10000)+10000;
                            OTP=OTP1;
                            const mailOptions={
                                from:"emailtushar1910@gmail.com",
                                to:email,
                                subject:"OTP Verification",
                                text:`OTP: ${OTP1}`
                            }
                            transporter.sendMail(mailOptions)
                            res.redirect(`${email}/otp`);
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
app.get("/:email/otp",(req,res)=>{
    res.render("otp",{otp_valid:otp_valid,email:req.params.email});
    otp_valid=0;
})

app.post("/otp",(req,res)=>{
    const otp=req.body.otp;
    if(otp==OTP){
        const token= jwt.sign({
        },process.env.SECRET_KEY)
        res.cookie("user",token,{
            expires: new Date(Date.now()+ 24*60*60*1000*3),
            httpOnly: true
        })
        res.cookie("useremail",req.body.email,{
            expires: new Date(Date.now()+ 24*60*60*1000*3),
            httpOnly: true
        })
        res.redirect("/");
    }else{
        otp_valid=1;
        res.redirect("/otp");
    }
})




// home page route


app.get("/",async(req,res)=>{
    if(await req.cookies.user===undefined){
        res.render("index");
    }
    else{
        const token=await req.cookies.user;
        try{
            await jwt.verify(token,process.env.SECRET_KEY);
            res.render("home");
        }catch(e){
            console.log(e);
            res.render("index");
        }
        

    }
})




// Important
app.get("/important",(req,res)=>{
    Imp.find().then((found)=>{
        res.render("important",{parray:found});
    })
})

app.get("/important1",(req,res)=>{
    Imp.find().then((found)=>{
        res.render("important1",{parray:found});
    })
})

// conventor
let unit_array=["हेक्टेयर","डिसमिल","वर्गफीट","वर्ग मीटर","एकड़"]

app.get("/converter",(req,res)=>{
    res.render("conventor",{input:1,input_unit:"Hector",output_unit:"डिसमिल",output:1,uarray:unit_array})
})

app.post("/converter",(req,res)=>{
    const input=req.body.input;
    const input_unit=req.body.input_unit;
    const output_unit=req.body.output_unit;
    let output;
    if(input_unit=="हेक्टेयर"){
        if(output_unit=="हेक्टेयर"){
            output=input*1.000
        }
        else if(output_unit=="डिसमिल"){
            output=input*250.0
        }
        else if(output_unit=="वर्गफीट"){
            output=input*108900.00

        }
        else if(output_unit=="वर्ग मीटर"){
            output=input*10120.82

        }
        else{
            output=input*2.5000
        }
    }
    else if(input_unit=="डिसमिल"){
        if(output_unit=="हेक्टेयर"){
            output=input*0.004
        }
        else if(output_unit=="डिसमिल"){
            output=input*1.0
        }
        else if(output_unit=="वर्गफीट"){
            output=input*435.6

        }
        else if(output_unit=="वर्ग मीटर"){
            output=input*40.48

        }
        else{
            output=input*0.01
        }

    }
   else if(input_unit=="वर्गफीट"){
    if(output_unit=="हेक्टेयर"){
        output=input*(0.009/1000)
    }
    else if(output_unit=="डिसमिल"){
        output=input*(2/1000)
    }
    else if(output_unit=="वर्गफीट"){
        output=input*(1000/1000)

    }
    else if(output_unit=="वर्ग मीटर"){
        output=input*(92.94/1000)

    }
    else{
        output=input*(0.02/1000)
    }

    }
    else if(input_unit=="वर्ग मीटर"){
        if(output_unit=="हेक्टेयर"){
            output=input*(0.099/1000)
        }
        else if(output_unit=="डिसमिल"){
            output=input*(25/1000)
        }
        else if(output_unit=="वर्गफीट"){
            output=input*(10760/1000)

        }
        else if(output_unit=="वर्ग मीटर"){
            output=input*(1000/1000)

        }
        else{
            output=input*(0.25/1000)
        }    
    }
    else{
        if(output_unit=="हेक्टेयर"){
            output=input*0.400
        }
        else if(output_unit=="डिसमिल"){
            output=input*100
        }
        else if(output_unit=="वर्गफीट"){
            output=input*43560

        }
        else if(output_unit=="वर्ग मीटर"){
            output=input*4048.33

        }
        else{
            output=input*1.00
        }
    }
    res.render("conventor",{input:input,input_unit:input_unit,output_unit:output_unit,output:output,uarray:unit_array})

})



// home
// app.get("/home",isAuth,(req,res)=>{
//     res.render("home");
// })


// Vigyaapn
app.get("/vigyaapn", async (req, res) => {
    const vigyapan_data = await User.find();
    if (vigyapan_data) {
        res.render('vigyaapn', { properties: vigyapan_data });
        return
    }
    res.render('vigyaapn', { properties: [] });
})

app.get("/vigyaapn1",isAuth, async (req, res) => {

    const vigyapan_data = await User.findOne({email:req.cookies.useremail});
    if (vigyapan_data) {
        res.render('vigyaapn1', { properties: vigyapan_data.vigypaan,phone:vigyapan_data.phone});
        return
    }
})
app.get("/:id/vigyaapn/delete",isAuth, async (req, res) => {

    User.updateOne({email:req.cookies.useremail},{$pull:{vigypaan: {_id:req.params.id}}}).then((found)=>{
        res.redirect("/vigyaapn1")
    })

})
app.get("/vigyaapn/upload",isAuth,(req,res)=>{
    res.render("vigyaapnUpload");
})

app.post("/vigyaapn/upload",isAuth,async (req, res) =>{
    const { deed, type, villageName, price, landType, description,address } = req.body;
    let bhk = "";
    let houseType = "N/A";
    let area = "";

    if (landType === "House") {
        bhk = req.body.bhk;
        houseType = req.body.houseType;
        area = req.body.area;
    } else if (landType === "Plot") {
        area = req.body.area;
    }

    let found= await User.findOne({email:req.cookies.useremail});
    let obj={
        deed:deed,
        type:type,
        villageName:villageName,
        price:price,
        landType:landType,
        description:description,
        address:address,
        bhk:bhk,
        houseType:houseType,
        area:area
    }
    found.vigypaan.push(obj);
    found.save().then(()=>{
        res.status(201).json({ success: "Registration successful" });
    }).catch((err) => {
        console.log(err)
        res.status(400).json({ error: "User already exists" });
    });
});


//Dastavej
app.post("/dastavej/login", datsavejLogin);
app.post("/dastavej/register", datsavejRegister);
app.get("/dastavejAuthenticate", (req, res) => {
    DastvajJila.find().then((found)=>{
        res.render('dastavejAuthenticate', { lmsg: null, lerror: null, rmsg: null, rerror: null ,parray: found})
    })
})
app.post("/dastavej/update", dastavejUpdate)
app.get("/dastavej", isAuth1, async (req, res) => {
    const dastavej_data = await DastavejUser.findOne({email:req.cookies.userid})
    if (dastavej_data) {
        res.render('dastavej', { user: dastavej_data });
    }
})
app.get("/dast/logout", async (req, res) => {
    res.clearCookie("dastvej");
    res.clearCookie("userid");
    res.redirect("/dastavejAuthenticate");
})


//Nagrik Sevaye
app.get('/nagrikSevaye', async (req, res) => {
    const datavej_details = await DastavejUser.find();
    console.log(datavej_details)
    res.render('nagrikSevaye', { datavej_details });
})

//documentUpload
app.get('/documentUpload', (req, res) => {
    res.render('documentUpload');
})
app.post('/document/upload', upload.fields([{ name: 'aadhaarPDF', maxCount: 1 }, { name: 'panPDF', maxCount: 1 }]), async (req, res) => {
    // Handle form submission here
    console.log(req.body)
    const adhaar = req.body.aadhaarNumber;
    const pan = req.body.panNumber;

    const adhaarImage = `/uploads/adhaar/${adhaar}.pdf`;
    const panImage = `/uploads/pancard/${pan}.pdf`;

    // Save form data and file information to the database
    try {
        const document = new DocumentSchema({ adhaar, adhaarImage, pan, panImage });
        console.log(document)
        await document.save();
        res.status(200).json({ message: 'Form submitted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// New Application
app.get("/new",async (req,res)=>{
    const found= await User.find();
    let l=0;
    for(let i=0;i<found.length;i++){
        l=l+found[i].application.length;
    }
    l++;
    let t=l.toString();
    let appli=t;
    for(let i=0;i<(16-t.length);i++){
        appli="0"+appli;
    }
    const fou=await User.findOne({email:req.cookies.useremail})
    let obj={
        number:appli,
        Dastavej:[],
        Pakshkar:[],
        Stamp:[],
        Sampati:[],
        Templete:[]
    }
    fou.application.push(obj);
    await fou.save()
    Doc.find().then((found)=>{
            Sampati.find().then((samp)=>{
                res.render("new",{unit1:found,samp:samp,appli:appli})
            })
    })
})

app.get("/:number/new",async (req,res)=>{
    const fou=await User.findOne({email:req.cookies.useremail})
    let obj;
    for(let i=0;i<fou.application.length;i++){
        if(fou.application[i].number==req.params.number){
            obj=fou.application[i].Dastavej;
            break;
        }
    }
    Doc.find().then((found)=>{
         Parskh.find().then((parskh)=>{
            Sampati.find().then((samp)=>{
                res.render("new1",{unit1:found,parskh:parskh,samp:samp,appli:req.params.number,obj:obj})
            })
         })
    })
})

app.post("/:number/new",async (req,res)=>{
    const found= await Doc.findOne({name:req.body.doc})
    let Samapati=[]
    let Aadiwasi=[]
    let Loan=[]
    let Ledge=[]
    let Partifal=[]
    if(found.Loan=="Yes"){
        let ob={
            amount:req.body.loan
        }
        Loan.push(ob);
    }

    if(found.Ledge=="Yes"){
        let ob={
            amount:req.body.ledgeamount,
            rate:req.body.ledgeinterest,
            year:req.body.ledgeyear
        }
        Ledge.push(ob);
    }

    if(found.Sampati=="Yes"){
        const sam= await Sampati.findOne({name:req.body.sampati})
        if(sam.other=="Yes"){
            let ob={
                valid:req.body.sampati,
                number:req.body.sampatiNo,
                office:req.body.sampatioffice,
                date:req.body.sampatiDate,
                file:req.body.sampatifile
            }
            Samapati.push(ob);
        }
        else{
            let ob={
                valid:req.body.sampati,
                number:"",
                office:"",
                date:"",
                file:""
            }
            Samapati.push(ob);
        }
    }
    if(found.adi=="Yes"){
        if(req.body.aadwasi=="Yes"){
            let ob={
                valid:req.body.aadwasi,
                number:req.body.aadwasino,
                office:req.body.aadwasioffice,
                date:req.body.aadwasidate,
                file:req.body.aadwasifile
            }
            Aadiwasi.push(ob);
        }
        else{
            let ob={
                valid:req.body.aadwasi,
                number:"",
                office:"",
                date:"",
                file:""
            }
            Aadiwasi.push(ob);
        }
    }

    if(found.PRATIFAL=="Yes"){
        console.log(typeof(req.body.pratifalamount))
        if(typeof(req.body.pratifal)=="string"){
            let ob={
                type1:req.body.pratifal,
                date:req.body.pratifaldate,
                check:req.body.check,
                amount:req.body.pratifalamount,
                bank:req.body.pratifalbank
            }
            Partifal.push(ob);
        }
        else{
            for(let i=0;i<req.body.pratifal.length;i++){
                let ob={
                    type1:req.body.pratifal[i],
                    date:req.body.pratifaldate[i],
                    check:req.body.check[i],
                    amount:req.body.pratifalamount[i],
                    bank:req.body.pratifalbank[i]
                }
                Partifal.push(ob);
            }
        }
       
    }

    console.log(Partifal)
    console.log(req.body.doc)
    
    let obj={
        document:req.body.doc,
        docdescription:req.body.docdes,
        pakshkar:req.body.parskh,
        subdocument:req.body.sub,
        subdocdescription:req.body.subdes,
        Sampati:Samapati,
        Aadiwasi:Aadiwasi,
        Loan:Loan,
        Ledge:Ledge,
        Partifal:Partifal
    }
    let arr=[];
    arr.push(obj);

    const user1= await User.findOne({email:req.cookies.useremail});
    for(let i=0;i<user1.application.length;i++){
        if(user1.application[i].number==req.params.number){
            user1.application[i].Dastavej=arr;
            break;
        }
    }
    await user1.save().then(()=>{
        console.log(req.body.VIVRAN)
        if(req.body.VIVRAN=="Yes"){
            res.redirect(`/sampti?number=${req.params.number}`)
        }
        else{
            res.redirect(`/stamp?number=${req.params.number}`)
        }

    })
    // res.redirect(`${req.params.number}/new`)
})

let mapping=[
    "प्रथम","द्वितीय","तृतीय","चौथा","पांच","छठ","सात","आठ","नव","दशवा","ग्यारहवा","बारहवा","तेरहवां","चौदहवां","पन्द्रहवां","पन्द्रहवां","सत्रहवां","अट्ठारहवां","उन्नीसवां","बीसवां","इक्कीसवां","बाईसवां","तेइसवां","चौबीसवां","पच्चीसवां"
]

app.get("/sampti",async (req,res)=>{  
    const fou= await User.findOne({email:req.cookies.useremail})
    let obj;
    let obj1;
    let pak;
    let Partiton;
    for(let i=0;i<fou.application.length;i++){
        if(fou.application[i].number==req.query.number){
            obj=fou.application[i].Dastavej[0].document;
            obj1=fou.application[i].Dastavej[0].subdocument;
        }
    }
    const doc= await Doc.findOne({name:obj})
    for(let j=0;j<doc.sub.length;j++){
        if(doc.sub[j].name==obj1){
            pak=doc.sub[j].Paksh
            Partiton=doc.sub[j].Partiton
        }
    }

    res.render("sampatiVivran",{number:req.query.number,pak:pak,mapping:mapping,Partiton:Partiton})

})

app.get("/sampti1",async (req,res)=>{  
    const fou= await User.findOne({email:req.cookies.useremail})
    let parray1=[]
    const fruit= await Fruit.find()
    for(let j=0;j<fruit.length;j++){
        let obj={
            name:fruit[j].name
        }
        parray1.push(obj)
    }

    const found= await Tree.distinct('name');
    for(let j=0;j<found.length;j++){
        let obj={
            name:found[j].name
        }
        parray1.push(obj)
    }
    let a1="no"
    let a2="no"
    let a3="no"
    let a4="no"

    for(let i=0;i<fou.application.length;i++){
        if(fou.application[i].number==req.query.number){
            if(fou.application[i].Dastavej[0].document=="हस्तांतरण पत्र (विक्रय विलेख)"){
                a1="yes"
                a2="yes"
            }
            else if(fou.application[i].Dastavej[0].document=="विक्रय इकरार"){
                if(fou.application[i].Dastavej[0].subdocument=="कब्ज़ा सहित"){
                    a1="yes"
                    a3="yes"
                }
            }
            else if(fou.application[i].Dastavej[0].document=="दान पत्र (दान की लिखत)"){
                if(fou.application[i].Dastavej[0].subdocument=="परिवार के सदस्य से बाहर (गैर पारिवारिक)"){
                    a1="yes"
                    a3="yes"
                }
            }

            if(fou.application[i].Dastavej[0].Sampati.length>0){
                if(fou.application[i].Dastavej[0].Sampati[0].valid=="परिवर्तित"){
                    a4="yes"
                }
            }


        }
    }

    res.render("sampatipa",{appli:req.query.number,parray1:parray1,a1:a1,a2:a2,a3:a3,a4:a4})

})

app.get("/prauta",async (req,res)=>{  
    const fou= await User.findOne({email:req.cookies.useremail})
    const found= await DastvajJila.find();
    res.render("prauta",{appli:req.query.number,parray1:found,name:fou.name,appli:req.query.number})

})

app.post("/prauta",async (req,res)=>{
    const fou= await User.findOne({email:req.cookies.useremail})
    let obj={};
    if(req.body.प्रारुपकर्ता=="पक्षकार स्वयं"){
        obj={
           प्रारुपकर्ता:req.body.प्रारुपकर्ता,
           jila:req.body.jila,
           कार्यालय:req.body.कार्यालय,
           लाइसेंस:req.body.लाइसेंस,
           पंजी:req.body.पंजी,
           पंजीयन:req.body.पंजीयन,
           date:req.body.date,
           name:req.body.name,
        }
    }
    else{
        obj={
            प्रारुपकर्ता:req.body.प्रारुपकर्ता,
            jila:req.body.jila,
            कार्यालय:req.body.कार्यालय,
            लाइसेंस:req.body.लाइसेंस,
            पंजी:req.body.पंजी,
            पंजीयन:req.body.पंजीयन,
            date:req.body.date,
            name:req.body.नाम,
         }
    }
     let arr=[]
     arr.push(obj)

     for(let i=0;i<fou.application.length;i++){
         if(fou.application[i].number==req.query.number){
             fou.application[i].prauta=arr
             break;
         }
     }

     await fou.save().then(()=>{
         res.redirect(`/templete?number=${req.query.number}`)
     })
})

app.post("/sampti1",async (req,res)=>{
    const fou= await User.findOne({email:req.cookies.useremail})
    let obj={
        maukya:req.body.maukya,
        maukyadistance:req.body.maukyadistance,
        unit:req.body.unit,
        makan:req.body.makan,
        makantype:req.body.makantype,
        kua:req.body.kua,
        kuatype:req.body.kuatype,
        tree:req.body.tree,
        treetype:req.body.treetype,
        kisam:req.body.kisam,
        bhumi:req.body.bhumi,
        town:req.body.town,
        town1:req.body.town1,
        town2:req.body.town2,
        town3:req.body.town3,
        rara:req.body.rara,
        rara1:req.body.rara1,
        दानग्रहीता:req.body.दानग्रहीता,
        पंजीयनशुदा:req.body.पंजीयनशुदा,
        तिहाई:req.body.तिहाई,
     }
     let arr=[]
     arr.push(obj)

     for(let i=0;i<fou.application.length;i++){
         if(fou.application[i].number==req.query.number){
             fou.application[i].sampati1=arr
             break;
         }
     }

     await fou.save().then(()=>{
         res.redirect(`/stamp?number=${req.query.number}`)
     })
})

app.get("/api/timber",async (req,res)=>{  
    const found= await Tree.distinct('name');
    console.log(found)
    res.send(found);
})
app.get("/api/fruit",async (req,res)=>{  
    const found= await Fruit.find();
    res.send(found);
})

app.get("/api/kua",async (req,res)=>{  
    const found= await Famous.find();
    res.send(found);
})

app.get("/api/office",async (req,res)=>{  
    console.log(req.query.jila)
    const found= await DastvajJila.findOne({name:req.query.jila});
    console.log(found.office)
    res.send(found.office);
})

app.get("/api/vendor",async (req,res)=>{  
    console.log(req.query)

    const found= await DastavejUser.find({Jila:req.query.jila,Office:req.query.office,profession:req.query.type});
    console.log(found)

    res.send(found);
})

app.get("/api/lience",async (req,res)=>{  
    const found= await DastavejUser.findOne({Jila:req.query.jila,Office:req.query.office,profession:req.query.type,name:req.query.name});
    if(req.query.type=="अधिवक्ता"){
        res.send(found.panjayan);
    }
    else{
        res.send(found.lincense);
    }
})

app.get("/jiladrop",async (req,res)=>{
    await JilaModel.deleteMany().then(()=>{
        res.redirect('/admin/ward')
    }).catch((e)=>{
        console.log(e)
    })
})

app.get("/api/jila",async (req,res)=>{  
    const found= await JilaModel.find();
    res.send(found);
})
app.get("/api/tehsil",async (req,res)=>{  
    const found= await JilaModel.find();
    let obj;
    let ji=req.query.jila

    for(let i=0;i<found.length;i++){
        console.log(found[i].name)
        console.log(ji)
        if(found[i].name==ji){
            console.log("yes")
            obj=found[i].Thesil;
            break;
        }
    }
    console.log(obj)
    res.send(obj);
})
app.get("/api/rajiv",async (req,res)=>{  
    const found= await JilaModel.find();
    let obj;

    for(let i=0;i<found.length;i++){
        if(found[i].name==req.query.jila){
            for(let j=0;j<found[i].Thesil.length;j++){
                if(found[i].Thesil[j].name==req.query.tehsil){
                    obj=found[i].Thesil[j].Rajiv
               
                    break;
                }
            }
            break;
        }
    }

    res.send(obj);
})
app.get("/api/patwari",async (req,res)=>{  
    const found= await JilaModel.find();
    let obj;

    for(let i=0;i<found.length;i++){
        if(found[i].name==req.query.jila){
            for(let j=0;j<found[i].Thesil.length;j++){
                if(found[i].Thesil[j].name==req.query.tehsil){
                    for(let k=0;k<found[i].Thesil[j].Rajiv.length;k++){
                        if(found[i].Thesil[j].Rajiv[k].name==req.query.rajiv){
                            obj=found[i].Thesil[j].Rajiv[k].Patwari
                            break;
                        }
                    }
                    break;
                }
            }
            break;
        }
    }

    res.send(obj);
})
app.get("/api/gao",async (req,res)=>{  
    const found= await JilaModel.find();
    let obj;
    for(let i=0;i<found.length;i++){
        if(found[i].name==req.query.jila){
            for(let j=0;j<found[i].Thesil.length;j++){
                if(found[i].Thesil[j].name==req.query.tehsil){
                    for(let k=0;k<found[i].Thesil[j].Rajiv.length;k++){
                        if(found[i].Thesil[j].Rajiv[k].name==req.query.rajiv){
                            for(let l=0;l<found[i].Thesil[j].Rajiv[k].Patwari.length;l++){
                                if(found[i].Thesil[j].Rajiv[k].Patwari[l].name==req.query.patwari){
                                    obj=found[i].Thesil[j].Rajiv[k].Patwari[l].Gao
                                    break;
                                }
                            }
                                break;
                        }
                    }
                    break;
                }
            }
            break;
        }
    }
    res.send(obj);
})

app.get("/api/city",async (req,res)=>{  
    const found= await JilaModel.find();
    let obj;
    for(let i=0;i<found.length;i++){
        if(found[i].name==req.query.jila){
            for(let j=0;j<found[i].Thesil.length;j++){
                if(found[i].Thesil[j].name==req.query.tehsil){
                    for(let k=0;k<found[i].Thesil[j].Rajiv.length;k++){
                        if(found[i].Thesil[j].Rajiv[k].name==req.query.rajiv){
                            for(let l=0;l<found[i].Thesil[j].Rajiv[k].Patwari.length;l++){
                                if(found[i].Thesil[j].Rajiv[k].Patwari[l].name==req.query.patwari){
                                    for(let m=0;m<found[i].Thesil[j].Rajiv[k].Patwari[l].Gao.length;m++){
                                        if(found[i].Thesil[j].Rajiv[k].Patwari[l].Gao[m].name==req.query.gao){
                                            obj=found[i].Thesil[j].Rajiv[k].Patwari[l].Gao[m].city
                                            break;
                                        }
                                    }
                                    break;
                                }
                            }
                                break;
                        }
                    }
                    break;
                }
            }
            break;
        }
    }
    res.send(obj);
})

app.get("/api/cityType",async (req,res)=>{  
    const found= await JilaModel.find();
    let obj=[];
    for(let i=0;i<found.length;i++){
        if(found[i].name==req.query.jila){
            for(let j=0;j<found[i].Thesil.length;j++){
                if(found[i].Thesil[j].name==req.query.tehsil){
                    for(let k=0;k<found[i].Thesil[j].Rajiv.length;k++){
                        if(found[i].Thesil[j].Rajiv[k].name==req.query.rajiv){
                            for(let l=0;l<found[i].Thesil[j].Rajiv[k].Patwari.length;l++){
                                if(found[i].Thesil[j].Rajiv[k].Patwari[l].name==req.query.patwari){
                                    for(let m=0;m<found[i].Thesil[j].Rajiv[k].Patwari[l].Gao.length;m++){
                                        if(found[i].Thesil[j].Rajiv[k].Patwari[l].Gao[m].name==req.query.gao){
                                            for(let x=0;x<found[i].Thesil[j].Rajiv[k].Patwari[l].Gao[m].city.length;x++){
                                                if(found[i].Thesil[j].Rajiv[k].Patwari[l].Gao[m].city[x].name==req.query.city){
                                                   let obj1={
                                                        name:found[i].Thesil[j].Rajiv[k].Patwari[l].Gao[m].city[x].cityType
                                                    };
                                                    obj.push(obj1)
                                                    break;
                                                }

                                            }
                                            break;
                                        }
                                    }
                                    break;
                                }
                            }
                                break;
                        }
                    }
                    break;
                }
            }
            break;
        }
    }
    console.log(obj)
    res.send(obj);
})


app.get("/api/ward",async (req,res)=>{  
    const found= await JilaModel.find();
    let obj=[];
    for(let i=0;i<found.length;i++){
        if(found[i].name==req.query.jila){
            for(let j=0;j<found[i].Thesil.length;j++){
                if(found[i].Thesil[j].name==req.query.tehsil){
                    for(let k=0;k<found[i].Thesil[j].Rajiv.length;k++){
                        if(found[i].Thesil[j].Rajiv[k].name==req.query.rajiv){
                            for(let l=0;l<found[i].Thesil[j].Rajiv[k].Patwari.length;l++){
                                if(found[i].Thesil[j].Rajiv[k].Patwari[l].name==req.query.patwari){
                                    for(let m=0;m<found[i].Thesil[j].Rajiv[k].Patwari[l].Gao.length;m++){
                                        if(found[i].Thesil[j].Rajiv[k].Patwari[l].Gao[m].name==req.query.gao){
                                            for(let x=0;x<found[i].Thesil[j].Rajiv[k].Patwari[l].Gao[m].city.length;x++){
                                                if(found[i].Thesil[j].Rajiv[k].Patwari[l].Gao[m].city[x].name==req.query.city){
                                                    obj=found[i].Thesil[j].Rajiv[k].Patwari[l].Gao[m].city[x].ward
                                                }
                                            }
                                            break;
                                        }
                                    }
                                    break;
                                }
                            }
                                break;
                        }
                    }
                    break;
                }
            }
            break;
        }
    }
    console.log(obj)
    res.send(obj);
})

app.get("/api/mohalla",async (req,res)=>{  
    const found= await JilaModel.find();
    let obj=[];
    console.log(req.query)
    for(let i=0;i<found.length;i++){
        if(found[i].name==req.query.jila){
            for(let j=0;j<found[i].Thesil.length;j++){
                if(found[i].Thesil[j].name==req.query.tehsil){
                    for(let k=0;k<found[i].Thesil[j].Rajiv.length;k++){
                        if(found[i].Thesil[j].Rajiv[k].name==req.query.rajiv){
                            for(let l=0;l<found[i].Thesil[j].Rajiv[k].Patwari.length;l++){
                                if(found[i].Thesil[j].Rajiv[k].Patwari[l].name==req.query.patwari){
                                    for(let m=0;m<found[i].Thesil[j].Rajiv[k].Patwari[l].Gao.length;m++){
                                        if(found[i].Thesil[j].Rajiv[k].Patwari[l].Gao[m].name==req.query.gao){
                                            for(let x=0;x<found[i].Thesil[j].Rajiv[k].Patwari[l].Gao[m].city.length;x++){
                                                if(found[i].Thesil[j].Rajiv[k].Patwari[l].Gao[m].city[x].name==req.query.city){
                                                    for(let y=0;y<found[i].Thesil[j].Rajiv[k].Patwari[l].Gao[m].city[x].ward.length;y++){
                                                        if(found[i].Thesil[j].Rajiv[k].Patwari[l].Gao[m].city[x].ward[y].name==req.query.ward){
                                                            obj=found[i].Thesil[j].Rajiv[k].Patwari[l].Gao[m].city[x].ward[y].mohalla
                                                            break;
                                                        }
                                                }
                                            }
                                            break;
                                        }
                                    }
                                    break;
                                }
                            }
                                break;
                        }
                    }
                    break;
                }
            }
            break;
        }
     }
    }
    console.log(obj)
    res.send(obj);
})

app.get("/api/society",async (req,res)=>{  
    const found= await JilaModel.find();
    let obj=[];
    for(let i=0;i<found.length;i++){
        if(found[i].name==req.query.jila){
            for(let j=0;j<found[i].Thesil.length;j++){
                if(found[i].Thesil[j].name==req.query.tehsil){
                    for(let k=0;k<found[i].Thesil[j].Rajiv.length;k++){
                        if(found[i].Thesil[j].Rajiv[k].name==req.query.rajiv){
                            for(let l=0;l<found[i].Thesil[j].Rajiv[k].Patwari.length;l++){
                                if(found[i].Thesil[j].Rajiv[k].Patwari[l].name==req.query.patwari){
                                    for(let m=0;m<found[i].Thesil[j].Rajiv[k].Patwari[l].Gao.length;m++){
                                        if(found[i].Thesil[j].Rajiv[k].Patwari[l].Gao[m].name==req.query.gao){
                                            for(let x=0;x<found[i].Thesil[j].Rajiv[k].Patwari[l].Gao[m].city.length;x++){
                                                if(found[i].Thesil[j].Rajiv[k].Patwari[l].Gao[m].city[x].name==req.query.city){
                                                    for(let y=0;y<found[i].Thesil[j].Rajiv[k].Patwari[l].Gao[m].city[x].ward.length;y++){
                                                        if(found[i].Thesil[j].Rajiv[k].Patwari[l].Gao[m].city[x].ward[y].name==req.query.ward){
                                                            for(let z=0;z<found[i].Thesil[j].Rajiv[k].Patwari[l].Gao[m].city[x].ward[y].mohalla.length;z++){
                                                                if(found[i].Thesil[j].Rajiv[k].Patwari[l].Gao[m].city[x].ward[y].mohalla[z].name==req.query.mohalla){
                                                                    obj=found[i].Thesil[j].Rajiv[k].Patwari[l].Gao[m].city[x].ward[y].mohalla[z].Society
                                                                    break;
                                                                }
                                                            }
                                                            break;
                                                        }
                                                }
                                            }
                                            break;
                                        }
                                    }
                                    break;
                                }
                            }
                                break;
                        }
                    }
                    break;
                }
            }
            break;
        }
     }
    }
    console.log(obj)
    res.send(obj);
})

// Sampati form
app.post("/sampti",async(req,res)=>{
    let data=req.body;
   console.log(data)
    const sak=data[0].cityTypeDropdown
    // // const k=req.body.k
    let rakba=[]
    let hbumi=[];
    let ward=[];
    let mohalla=[];
    let society=[];
    let bhumi=[];
    let fasl=[];
    let road=[];
    let ty=[];
    let warr=[]
    let Hector=[]
    let mward=[]
    let total=0;
    let tree=[];
    // const treeType=req.body.treeType;
    // const treeQuantity=req.body.treeQuantity;
    // const treeName=req.body.treeName;
    // const treeQuality=req.body.treeQuality;
    // const treeSize=req.body.treeSize;

    let tree_total=0;    
    let vishesh=[];
    // const vishName=req.body.vishName;
    // const vishType=req.body.vishType;
    // const vishPrice=req.body.vishPrice;
    // const vishQuantity=req.body.vishQuantity;
    let vish_total=0;

    const fobj= await Fasal.find();
    const robj=await Road.find();
    const jil=await JilaModel.findOne({name:data[0].jila});

    let obj1=[]
    let objH=[]
        for(let i=0;i<jil.Thesil.length;i++){
            if(jil.Thesil[i].name==data[0].tehsil){
                for(let j=0;j<jil.Thesil[i].Rajiv.length;j++){
                    if(jil.Thesil[i].Rajiv[j].name==data[0].rajiv){
                        for(let ji=0;ji<jil.Thesil[i].Rajiv[j].Patwari.length;ji++){
                            if(jil.Thesil[i].Rajiv[j].Patwari[ji].name==data[0].patwari){
                                for(let jk=0;jk<jil.Thesil[i].Rajiv[j].Patwari[ji].Gao.length;jk++){
                                    if(jil.Thesil[i].Rajiv[j].Patwari[ji].Gao[jk].name==data[0].gao){
                                        for(let kl=0;kl<jil.Thesil[i].Rajiv[j].Patwari[ji].Gao[jk].city.length;kl++){
                                            if(jil.Thesil[i].Rajiv[j].Patwari[ji].Gao[jk].city[kl].name==data[0].city){
                                                objH=jil.Thesil[i].Rajiv[j].Patwari[ji].Gao[jk].city[kl].hector
                                                obj1=jil.Thesil[i].Rajiv[j].Patwari[ji].Gao[jk].city[kl].ward
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

    console.log(objH);


    for(let i=1;i<data.length;i++){
        for(let j=0;j<data[i].vrikshData.length;j++){
            tree.push(data[i].vrikshData[j])
        }
        for(let j=0;j<data[i].assetData.length;j++){
            vishesh.push(data[i].assetData[j])
        }

        if(data[i].rakbamet=="0"){
            console.log("o")

            rakba.push(Number(data[i].rakba)*10120)
        }
        else{
            console.log("o1")
            rakba.push(Number(data[i].rakbamet))
        }
        rakba.push(Number(data[i].rakba))
        ty.push(data[i].bhumiPrakar)

        if(sak=="नगर पालिका" ||sak=="नगर पंचायत" || sak=="नगर ननगम" || sak=="कवर्धा विशेष योजना नपा"){
            if(data[i].raygad1wardNo==null){
                ward.push("N")
            }
            else{
                ward.push(data[i].raygad1wardNo)
            }
    
            if(data[i].raygaddh1mohlaName==null){
                mohalla.push("N")
            }
            else{
                mohalla.push(data[i].raygaddh1mohlaName)
            }
    
            if(data[i].raygadh1societyName==null){
                society.push("N")
            }
            else{
                society.push(data[i].raygadh1societyName)
            } 
        }
        else{
            if(data[i].wardNo==null){
                ward.push("N")
            }
            else{
                ward.push(data[i].wardNo)
            }
    
            if(data[i].mohlaName==null){
                mohalla.push("N")
            }
            else{
                mohalla.push(data[i].mohlaName)
            }
    
            if(data[i].societyName==null){
                society.push("N")
            }
            else{
                society.push(data[i].societyName)
            }        
        }
    }

    if(sak=="कांकेर विशेष योजना नपा"){
  
        for(let i=1;i<data.length;i++){

            if(data[i].konkarfasal==null){
                fasl.push("N")
            }
            else{
                fasl.push(data[i].konkarfasal)
            } 

            if(data[i].konkarroad==null){
                road.push("N")
            }
            else{
                road.push(data[i].konkarroad)
            } 

            if(data[i].konkarbhumiKaKism==null){
                bhumi.push("N")
            }
            else{
                bhumi.push(data[i].konkarbhumiKaKism)
            } 

            if(data[i].bhumiPrakar=='कृषि'){
                if(data[i].konkarhectareBhumiKaKism==null){
                    hbumi.push("N")
                }
                else{
                    hbumi.push(data[i].konkarhectareBhumiKaKism)
                } 
            }
            else{
                if(data[i].konkarhectareBhumiKaKismParivartit==null){
                    hbumi.push("N")
                }
                else{
                    hbumi.push(data[i].konkarhectareBhumiKaKismParivartit)
                }  
            }
        }

        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1[0].mohalla[0].Society[0].Bhumi.length;j++){
                    if(bhumi[i]==obj1[0].mohalla[0].Society[0].Bhumi[j].name){
                       warr.push(obj1[0].mohalla[0].Society[0].Bhumi[j].Price);
                    }
                }
            }
        }
        for(let i=0;i<hbumi.length;i++){
            if(hbumi[i]=="N"){
                Hector.push(0);
            }
            else{
                let to;
                let tt=0;
                if(ty[i]=="पररवनतित"){

                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=Number(objH[j].Price)*(rakba[i]/10120)*2.5;
                            tt=tt+to;
                        }
                    }

                }
                else{
                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            console.log("Yes")
                            to=Number(objH[j].Price)*(rakba[i]/10120);
                            console.log(rakba[i])
                            console.log(Number(objH[j].Price))
                            console.log(to)
                            tt=tt+to;
                        }
                    }
                }
                console.log(tt)
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(Number(fobj[j].Percentage)*to)/100;
                        }
                    }
                    console.log(tt)


                    for(let j=0;j<robj.length;j++){
                        if(road[i]!="N"){
                            if(road[i]==robj[j].name){
                                tt=tt+(Number(robj[j].Percentage)*to)/100;
                            }
                        }
                    }
                    console.log(tt)

                Hector.push(tt);
            }
        }

        for(let i=0;i<warr.length;i++){
            if(warr[i]!=0){
                let flag=0;
                for(let j=0;j<mward.length;j++){
                    if(mward[j].name==warr[i]){
                        if((mward[j].type=='कृषि' && ty[i]=='कृषि') || (mward[j].type!='कृषि' && ty[i]!='कृषि')){
                            mward[j].val=mward[j].val+Number(rakba[i]);
                            flag=1;
                            break;
                        }
                    }
                }
                    if(flag==0){
                        let ob={
                            name:warr[i],
                            val:Number(rakba[i]),
                            type:ty[i]
                        }
                        mward.push(ob);
                    }
            } 
        }

        for(let i=0;i<Hector.length;i++){
            total=total+Hector[i];
        }

        for(let i=0;i<mward.length;i++){
            if(mward[i].type=='कृषि'){
                if(mward[i].val<=506){
                    total=total+(mward[i].name*mward[i].val);
                }
                else if(mward[i].val<=1012){
                    total=total+(mward[i].name*(mward[i].val-506)*0.8)+(506*mward[i].name);
          
                }else{
                    total=total+(mward[i].name*(mward[i].val-1012)*0.5)+(506*mward[i].name*0.8)+(506*mward[i].name);
          
                }
            }else{
                total=total+(mward[i].name*mward[i].val);                 
            }
        }
    }

    else if(sak=="कांकेर विशेष योजना नपंचा"){

        for(let i=1;i<data.length;i++){

            if(data[i].konkarfasal==null){
                fasl.push("N")
            }
            else{
                fasl.push(data[i].konkarfasal)
            } 

            if(data[i].konkarroad==null){
                road.push("N")
            }
            else{
                road.push(data[i].konkarroad)
            } 

            if(data[i].konkarbhumiKaKism==null){
                bhumi.push("N")
            }
            else{
                bhumi.push(data[i].konkarbhumiKaKism)
            } 

            if(data[i].bhumiPrakar=='कृषि'){
                if(data[i].konkarhectareBhumiKaKism==null){
                    hbumi.push("N")
                }
                else{
                    hbumi.push(data[i].konkarhectareBhumiKaKism)
                } 
            }
            else{
                if(data[i].konkarhectareBhumiKaKismParivartit==null){
                    hbumi.push("N")
                }
                else{
                    hbumi.push(data[i].konkarhectareBhumiKaKismParivartit)
                }  
            }
        }
        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1[0].mohalla[0].Society[0].Bhumi.length;j++){
                    if(bhumi[i]==obj1[0].mohalla[0].Society[0].Bhumi[j].name){
                       warr.push(obj1[0].mohalla[0].Society[0].Bhumi[j].Price);
                    }
                }
            }
        }
        for(let i=0;i<hbumi.length;i++){
            if(hbumi[i]=="N"){
                Hector.push(0);
            }
            else{
                let to;
                let tt=0;
                if(ty[i]=="पररवनतित"){

                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].Number(objH[j].Price)*(rakba[i]/10120)*2.5;
                            tt=tt+to;
                        }
                    }

                }
                else{
                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].Number(objH[j].Price)*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                }
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].Percentage*to)/100;
                        }
                    }
        
                    for(let j=0;j<robj.length;j++){
                        if(road[i]!="N"){
                            if(road[i]==robj[j].name){
                                tt=tt+(robj[j].Percentage*to)/100;
                            }
                        }
                    }
                
    
                Hector.push(tt);
            }
        }

        for(let i=0;i<warr.length;i++){
            if(warr[i]!=0){
                let flag=0;
                for(let j=0;j<mward.length;j++){
                    if(mward[j].name==warr[i]){
                        if((mward[j].type=="कृषि" && ty[i]=="कृषि") || (mward[j].type!="कृषि" && ty[i]!="कृषि")){
                            mward[j].val=mward[j].val+Number(rakba[i]);
                            flag=1;
                            break;
                        }
                    }
                }
                    if(flag==0){
                        let ob={
                            name:warr[i],
                            val:Number(rakba[i]),
                            type:ty[i]
                        }
                        mward.push(ob);
                    }
            } 
        }

        for(let i=0;i<Hector.length;i++){
            total=total+Hector[i];
        }

        for(let i=0;i<mward.length;i++){
            if(mward[i].type=="कृषि"){
                if(mward[i].val<=506){
                    total=total+(mward[i].name*mward[i].val);
                }
                else{
                    total=total+(mward[i].name*(mward[i].val-506)*0.25)+(506*mward[i].name);
          
                }
            }else{
                total=total+(mward[i].name*mward[i].val);                 
            }
        }


    }

     else if(sak=="बेमेतरा  विशेष योजना नपा"){

        for(let i=1;i<data.length;i++){

            if(data[i].konkarfasal==null){
                fasl.push("N")
            }
            else{
                fasl.push(data[i].konkarfasal)
            } 
    
            if(data[i].konkarroad==null){
                road.push("N")
            }
            else{
                road.push(data[i].konkarroad)
            } 
    
            if(data[i].konkarbhumiKaKism==null){
                bhumi.push("N")
            }
            else{
                bhumi.push(data[i].konkarbhumiKaKism)
            } 
    
            if(data[i].bhumiPrakar=='कृषि'){
                if(data[i].konkarhectareBhumiKaKism==null){
                    hbumi.push("N")
                }
                else{
                    hbumi.push(data[i].konkarhectareBhumiKaKism)
                } 
            }
            else{
                if(data[i].konkarhectareBhumiKaKismParivartit==null){
                    hbumi.push("N")
                }
                else{
                    hbumi.push(data[i].konkarhectareBhumiKaKismParivartit)
                }  
            }
        }

        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1[0].mohalla[0].Society[0].Bhumi.length;j++){
                    if(bhumi[i]==obj1[0].mohalla[0].Society[0].Bhumi[j].name){
                       warr.push(obj1[0].mohalla[0].Society[0].Bhumi[j].Price);
                    }
                }
            }
        }
        for(let i=0;i<hbumi.length;i++){
            if(hbumi[i]=="N"){
                Hector.push(0);
            }
            else{
                let to;
                let tt=0;
                if(ty[i]=="पररवनतित"){

                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].Number(objH[j].Price)*(rakba[i]/10120)*2.5;
                            tt=tt+to;
                        }
                    }

                }
                else{
                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].Number(objH[j].Price)*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                }
                for(let j=0;j<fobj.length;j++){
                    if(fasl[i]==fobj[j].name){
                        tt=tt+(fobj[j].Percentage*to)/100;
                    }
                }
    

                for(let j=0;j<robj.length;j++){
                    if(road[i]!="N"){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].Percentage*to)/100;
                        }
                    }
                }
                
    
                Hector.push(tt);
            }
        }

        for(let i=0;i<warr.length;i++){
            if(warr[i]!=0){
                let flag=0;
                for(let j=0;j<mward.length;j++){
                    if(mward[j].name==warr[i]){
                        if((mward[j].type=="कृषि" && ty[i]=="कृषि") || (mward[j].type!="कृषि" && ty[i]!="कृषि")){
                            mward[j].val=mward[j].val+Number(rakba[i]);
                            flag=1;
                            break;
                        }
                    }
                }
                    if(flag==0){
                        let ob={
                            name:warr[i],
                            val:Number(rakba[i]),
                            type:ty[i]
                        }
                        mward.push(ob);
                    }
            } 
        }

        for(let i=0;i<Hector.length;i++){
            total=total+Hector[i];
        }

        for(let i=0;i<mward.length;i++){
            if(mward[i].type=="कृषि"){
                if(mward[i].val<=506){
                    total=total+(mward[i].name*mward[i].val);
                }
                else{
                    total=total+(mward[i].name*(mward[i].val-506)*0.5)+(506*mward[i].name);
          
                }
            }else{
                total=total+(mward[i].name*mward[i].val);                 
            }
        }
    }

    else if(sak=="बेमेतरा  विशेष योजना नपंचा"){
        for(let i=1;i<data.length;i++){

            if(data[i].konkarfasal==null){
                fasl.push("N")
            }
            else{
                fasl.push(data[i].konkarfasal)
            } 
    
            if(data[i].konkarroad==null){
                road.push("N")
            }
            else{
                road.push(data[i].konkarroad)
            } 
    
            if(data[i].konkarbhumiKaKism==null){
                bhumi.push("N")
            }
            else{
                bhumi.push(data[i].konkarbhumiKaKism)
            } 
    
            if(data[i].bhumiPrakar=='कृषि'){
                if(data[i].konkarhectareBhumiKaKism==null){
                    hbumi.push("N")
                }
                else{
                    hbumi.push(data[i].konkarhectareBhumiKaKism)
                } 
            }
            else{
                if(data[i].konkarhectareBhumiKaKismParivartit==null){
                    hbumi.push("N")
                }
                else{
                    hbumi.push(data[i].konkarhectareBhumiKaKismParivartit)
                }  
            }
        }

        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1[0].mohalla[0].Society[0].Bhumi.length;j++){
                    if(bhumi[i]==obj1[0].mohalla[0].Society[0].Bhumi[j].name){
                       warr.push(obj1[0].mohalla[0].Society[0].Bhumi[j].Price);
                    }
                }
            }
        }
        for(let i=0;i<hbumi.length;i++){
            if(hbumi[i]=="N"){
                Hector.push(0);
            }
            else{
                let to;
                let tt=0;
                if(ty[i]=="पररवनतित"){

                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].Number(objH[j].Price)*(rakba[i]/10120)*2.5;
                            tt=tt+to;
                        }
                    }

                }
                else{
                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].Number(objH[j].Price)*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                }
                for(let j=0;j<fobj.length;j++){
                    if(fasl[i]==fobj[j].name){
                        tt=tt+(fobj[j].Percentage*to)/100;
                    }
                }
    

                for(let j=0;j<robj.length;j++){
                    if(road[i]!="N"){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].Percentage*to)/100;
                        }
                    }
                }
                
    
                Hector.push(tt);
            }
        }

        for(let i=0;i<warr.length;i++){
            if(warr[i]!=0){
                let flag=0;
                for(let j=0;j<mward.length;j++){
                    if(mward[j].name==warr[i]){
                        if((mward[j].type=="कृषि" && ty[i]=="कृषि") || (mward[j].type!="कृषि" && ty[i]!="कृषि")){
                            mward[j].val=mward[j].val+Number(rakba[i]);
                            flag=1;
                            break;
                        }
                    }
                }
                    if(flag==0){
                        let ob={
                            name:warr[i],
                            val:Number(rakba[i]),
                            type:ty[i]
                        }
                        mward.push(ob);
                    }
            } 
        }

        for(let i=0;i<Hector.length;i++){
            total=total+Hector[i];
        }

        for(let i=0;i<mward.length;i++){
            if(mward[i].type=="कृषि"){
                if(mward[i].val<=506){
                    total=total+(mward[i].name*mward[i].val);
                }
                else{
                    total=total+(mward[i].name*(mward[i].val-506)*0.25)+(506*mward[i].name);
          
                }
            }else{
                total=total+(mward[i].name*mward[i].val);                 
            }
        }
    }

    else{
        if(sak=="जनपद"){
            for(let i=1;i<data.length;i++){

                if(data[i].fasal==null){
                    fasl.push("N")
                }
                else{
                    fasl.push(data[i].fasal)
                } 
        
                if(data[i].road==null){
                    road.push("N")
                }
                else{
                    road.push(data[i].road)
                } 
                if(data[i].bhumiPrakar=='कृषि'){
                    if(data[i].janpadBhumiKaKism==null){
                        bhumi.push("N")
                    }
                    else{
                        bhumi.push(data[i].janpadBhumiKaKism)
                    } 
                    if(data[i].hectareBhumiKaKism==null){
                        hbumi.push("N")
                    }
                    else{
                        hbumi.push(data[i].hectareBhumiKaKism)
                    } 
                }
                else{
                    hbumi.push(data[i].janpadBhumiKaKism)
                }
            }
            for(let i=0;i<ward.length;i++){
                if(bhumi[i]=="N"){
                    warr.push(0);
                }
                else{
                    for(let j=0;j<obj1[0].mohalla[0].Society[0].Bhumi.length;j++){
                        if(bhumi[i]==obj1[0].mohalla[0].Society[0].Bhumi[j].name){
                           warr.push(obj1[0].mohalla[0].Society[0].Bhumi[j].Price);
                        }
                    }
                }
            }

            for(let i=0;i<hbumi.length;i++){
                if(hbumi[i]=="N"){
                    Hector.push(0);
                }
                else{
                    let to;
                    let tt=0;
                    if(ty[i]=="पररवनतित"){
    
                        for(let j=0;j<objH.length;j++){
                            if(hbumi[i]==objH[j].name){
                                to=objH[j].Number(objH[j].Price)*(rakba[i]/10120)*2.5;
                                tt=tt+to;
                            }
                        }
    
                    }
                    else{
                        for(let j=0;j<objH.length;j++){
                            if(hbumi[i]==objH[j].name){
                                to=objH[j].Number(objH[j].Price)*(rakba[i]/10120);
                                tt=tt+to;
                            }
                        }
                    }
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].Percentage*to)/100;
                        }
                    }
        
    
                    for(let j=0;j<robj.length;j++){
                        if(road[i]!="N"){
                            if(road[i]==robj[j].name){
                                tt=tt+(robj[j].Percentage*to)/100;
                            }
                        }
                    }
                    Hector.push(tt);
                }
            }
        }

        else if(sak=="कवर्धा विशेष योजना नपा"){
            for(let i=1;i<data.length;i++){
                // FASAL
                    if(data[i].KavarthFasal==null){
                        fasl.push("N")
                    }
                    else{
                        fasl.push(data[i].KavarthFasal)
                    } 
            // ROAD
                    if(data[i].KavarthRoad==null){
                        road.push("N")
                    }
                    else{
                        road.push(data[i].KavarthRoad)
                    } 
                    // BHUMI(VARG)
                        if(data[i].raygadh1bhumiKaKism==null){
                            bhumi.push("N")
                        }
                        else{
                            bhumi.push(data[i].raygadh1bhumiKaKism)
                        } 
                        // HECTOR BHUMI
                        if(data[i].KavarthhectareBhumiKaKism==null){
                            hbumi.push("N")
                        }
                        else{
                            hbumi.push(data[i].KavarthhectareBhumiKaKism)
                        } 
    
                }
    
                for(let i=0;i<ward.length;i++){
                    if(ward[i]=="N"){
                        warr.push(0);
                    }
                    else{
                        for(let j=0;j<obj1.length;j++){
                            if(ward[i]==obj1[j].name){
                                for(let k=0;k<obj1[j].mohalla.length;k++){
                                    if(mohalla[i]==obj1[j].mohalla[k].name){
                                        for(let m=0;m<obj1[j].mohalla[k].Society.length;m++){
                                            if(society[i]==obj1[j].mohalla[k].Society[m].name){
                                                for(let km=0;km<obj1[j].mohalla[k].Society[m].Bhumi.length;km++){
                                                    if(bhumi[i]==obj1[j].mohalla[k].Society[m].Bhumi[km].name)
                                                    {
                                                        warr.push(obj1[j].mohalla[k].Society[m].Bhumi[km].Price);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                
                for(let i=0;i<hbumi.length;i++){
                    if(hbumi[i]=="N"){
                        Hector.push(0);
                    }
                    else{
                        let to;
                        let tt=0;
                            for(let j=0;j<objH.length;j++){
                                if(hbumi[i]==objH[j].name){
                                    to=Number(objH[j].Price)*(rakba[i]/10120);
                                    tt=tt+to;
                                }
                            }
                            for(let j=0;j<fobj.length;j++){
                                if(fasl[i]==fobj[j].name){
                                    tt=tt+(fobj[j].Percentage*to)/100;
                                }
                            }
                
            
                            for(let j=0;j<robj.length;j++){
                                if(road[i]!="N"){
                                    if(road[i]==robj[j].name){
                                        tt=tt+(robj[j].Percentage*to)/100;
                                    }
                                }
                            }
            
                        Hector.push(tt);
                    }
                }
        }
        else{
            for(let i=1;i<data.length;i++){
            // FASAL
                if(data[i].fasal==null){
                    fasl.push("N")
                }
                else{
                    fasl.push(data[i].fasal)
                } 
        // ROAD
                if(data[i].road==null){
                    road.push("N")
                }
                else{
                    road.push(data[i].road)
                } 
                // BHUMI(VARG)
                    if(data[i].raygadh1bhumiKaKism==null){
                        bhumi.push("N")
                    }
                    else{
                        bhumi.push(data[i].raygadh1bhumiKaKism)
                    } 
                    // HECTOR BHUMI
                    if(data[i].hectareBhumiKaKism==null){
                        hbumi.push("N")
                    }
                    else{
                        hbumi.push(data[i].hectareBhumiKaKism)
                    } 

            }

            for(let i=0;i<ward.length;i++){
                if(ward[i]=="N"){
                    warr.push(0);
                }
                else{
                    for(let j=0;j<obj1.length;j++){
                        if(ward[i]==obj1[j].name){
                            for(let k=0;k<obj1[j].mohalla.length;k++){
                                if(mohalla[i]==obj1[j].mohalla[k].name){
                                    for(let m=0;m<obj1[j].mohalla[k].Society.length;m++){
                                        if(society[i]==obj1[j].mohalla[k].Society[m].name){
                                            for(let km=0;km<obj1[j].mohalla[k].Society[m].Bhumi.length;km++){
                                                if(bhumi[i]==obj1[j].mohalla[k].Society[m].Bhumi[km].name)
                                                {
                                                    warr.push(obj1[j].mohalla[k].Society[m].Bhumi[km].Price);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            for(let i=0;i<hbumi.length;i++){
                if(hbumi[i]=="N"){
                    Hector.push(0);
                }
                else{
                    let to;
                    let tt=0;
                        for(let j=0;j<objH.length;j++){
                            if(hbumi[i]==objH[j].name){
                                to=Number(objH[j].Price)*(rakba[i]/10120);
                                tt=tt+to;
                            }
                        }
                        for(let j=0;j<fobj.length;j++){
                            if(fasl[i]==fobj[j].name){
                                tt=tt+(fobj[j].Percentage*to)/100;
                            }
                        }
            
        
                        for(let j=0;j<robj.length;j++){
                            if(road[i]!="N"){
                                if(road[i]==robj[j].name){
                                    tt=tt+(robj[j].Percentage*to)/100;
                                }
                            }
                        }
        
                    Hector.push(tt);
                }
            }
        }

        if(sak=="कवर्धा विशेष योजना नपा"){
            for(let i=0;i<warr.length;i++){
                if(warr[i]!=0){
                    let flag=0;
                    for(let j=0;j<mward.length;j++){
                        if(mward[j].name==warr[i]){
                            if((mward[j].type=="कृषि" && ty[i]=="कृषि") || (mward[j].type!="कृषि" && ty[i]!="कृषि")){
                                mward[j].val=mward[j].val+Number(rakba[i]);
                                flag=1;
                                break;
                            }
                        }
                    }
                        if(flag==0){
                            let ob={
                                name:warr[i],
                                val:Number(rakba[i]),
                                type:ty[i]
                            }
                            mward.push(ob);
                        }
                } 
            }
        }
    
        else{
        for(let i=0;i<warr.length;i++){
                if(warr[i]!=0){
                    let flag=0;
                    for(let j=0;j<mward.length;j++){
                        if(mward[j].name==warr[i]){
                            mward[j].val=mward[j].val+Number(rakba[i]);
                            if(mward[j].type!='कृषि' && ty[i]=='कृषि'){
                                mward[j].type=ty[i];
                            }
                            flag=1;
                            break;
                        }
                    }
                        if(flag==0){
                            let ob={
                                name:warr[i],
                                val:Number(rakba[i]),
                                type:ty[i]
                            }
                            mward.push(ob);
                        }
                } 
            }
        }

        for(let i=0;i<Hector.length;i++){
            total=total+Hector[i];
        }
    
    
      if(sak=="नगर पालिका" || sak=="कवर्धा विशेष योजना नपा"){
            for(let i=0;i<mward.length;i++){
                if(mward[i].type=="कृषि"){
                    if(mward[i].val<=506){
                        total=total+(mward[i].name*mward[i].val);
                    }
                    else if(mward[i].val<=1012){
                        total=total+(mward[i].name*(mward[i].val-506)*0.8)+(506*mward[i].name);
              
                    }else{
                        total=total+(mward[i].name*(mward[i].val-1012)*0.5)+(506*mward[i].name*0.8)+(506*mward[i].name);
              
                    }
                }else{
                    if(mward[i].val<4099){
                        total=total+(mward[i].name*mward[i].val);
                    }
                   else{
                        total=total+(mward[i].name*(mward[i].val-4099)*0.75)+(4099*mward[i].name);
                    }
                }
            }
      }  
    
      else if(sak=="नगर ननगम"){
                for(let i=0;i<mward.length;i++){
                if(mward[i].type=="कृषि"){
                    if(mward[i].val<=506){
                        total=total+(mward[i].name*mward[i].val);
                    }
                    else if(mward[i].val<=1012){
                        total=total+(mward[i].name*(mward[i].val-506)*0.8)+(506*mward[i].name);
            
                    }else{
                        total=total+(mward[i].name*(mward[i].val-1012)*0.5)+(506*mward[i].name*0.8)+(506*mward[i].name);
            
                    }
                }else{
                    if(mward[i].val<=4099){
                        total=total+(mward[i].name*mward[i].val);
                    }
                   else{
                        total=total+(mward[i].name*(mward[i].val-4099)*0.8)+(4099*mward[i].name);
                    }
                }
            }
        
      }
      else if(sak=="जनपद"){
                for(let i=0;i<mward.length;i++){
                        total=total+(mward[i].name*mward[i].val);                    
                 }
        }
      else{
            for(let i=0;i<mward.length;i++){
                if(mward[i].type=="कृषि"){
                    if(mward[i].val<=506){
                        total=total+(mward[i].name*mward[i].val);
                    }
                   else{
                        total=total+(mward[i].name*(mward[i].val-506)*0.25)+(506*mward[i].name);
                    }
                }
                else{
                    if(mward[i].val<=4099){
                        total=total+(mward[i].name*mward[i].val);
                    }
                   else{
                        total=total+(mward[i].name*(mward[i].val-4099)*0.6)+(4099*mward[i].name);
                    }
                }
            }
     
      }


    }

    console.log(total);
 

    for(let i=0;i<vishesh.length;i++){
            if(vishesh[i].asset_type=="Machine" || vishesh[i].asset_type=="Other"){
                vish_total=vish_total+(Number(vishesh[i].machine_price)*Number(vishesh[i].machine_quantity))

            }
            else{
               const found= await Famous.findOne({name:vishesh[i].asset_type})
               vish_total=vish_total+(Number(found.price)*Number(vishesh[i].common_quantity))
            }
    }
    console.log(vish_total);


    for(let i=0;i<tree.length;i++){
            if(tree[i].vriksh_type=="timber"){
                const found=await  Tree.findOne({name:tree[i].vriksh_name,quality:tree[i].vriksh_avastha,size:tree[i].vriksh_golayi})
                tree_total=tree_total+(Number(found.price)*Number(tree[i].vriksh_quantity));
            }
            else{
                const found=await Fruit.findOne({name: tree[i].vriksh_name_fruits})
                tree_total=tree_total+(Number(found.price)*Number(tree[i].vriksh_quantity_fruits));
            }
    }
    console.log(tree_total);
    total=total+vish_total+tree_total
    console.log(Math.ceil(total));
    let ob={
        marketValue: Math.ceil(total)
    };
    let array=[]
    array.push(ob)
    const fou= await User.findOne({email:req.cookies.useremail})
    console.log(array)
    console.log(req.query)

    for(let i=0;i<fou.application.length;i++){
        if(fou.application[i].number==req.query.number){
            fou.application[i].Sampati=array
            break;
        }
    }

    await fou.save().then(()=>{
        console.log("Yes")
        res.status(200).json(req.query.number)
    })
})

 // else if(sak=="baNagarPan"){
    //     for(let i=0;i<ward.length;i++){
    //         if(bhumi[i]=="N"){
    //             warr.push(0);
    //         }
    //         else{
    //             for(let j=0;j<obj1.length;j++){
    //                 if(bhumi[i]==obj1[j].name){
    //                    warr.push(obj1[j].price);
    //                 }
    //             }
    //         }
    //     }
    //     for(let i=0;i<hbumi.length;i++){
    //         if(hbumi[i]=="N"){
    //             Hector.push(0);
    //         }
    //         else{
    //             let to;
    //             let tt=0;
    //             if(ty[i]=="pa"){

    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120)*2.5;
    //                         tt=tt+to;
    //                     }
    //                 }

    //             }
    //             else{
    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120);
    //                         tt=tt+to;
    //                     }
    //                 }
    //             }
    //                 for(let j=0;j<fobj.length;j++){
    //                     if(fasl[i]==fobj[j].name){
    //                         tt=tt+(fobj[j].per*to)/100;
    //                     }
    //                 }
        
    //                 for(let j=0;j<robj.length;j++){
    //                     if(road[i]==robj[j].name){
    //                         tt=tt+(robj[j].per*to)/100;
    //                     }
    //                 }
                
    
    //             Hector.push(tt);
    //         }
    //     }

    //     for(let i=0;i<warr.length;i++){
    //         if(warr[i]!=0){
    //             let flag=0;
    //             for(let j=0;j<mward.length;j++){
    //                 if(mward[j].name==warr[i]){
    //                     if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
    //                         mward[j].val=mward[j].val+Number(rakba[i]);
    //                         flag=1;
    //                         break;
    //                     }
    //                 }
    //             }
    //                 if(flag==0){
    //                     let ob={
    //                         name:warr[i],
    //                         val:Number(rakba[i]),
    //                         type:ty[i]
    //                     }
    //                     mward.push(ob);
    //                 }
    //         } 
    //     }

    //     for(let i=0;i<Hector.length;i++){
    //         total=total+Hector[i];
    //     }

    //     for(let i=0;i<mward.length;i++){
    //         if(mward[i].type=="k"){
    //             if(mward[i].val<=506){
    //                 total=total+(mward[i].name*mward[i].val);
    //             }
    //             else{
    //                 total=total+(mward[i].name*(mward[i].val-506)*0.25)+(506*mward[i].name);
          
    //             }
    //         }else{
    //             total=total+(mward[i].name*mward[i].val);                 
    //         }
    //     }
    // }

    // else if(sak=="MarPan"){
    //     for(let i=0;i<ward.length;i++){
    //         if(bhumi[i]=="N"){
    //             warr.push(0);
    //         }
    //         else{
    //             for(let j=0;j<obj1.length;j++){
    //                 if(bhumi[i]==obj1[j].name){
    //                    warr.push(obj1[j].price);
    //                 }
    //             }
    //         }
    //     }
    //     for(let i=0;i<hbumi.length;i++){
    //         if(hbumi[i]=="N"){
    //             Hector.push(0);
    //         }
    //         else{
    //             let to;
    //             let tt=0;
    //             for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120);
    //                         tt=tt+to;
    //                     }
    //             }
                
    //                 for(let j=0;j<fobj.length;j++){
    //                     if(fasl[i]==fobj[j].name){
    //                         tt=tt+(fobj[j].per*to)/100;
    //                     }
    //                 }
        
    //                 for(let j=0;j<robj.length;j++){
    //                     if(road[i]==robj[j].name){
    //                         tt=tt+(robj[j].per*to)/100;
    //                     }
    //                 }
                
    
    //             Hector.push(tt);
    //         }
    //     }

    //     for(let i=0;i<warr.length;i++){
    //         if(warr[i]!=0){
    //             let flag=0;
    //             for(let j=0;j<mward.length;j++){
    //                 if(mward[j].name==warr[i]){
    //                     if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
    //                         mward[j].val=mward[j].val+Number(rakba[i]);
    //                         flag=1;
    //                         break;
    //                     }
    //                 }
    //             }
    //                 if(flag==0){
    //                     let ob={
    //                         name:warr[i],
    //                         val:Number(rakba[i]),
    //                         type:ty[i]
    //                     }
    //                     mward.push(ob);
    //                 }
    //         } 
    //     }

    //     for(let i=0;i<Hector.length;i++){
    //         total=total+Hector[i];
    //     }

    //     for(let i=0;i<mward.length;i++){
    //         if(mward[i].type=="k"){
    //             if(mward[i].val<=506){
    //                 total=total+(mward[i].name*mward[i].val);
    //             }
    //             else{
    //                 total=total+(mward[i].name*(mward[i].val-506)*0.25)+(506*mward[i].name);
          
    //             }
    //         }else{
    //             if(mward[i].val<=506){
    //                 total=total+(mward[i].name*mward[i].val);
    //             }
    //             else if(mward[i].val<=1012){
    //                 total=total+(mward[i].name*(mward[i].val-506)*0.5)+(506*mward[i].name);
          
    //             }else{
    //                 total=total+(mward[i].name*(mward[i].val-1012)*0.25)+(506*mward[i].name*0.5)+(506*mward[i].name);
          
    //             }
    //         }
    //     }
    // }

    // else if(sak=="pandPan"){
    //     for(let i=0;i<ward.length;i++){
    //         if(bhumi[i]=="N"){
    //             warr.push(0);
    //         }
    //         else{
    //             for(let j=0;j<obj1.length;j++){
    //                 if(bhumi[i]==obj1[j].name){
    //                    warr.push(obj1[j].price);
    //                 }
    //             }
    //         }
    //     }
    //     for(let i=0;i<hbumi.length;i++){
    //         if(hbumi[i]=="N"){
    //             Hector.push(0);
    //         }
    //         else{
    //             let to;
    //             let tt=0;
    //             if(ty[i]=="pa"){

    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120)*2.5;
    //                         tt=tt+to;
    //                     }
    //                 }

    //             }
    //             else{
    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120);
    //                         tt=tt+to;
    //                     }
    //                 }
    //             }
    //                 for(let j=0;j<fobj.length;j++){
    //                     if(fasl[i]==fobj[j].name){
    //                         tt=tt+(fobj[j].per*to)/100;
    //                     }
    //                 }
        
    //                 for(let j=0;j<robj.length;j++){
    //                     if(road[i]==robj[j].name){
    //                         tt=tt+(robj[j].per*to)/100;
    //                     }
    //                 }
                
    
    //             Hector.push(tt);
    //         }
    //     }

    //     for(let i=0;i<warr.length;i++){
    //         if(warr[i]!=0){
    //             let flag=0;
    //             for(let j=0;j<mward.length;j++){
    //                 if(mward[j].name==warr[i]){
    //                     if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
    //                         mward[j].val=mward[j].val+Number(rakba[i]);
    //                         flag=1;
    //                         break;
    //                     }
    //                 }
    //             }
    //                 if(flag==0){
    //                     let ob={
    //                         name:warr[i],
    //                         val:Number(rakba[i]),
    //                         type:ty[i]
    //                     }
    //                     mward.push(ob);
    //                 }
    //         } 
    //     }

    //     for(let i=0;i<Hector.length;i++){
    //         total=total+Hector[i];
    //     }

    //     for(let i=0;i<mward.length;i++){
    //         if(mward[i].type=="k"){
    //             total=total+(mward[i].name*mward[i].val);                 
    //         }else{
    //             total=total+(mward[i].name*mward[i].val);                 
    //         }
    //     }
    // }

    // else if(sak=="JangPan"){
    //     for(let i=0;i<ward.length;i++){
    //         if(bhumi[i]=="N"){
    //             warr.push(0);
    //         }
    //         else{
    //             for(let j=0;j<obj1.length;j++){
    //                 if(bhumi[i]==obj1[j].name){
    //                    warr.push(obj1[j].price);
    //                 }
    //             }
    //         }
    //     }
    //     for(let i=0;i<hbumi.length;i++){
    //         if(hbumi[i]=="N"){
    //             Hector.push(0);
    //         }
    //         else{
    //             let to;
    //             let tt=0;
    //             if(ty[i]=="pa"){

    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120)*2.5;
    //                         tt=tt+to;
    //                     }
    //                 }

    //             }
    //             else{
    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120);
    //                         tt=tt+to;
    //                     }
    //                 }
    //             }
    //                 for(let j=0;j<fobj.length;j++){
    //                     if(fasl[i]==fobj[j].name){
    //                         tt=tt+(fobj[j].per*to)/100;
    //                     }
    //                 }
        
    //                 for(let j=0;j<robj.length;j++){
    //                     if(road[i]==robj[j].name){
    //                         tt=tt+(robj[j].per*to)/100;
    //                     }
    //                 }
                
    
    //             Hector.push(tt);
    //         }
    //     }

    //     for(let i=0;i<warr.length;i++){
    //         if(warr[i]!=0){
    //             let flag=0;
    //             for(let j=0;j<mward.length;j++){
    //                 if(mward[j].name==warr[i]){
    //                     if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
    //                         mward[j].val=mward[j].val+Number(rakba[i]);
    //                         flag=1;
    //                         break;
    //                     }
    //                 }
    //             }
    //                 if(flag==0){
    //                     let ob={
    //                         name:warr[i],
    //                         val:Number(rakba[i]),
    //                         type:ty[i]
    //                     }
    //                     mward.push(ob);
    //                 }
    //         } 
    //     }

    //     for(let i=0;i<Hector.length;i++){
    //         total=total+Hector[i];
    //     }

    //     for(let i=0;i<mward.length;i++){
    //         if(mward[i].type=="k"){
    //             if(mward[i].val<=506){
    //                 total=total+(mward[i].name*mward[i].val);
    //             }
    //             else{
    //                 total=total+(mward[i].name*(mward[i].val-506)*0.25)+(506*mward[i].name);
          
    //             }
    //         }else{
    //             total=total+(mward[i].name*mward[i].val);                 
    //         }
    //     }
    // }

    // else if(sak=="dantPal"){
    //     for(let i=0;i<ward.length;i++){
    //         if(bhumi[i]=="N"){
    //             warr.push(0);
    //         }
    //         else{
    //             for(let j=0;j<obj1.length;j++){
    //                 if(bhumi[i]==obj1[j].name){
    //                    warr.push(obj1[j].price);
    //                 }
    //             }
    //         }
    //     }
    //     for(let i=0;i<hbumi.length;i++){
    //         if(hbumi[i]=="N"){
    //             Hector.push(0);
    //         }
    //         else{
    //             let to;
    //             let tt=0;
    //             if(ty[i]=="pa"){

    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120)*2.5;
    //                         tt=tt+to;
    //                     }
    //                 }

    //             }
    //             else{
    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120);
    //                         tt=tt+to;
    //                     }
    //                 }
    //             }
    //                 for(let j=0;j<fobj.length;j++){
    //                     if(fasl[i]==fobj[j].name){
    //                         tt=tt+(fobj[j].per*to)/100;
    //                     }
    //                 }
        
    //                 for(let j=0;j<robj.length;j++){
    //                     if(road[i]==robj[j].name){
    //                         tt=tt+(robj[j].per*to)/100;
    //                     }
    //                 }
                
    
    //             Hector.push(tt);
    //         }
    //     }

    //     for(let i=0;i<warr.length;i++){
    //         if(warr[i]!=0){
    //             let flag=0;
    //             for(let j=0;j<mward.length;j++){
    //                 if(mward[j].name==warr[i]){
    //                     if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
    //                         mward[j].val=mward[j].val+Number(rakba[i]);
    //                         flag=1;
    //                         break;
    //                     }
    //                 }
    //             }
    //                 if(flag==0){
    //                     let ob={
    //                         name:warr[i],
    //                         val:Number(rakba[i]),
    //                         type:ty[i]
    //                     }
    //                     mward.push(ob);
    //                 }
    //         } 
    //     }

    //     for(let i=0;i<Hector.length;i++){
    //         total=total+Hector[i];
    //     }

    //     for(let i=0;i<mward.length;i++){
    //         if(mward[i].type=="k"){
    //             if(mward[i].val<=506){
    //                 total=total+(mward[i].name*mward[i].val);
    //             }
    //             else if(mward[i].val<=1012){
    //                 total=total+(mward[i].name*(mward[i].val-506)*0.8)+(506*mward[i].name);
          
    //             }else{
    //                 total=total+(mward[i].name*(mward[i].val-1012)*0.5)+(506*mward[i].name*0.8)+(506*mward[i].name);
          
    //             }
    //         }else{
    //             total=total+(mward[i].name*mward[i].val);                 
    //         }
    //     }
    // }

    // else if(sak=="dantPan"){
    //     for(let i=0;i<ward.length;i++){
    //         if(bhumi[i]=="N"){
    //             warr.push(0);
    //         }
    //         else{
    //             for(let j=0;j<obj1.length;j++){
    //                 if(bhumi[i]==obj1[j].name){
    //                    warr.push(obj1[j].price);
    //                 }
    //             }
    //         }
    //     }
    //     for(let i=0;i<hbumi.length;i++){
    //         if(hbumi[i]=="N"){
    //             Hector.push(0);
    //         }
    //         else{
    //             let to;
    //             let tt=0;
    //             if(ty[i]=="pa"){

    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120)*2.5;
    //                         tt=tt+to;
    //                     }
    //                 }

    //             }
    //             else{
    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120);
    //                         tt=tt+to;
    //                     }
    //                 }
    //             }
    //                 for(let j=0;j<fobj.length;j++){
    //                     if(fasl[i]==fobj[j].name){
    //                         tt=tt+(fobj[j].per*to)/100;
    //                     }
    //                 }
        
    //                 for(let j=0;j<robj.length;j++){
    //                     if(road[i]==robj[j].name){
    //                         tt=tt+(robj[j].per*to)/100;
    //                     }
    //                 }
                
    
    //             Hector.push(tt);
    //         }
    //     }

    //     for(let i=0;i<warr.length;i++){
    //         if(warr[i]!=0){
    //             let flag=0;
    //             for(let j=0;j<mward.length;j++){
    //                 if(mward[j].name==warr[i]){
    //                     if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
    //                         mward[j].val=mward[j].val+Number(rakba[i]);
    //                         flag=1;
    //                         break;
    //                     }
    //                 }
    //             }
    //                 if(flag==0){
    //                     let ob={
    //                         name:warr[i],
    //                         val:Number(rakba[i]),
    //                         type:ty[i]
    //                     }
    //                     mward.push(ob);
    //                 }
    //         } 
    //     }

    //     for(let i=0;i<Hector.length;i++){
    //         total=total+Hector[i];
    //     }

    //     for(let i=0;i<mward.length;i++){
    //         if(mward[i].type=="k"){
    //             if(mward[i].val<=506){
    //                 total=total+(mward[i].name*mward[i].val);
    //             }
    //             else{
    //                 total=total+(mward[i].name*(mward[i].val-1012)*0.25)+(506*mward[i].name);
          
    //             }
    //         }else{
    //             total=total+(mward[i].name*mward[i].val);                 
    //         }
    //     }
    // }
    
    // else if(sak=="Balod"){
    //     for(let i=0;i<ward.length;i++){
    //         if(bhumi[i]=="N"){
    //             warr.push(0);
    //         }
    //         else{
    //             for(let j=0;j<obj1.length;j++){
    //                 if(bhumi[i]==obj1[j].name){
    //                    warr.push(obj1[j].price);
    //                 }
    //             }
    //         }
    //     }
    //     for(let i=0;i<hbumi.length;i++){
    //         if(hbumi[i]=="N"){
    //             Hector.push(0);
    //         }
    //         else{
    //             let to;
    //             let tt=0;
    //             if(ty[i]=="pa"){

    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120)*2.5;
    //                         tt=tt+to;
    //                     }
    //                 }

    //             }
    //             else{
    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120);
    //                         tt=tt+to;
    //                     }
    //                 }
    //             }
    //                 for(let j=0;j<fobj.length;j++){
    //                     if(fasl[i]==fobj[j].name){
    //                         tt=tt+(fobj[j].per*to)/100;
    //                     }
    //                 }
        
    //                 for(let j=0;j<robj.length;j++){
    //                     if(road[i]==robj[j].name){
    //                         tt=tt+(robj[j].per*to)/100;
    //                     }
    //                 }
                
    
    //             Hector.push(tt);
    //         }
    //     }

    //     for(let i=0;i<warr.length;i++){
    //         if(warr[i]!=0){
    //             let flag=0;
    //             for(let j=0;j<mward.length;j++){
    //                 if(mward[j].name==warr[i]){
    //                     if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
    //                         mward[j].val=mward[j].val+Number(rakba[i]);
    //                         flag=1;
    //                         break;
    //                     }
    //                 }
    //             }
    //                 if(flag==0){
    //                     let ob={
    //                         name:warr[i],
    //                         val:Number(rakba[i]),
    //                         type:ty[i]
    //                     }
    //                     mward.push(ob);
    //                 }
    //         } 
    //     }

    //     for(let i=0;i<Hector.length;i++){
    //         total=total+Hector[i];
    //     }

    //     for(let i=0;i<mward.length;i++){
    //         if(mward[i].type=="k"){
    //                 total=total+(mward[i].name*mward[i].val);                   
    //         }else{
    //             total=total+(mward[i].name*mward[i].val);                 
    //         }
    //     }
    // }
    // else if(sak=="Gudar"){
    //     for(let i=0;i<ward.length;i++){
    //         if(bhumi[i]=="N"){
    //             warr.push(0);
    //         }
    //         else{
    //             for(let j=0;j<obj1.length;j++){
    //                 if(bhumi[i]==obj1[j].name){
    //                    warr.push(obj1[j].price);
    //                 }
    //             }
    //         }
    //     }
    //     for(let i=0;i<hbumi.length;i++){
    //         if(hbumi[i]=="N"){
    //             Hector.push(0);
    //         }
    //         else{
    //             let to;
    //             let tt=0;
    //             if(ty[i]=="pa"){

    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120)*2.5;
    //                         tt=tt+to;
    //                     }
    //                 }

    //             }
    //             else{
    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120);
    //                         tt=tt+to;
    //                     }
    //                 }
    //             }
    //                 for(let j=0;j<fobj.length;j++){
    //                     if(fasl[i]==fobj[j].name){
    //                         tt=tt+(fobj[j].per*to)/100;
    //                     }
    //                 }
        
    //                 for(let j=0;j<robj.length;j++){
    //                     if(road[i]==robj[j].name){
    //                         tt=tt+(robj[j].per*to)/100;
    //                     }
    //                 }
                
    
    //             Hector.push(tt);
    //         }
    //     }

    //     for(let i=0;i<warr.length;i++){
    //         if(warr[i]!=0){
    //             let flag=0;
    //             for(let j=0;j<mward.length;j++){
    //                 if(mward[j].name==warr[i]){
    //                     if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
    //                         mward[j].val=mward[j].val+Number(rakba[i]);
    //                         flag=1;
    //                         break;
    //                     }
    //                 }
    //             }
    //                 if(flag==0){
    //                     let ob={
    //                         name:warr[i],
    //                         val:Number(rakba[i]),
    //                         type:ty[i]
    //                     }
    //                     mward.push(ob);
    //                 }
    //         } 
    //     }

    //     for(let i=0;i<Hector.length;i++){
    //         total=total+Hector[i];
    //     }

    //     for(let i=0;i<mward.length;i++){
    //         if(mward[i].type=="k"){
    //             if(mward[i].val<=506){
    //                 total=total+(mward[i].name*mward[i].val);
    //             }
    //             else{
    //                 total=total+(mward[i].name*(mward[i].val-506)*0.25)+(506*mward[i].name);
          
    //             }
    //         }else{
    //             if(mward[i].val<=4048){
    //                 total=total+(mward[i].name*mward[i].val*0.9);
    //             }
    //             else{
    //                 total=total+(mward[i].name*(mward[i].val-506)*0.7)+(506*mward[i].name*0.9);
          
    //             }                }
    //     }
    // }
    // else if(sak=="Balesh"){
    //     for(let i=0;i<ward.length;i++){
    //         if(bhumi[i]=="N"){
    //             warr.push(0);
    //         }
    //         else{
    //             for(let j=0;j<obj1.length;j++){
    //                 if(bhumi[i]==obj1[j].name){
    //                    warr.push(obj1[j].price);
    //                 }
    //             }
    //         }
    //     }
    //     for(let i=0;i<hbumi.length;i++){
    //         if(hbumi[i]=="N"){
    //             Hector.push(0);
    //         }
    //         else{
    //             let to;
    //             let tt=0;
    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120);
    //                         tt=tt+to;
    //                     }
    //                 }
                
    //                 for(let j=0;j<fobj.length;j++){
    //                     if(fasl[i]==fobj[j].name){
    //                         tt=tt+(fobj[j].per*to)/100;
    //                     }
    //                 }
        
    //                 for(let j=0;j<robj.length;j++){
    //                     if(road[i]==robj[j].name){
    //                         tt=tt+(robj[j].per*to)/100;
    //                     }
    //                 }
                
    
    //             Hector.push(tt);
    //         }
    //     }

    //     for(let i=0;i<warr.length;i++){
    //         if(warr[i]!=0){
    //             let flag=0;
    //             for(let j=0;j<mward.length;j++){
    //                 if(mward[j].name==warr[i]){
    //                     if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
    //                         mward[j].val=mward[j].val+Number(rakba[i]);
    //                         flag=1;
    //                         break;
    //                     }
    //                 }
    //             }
    //                 if(flag==0){
    //                     let ob={
    //                         name:warr[i],
    //                         val:Number(rakba[i]),
    //                         type:ty[i]
    //                     }
    //                     mward.push(ob);
    //                 }
    //         } 
    //     }

    //     for(let i=0;i<Hector.length;i++){
    //         total=total+Hector[i];
    //     }

    //     for(let i=0;i<mward.length;i++){
    //         if(mward[i].type=="k"){
    //             if(mward[i].val<=506){
    //                 total=total+(mward[i].name*mward[i].val);
    //             }
    //             else{
    //                 total=total+(mward[i].name*(mward[i].val-506)*0.20)+(506*mward[i].name);
          
    //             }
    //         }else{
    //             if(mward[i].val<=506){
    //                 total=total+(mward[i].name*mward[i].val);
    //             }
    //             else{
    //                 total=total+(mward[i].name*(mward[i].val-506)*0.40)+(506*mward[i].name);
          
    //             }                }
    //     }
    // }
    // else if(sak=="Beja"){
    //     for(let i=0;i<ward.length;i++){
    //         if(bhumi[i]=="N"){
    //             warr.push(0);
    //         }
    //         else{
    //             for(let j=0;j<obj1.length;j++){
    //                 if(bhumi[i]==obj1[j].name){
    //                    warr.push(obj1[j].price);
    //                 }
    //             }
    //         }
    //     }
    //     for(let i=0;i<hbumi.length;i++){
    //         if(hbumi[i]=="N"){
    //             Hector.push(0);
    //         }
    //         else{
    //             let to;
    //             let tt=0;
    //             if(ty[i]=="pa"){

    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120)*2.5;
    //                         tt=tt+to;
    //                     }
    //                 }

    //             }
    //             else{
    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120);
    //                         tt=tt+to;
    //                     }
    //                 }
    //             }
    //                 for(let j=0;j<fobj.length;j++){
    //                     if(fasl[i]==fobj[j].name){
    //                         tt=tt+(fobj[j].per*to)/100;
    //                     }
    //                 }
        
    //                 for(let j=0;j<robj.length;j++){
    //                     if(road[i]==robj[j].name){
    //                         tt=tt+(robj[j].per*to)/100;
    //                     }
    //                 }
                
    
    //             Hector.push(tt);
    //         }
    //     }

    //     for(let i=0;i<warr.length;i++){
    //         if(warr[i]!=0){
    //             let flag=0;
    //             for(let j=0;j<mward.length;j++){
    //                 if(mward[j].name==warr[i]){
    //                     if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
    //                         mward[j].val=mward[j].val+Number(rakba[i]);
    //                         flag=1;
    //                         break;
    //                     }
    //                 }
    //             }
    //                 if(flag==0){
    //                     let ob={
    //                         name:warr[i],
    //                         val:Number(rakba[i]),
    //                         type:ty[i]
    //                     }
    //                     mward.push(ob);
    //                 }
    //         } 
    //     }

    //     for(let i=0;i<Hector.length;i++){
    //         total=total+Hector[i];
    //     }

    //     for(let i=0;i<mward.length;i++){
    //         if(mward[i].type=="k"){
    //             if(mward[i].val<=506){
    //                 total=total+(mward[i].name*mward[i].val);
    //             }
    //             else if(mward[i].val<=1012){
    //                 total=total+(mward[i].name*(mward[i].val-506)*0.8)+(506*mward[i].name);
          
    //             }else{
    //                 total=total+(mward[i].name*(mward[i].val-1012)*0.5)+(506*mward[i].name*0.8)+(506*mward[i].name);
          
    //             }
    //         }else{
    //             total=total+(mward[i].name*mward[i].val);                 
    //         }
    //     }
    // }


   


    // else if(sak=="Mandrapal"){
    //     for(let i=0;i<ward.length;i++){
    //         if(bhumi[i]=="N"){
    //             warr.push(0);
    //         }
    //         else{
    //             for(let j=0;j<obj1.length;j++){
    //                 if(bhumi[i]==obj1[j].name){
    //                    warr.push(obj1[j].price);
    //                 }
    //             }
    //         }
    //     }
    //     for(let i=0;i<hbumi.length;i++){
    //         if(hbumi[i]=="N"){
    //             Hector.push(0);
    //         }
    //         else{
    //             let to;
    //             let tt=0;
    //             if(ty[i]=="pa"){

    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120)*2.5;
    //                         tt=tt+to;
    //                     }
    //                 }

    //             }
    //             else{
    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120);
    //                         tt=tt+to;
    //                     }
    //                 }
    //             }
    //                 for(let j=0;j<fobj.length;j++){
    //                     if(fasl[i]==fobj[j].name){
    //                         tt=tt+(fobj[j].per*to)/100;
    //                     }
    //                 }
        
    //                 for(let j=0;j<robj.length;j++){
    //                     if(road[i]==robj[j].name){
    //                         tt=tt+(robj[j].per*to)/100;
    //                     }
    //                 }
                
    
    //             Hector.push(tt);
    //         }
    //     }

    //     for(let i=0;i<warr.length;i++){
    //         if(warr[i]!=0){
    //             let flag=0;
    //             for(let j=0;j<mward.length;j++){
    //                 if(mward[j].name==warr[i]){
    //                     if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
    //                         mward[j].val=mward[j].val+Number(rakba[i]);
    //                         flag=1;
    //                         break;
    //                     }
    //                 }
    //             }
    //                 if(flag==0){
    //                     let ob={
    //                         name:warr[i],
    //                         val:Number(rakba[i]),
    //                         type:ty[i]
    //                     }
    //                     mward.push(ob);
    //                 }
    //         } 
    //     }

    //     for(let i=0;i<Hector.length;i++){
    //         total=total+Hector[i];
    //     }

    //     for(let i=0;i<mward.length;i++){
    //         if(mward[i].type=="k"){
    //             if(mward[i].val<=506){
    //                 total=total+(mward[i].name*mward[i].val);
    //             }
    //             else if(mward[i].val<=1012){
    //                 total=total+(mward[i].name*(mward[i].val-506)*0.8)+(506*mward[i].name);
          
    //             }else{
    //                 total=total+(mward[i].name*(mward[i].val-1012)*0.5)+(506*mward[i].name*0.8)+(506*mward[i].name);
          
    //             }
    //         }else{
    //             total=total+(mward[i].name*mward[i].val);                 
    //         }
    //     }
    // }
    // else if(sak=="Mandrapan"){
    //     for(let i=0;i<ward.length;i++){
    //         if(bhumi[i]=="N"){
    //             warr.push(0);
    //         }
    //         else{
    //             for(let j=0;j<obj1.length;j++){
    //                 if(bhumi[i]==obj1[j].name){
    //                    warr.push(obj1[j].price);
    //                 }
    //             }
    //         }
    //     }
    //     for(let i=0;i<hbumi.length;i++){
    //         if(hbumi[i]=="N"){
    //             Hector.push(0);
    //         }
    //         else{
    //             let to;
    //             let tt=0;
    //             if(ty[i]=="pa"){

    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120)*2.5;
    //                         tt=tt+to;
    //                     }
    //                 }

    //             }
    //             else{
    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120);
    //                         tt=tt+to;
    //                     }
    //                 }
    //             }
    //                 for(let j=0;j<fobj.length;j++){
    //                     if(fasl[i]==fobj[j].name){
    //                         tt=tt+(fobj[j].per*to)/100;
    //                     }
    //                 }
        
    //                 for(let j=0;j<robj.length;j++){
    //                     if(road[i]==robj[j].name){
    //                         tt=tt+(robj[j].per*to)/100;
    //                     }
    //                 }
                
    
    //             Hector.push(tt);
    //         }
    //     }

    //     for(let i=0;i<warr.length;i++){
    //         if(warr[i]!=0){
    //             let flag=0;
    //             for(let j=0;j<mward.length;j++){
    //                 if(mward[j].name==warr[i]){
    //                     if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
    //                         mward[j].val=mward[j].val+Number(rakba[i]);
    //                         flag=1;
    //                         break;
    //                     }
    //                 }
    //             }
    //                 if(flag==0){
    //                     let ob={
    //                         name:warr[i],
    //                         val:Number(rakba[i]),
    //                         type:ty[i]
    //                     }
    //                     mward.push(ob);
    //                 }
    //         } 
    //     }

    //     for(let i=0;i<Hector.length;i++){
    //         total=total+Hector[i];
    //     }

    //     for(let i=0;i<mward.length;i++){
    //         if(mward[i].type=="k"){
    //             if(mward[i].val<=506){
    //                 total=total+(mward[i].name*mward[i].val);
    //             }
    //             else{
    //                 total=total+(mward[i].name*(mward[i].val-506)*0.25)+(506*mward[i].name);
          
    //             }
    //         }else{
    //             total=total+(mward[i].name*mward[i].val);                 
    //         }
    //     }
    // }
    // else if(sak=="mohal"){
    //     for(let i=0;i<ward.length;i++){
    //         if(bhumi[i]=="N"){
    //             warr.push(0);
    //         }
    //         else{
    //             for(let j=0;j<obj1.length;j++){
    //                 if(bhumi[i]==obj1[j].name){
    //                    warr.push(obj1[j].price);
    //                 }
    //             }
    //         }
    //     }
    //     for(let i=0;i<hbumi.length;i++){
    //         if(hbumi[i]=="N"){
    //             Hector.push(0);
    //         }
    //         else{
    //             let to;
    //             let tt=0;
    //             if(ty[i]=="pa"){

    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120)*2.5;
    //                         tt=tt+to;
    //                     }
    //                 }

    //             }
    //             else{
    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120);
    //                         tt=tt+to;
    //                     }
    //                 }
    //             }
    //                 for(let j=0;j<fobj.length;j++){
    //                     if(fasl[i]==fobj[j].name){
    //                         tt=tt+(fobj[j].per*to)/100;
    //                     }
    //                 }
        
    //                 for(let j=0;j<robj.length;j++){
    //                     if(road[i]==robj[j].name){
    //                         tt=tt+(robj[j].per*to)/100;
    //                     }
    //                 }
                
    
    //             Hector.push(tt);
    //         }
    //     }

    //     for(let i=0;i<warr.length;i++){
    //         if(warr[i]!=0){
    //             let flag=0;
    //             for(let j=0;j<mward.length;j++){
    //                 if(mward[j].name==warr[i]){
    //                     if(mward[j].type==ty[i]){
    //                         mward[j].val=mward[j].val+Number(rakba[i]);
    //                         flag=1;
    //                         break;
    //                     }
    //                 }
    //             }
    //                 if(flag==0){
    //                     let ob={
    //                         name:warr[i],
    //                         val:Number(rakba[i]),
    //                         type:ty[i]
    //                     }
    //                     mward.push(ob);
    //                 }
    //         } 
    //     }

    //     for(let i=0;i<Hector.length;i++){
    //         total=total+Hector[i];
    //     }

    //     for(let i=0;i<mward.length;i++){
    //         if(mward[i].type=="k" || mward[i].type=="p"){
    //             if(mward[i].val<=506){
    //                 total=total+(mward[i].name*mward[i].val);
    //             }
    //             else{
    //                 total=total+(mward[i].name*(mward[i].val-506)*0.25)+(506*mward[i].name);
          
    //             }
    //         }else{
    //             total=total+(mward[i].name*mward[i].val);                 
    //         }
    //     }
    // }
    // else if(sak=="ranjar"){
    //     for(let i=0;i<ward.length;i++){
    //         if(bhumi[i]=="N"){
    //             warr.push(0);
    //         }
    //         else{
    //             for(let j=0;j<obj1.length;j++){
    //                 if(bhumi[i]==obj1[j].name){
    //                    warr.push(obj1[j].price);
    //                 }
    //             }
    //         }
    //     }
    //     for(let i=0;i<hbumi.length;i++){
    //         if(hbumi[i]=="N"){
    //             Hector.push(0);
    //         }
    //         else{
    //             let to;
    //             let tt=0;
    //             if(ty[i]=="pa"){

    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120)*2.5;
    //                         tt=tt+to;
    //                     }
    //                 }

    //             }
    //             else{
    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120);
    //                         tt=tt+to;
    //                     }
    //                 }
    //             }
    //                 for(let j=0;j<fobj.length;j++){
    //                     if(fasl[i]==fobj[j].name){
    //                         tt=tt+(fobj[j].per*to)/100;
    //                     }
    //                 }
        
    //                 for(let j=0;j<robj.length;j++){
    //                     if(road[i]==robj[j].name){
    //                         tt=tt+(robj[j].per*to)/100;
    //                     }
    //                 }
                
    
    //             Hector.push(tt);
    //         }
    //     }

    //     for(let i=0;i<warr.length;i++){
    //         if(warr[i]!=0){
    //             let flag=0;
    //             for(let j=0;j<mward.length;j++){
    //                 if(mward[j].name==warr[i]){
    //                     if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
    //                         mward[j].val=mward[j].val+Number(rakba[i]);
    //                         flag=1;
    //                         break;
    //                     }
    //                 }
    //             }
    //                 if(flag==0){
    //                     let ob={
    //                         name:warr[i],
    //                         val:Number(rakba[i]),
    //                         type:ty[i]
    //                     }
    //                     mward.push(ob);
    //                 }
    //         } 
    //     }

    //     for(let i=0;i<Hector.length;i++){
    //         total=total+Hector[i];
    //     }

    //     for(let i=0;i<mward.length;i++){
    //             if(mward[i].val<=506){
    //                 total=total+(mward[i].name*mward[i].val);
    //             }
    //             else{
    //                 total=total+(mward[i].name*(mward[i].val-506)*0.4)+(506*mward[i].name);
          
    //             }
    //     }
    // }
    // else if(sak=="ambika1"){
    //     for(let i=0;i<ward.length;i++){
    //         if(bhumi[i]=="N"){
    //             warr.push(0);
    //         }
    //         else{
    //             for(let j=0;j<obj1.length;j++){
    //                 if(bhumi[i]==obj1[j].name){
    //                    warr.push(obj1[j].price);
    //                 }
    //             }
    //         }
    //     }
    //     for(let i=0;i<hbumi.length;i++){
    //         if(hbumi[i]=="N"){
    //             Hector.push(0);
    //         }
    //         else{
    //             let to;
    //             let tt=0;
    //             if(ty[i]=="pa"){

    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120)*2.5;
    //                         tt=tt+to;
    //                     }
    //                 }

    //             }
    //             else{
    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120);
    //                         tt=tt+to;
    //                     }
    //                 }
    //             }
    //                 for(let j=0;j<fobj.length;j++){
    //                     if(fasl[i]==fobj[j].name){
    //                         tt=tt+(fobj[j].per*to)/100;
    //                     }
    //                 }
        
    //                 for(let j=0;j<robj.length;j++){
    //                     if(road[i]==robj[j].name){
    //                         tt=tt+(robj[j].per*to)/100;
    //                     }
    //                 }
                
    
    //             Hector.push(tt);
    //         }
    //     }

    //     for(let i=0;i<warr.length;i++){
    //         if(warr[i]!=0){
    //             let flag=0;
    //             for(let j=0;j<mward.length;j++){
    //                 if(mward[j].name==warr[i]){
    //                     if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
    //                         mward[j].val=mward[j].val+Number(rakba[i]);
    //                         flag=1;
    //                         break;
    //                     }
    //                 }
    //             }
    //                 if(flag==0){
    //                     let ob={
    //                         name:warr[i],
    //                         val:Number(rakba[i]),
    //                         type:ty[i]
    //                     }
    //                     mward.push(ob);
    //                 }
    //         } 
    //     }

    //     for(let i=0;i<Hector.length;i++){
    //         total=total+Hector[i];
    //     }

    //     for(let i=0;i<mward.length;i++){
    //         if(mward[i].type=="k"){
    //             if(mward[i].val<=506){
    //                 total=total+(mward[i].name*mward[i].val);
    //             }
    //             else if(mward[i].val<=1012){
    //                 total=total+(mward[i].name*(mward[i].val-506)*0.8)+(506*mward[i].name);
          
    //             }else{
    //                 total=total+(mward[i].name*(mward[i].val-1012)*0.5)+(506*mward[i].name*0.8)+(506*mward[i].name);
          
    //             }
    //         }else{
    //             total=total+(mward[i].name*mward[i].val);                 
    //         }
    //     }
    // }
    // else if(sak=="ambika2"){
    //     for(let i=0;i<ward.length;i++){
    //         if(bhumi[i]=="N"){
    //             warr.push(0);
    //         }
    //         else{
    //             for(let j=0;j<obj1.length;j++){
    //                 if(bhumi[i]==obj1[j].name){
    //                    warr.push(obj1[j].price);
    //                 }
    //             }
    //         }
    //     }
    //     for(let i=0;i<hbumi.length;i++){
    //         if(hbumi[i]=="N"){
    //             Hector.push(0);
    //         }
    //         else{
    //             let to;
    //             let tt=0;
    //             if(ty[i]=="pa"){

    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120)*2.5;
    //                         tt=tt+to;
    //                     }
    //                 }

    //             }
    //             else{
    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120);
    //                         tt=tt+to;
    //                     }
    //                 }
    //             }
    //                 for(let j=0;j<fobj.length;j++){
    //                     if(fasl[i]==fobj[j].name){
    //                         tt=tt+(fobj[j].per*to)/100;
    //                     }
    //                 }
        
    //                 for(let j=0;j<robj.length;j++){
    //                     if(road[i]==robj[j].name){
    //                         tt=tt+(robj[j].per*to)/100;
    //                     }
    //                 }
                
    
    //             Hector.push(tt);
    //         }
    //     }

    //     for(let i=0;i<warr.length;i++){
    //         if(warr[i]!=0){
    //             let flag=0;
    //             for(let j=0;j<mward.length;j++){
    //                 if(mward[j].name==warr[i]){
    //                     if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
    //                         mward[j].val=mward[j].val+Number(rakba[i]);
    //                         flag=1;
    //                         break;
    //                     }
    //                 }
    //             }
    //                 if(flag==0){
    //                     let ob={
    //                         name:warr[i],
    //                         val:Number(rakba[i]),
    //                         type:ty[i]
    //                     }
    //                     mward.push(ob);
    //                 }
    //         } 
    //     }

    //     for(let i=0;i<Hector.length;i++){
    //         total=total+Hector[i];
    //     }

    //     for(let i=0;i<mward.length;i++){
    //         if(mward[i].type=="k"){
    //             if(mward[i].val<=506){
    //                 total=total+(mward[i].name*mward[i].val);
    //             }
    //             else if(mward[i].val<=1012){
    //                 total=total+(mward[i].name*(mward[i].val-506)*0.8)+(506*mward[i].name);
          
    //             }else{
    //                 total=total+(mward[i].name*(mward[i].val-1012)*0.5)+(506*mward[i].name*0.8)+(506*mward[i].name);
          
    //             }
    //         }else{
    //             total=total+(mward[i].name*mward[i].val);                 
    //         }
    //     }
    // }
    // else if(sak=="raygarh1"){
    //     for(let i=0;i<ward.length;i++){
    //         if(bhumi[i]=="N"){
    //             warr.push(0);
    //         }
    //         else{
    //             for(let j=0;j<obj1.length;j++){
    //                 if(bhumi[i]==obj1[j].name){
    //                    warr.push(obj1[j].price);
    //                 }
    //             }
    //         }
    //     }
    //     for(let i=0;i<hbumi.length;i++){
    //         if(hbumi[i]=="N"){
    //             Hector.push(0);
    //         }
    //         else{
    //             let to;
    //             let tt=0;
    //             if(ty[i]!="k"){

    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120)*2.5;
    //                         tt=tt+to;
    //                     }
    //                 }

    //             }
    //             else{
    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120);
    //                         tt=tt+to;
    //                     }
    //                 }
    //             }
    //                 for(let j=0;j<fobj.length;j++){
    //                     if(fasl[i]==fobj[j].name){
    //                         tt=tt+(fobj[j].per*to)/100;
    //                     }
    //                 }
        
    //                 for(let j=0;j<robj.length;j++){
    //                     if(road[i]==robj[j].name){
    //                         tt=tt+(robj[j].per*to)/100;
    //                     }
    //                 }
                
    
    //             Hector.push(tt);
    //         }
    //     }

    //     for(let i=0;i<warr.length;i++){
    //         if(warr[i]!=0){
    //             let flag=0;
    //             for(let j=0;j<mward.length;j++){
    //                 if(mward[j].name==warr[i]){
    //                     if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
    //                         mward[j].val=mward[j].val+Number(rakba[i]);
    //                         flag=1;
    //                         break;
    //                     }
    //                 }
    //             }
    //                 if(flag==0){
    //                     let ob={
    //                         name:warr[i],
    //                         val:Number(rakba[i]),
    //                         type:ty[i]
    //                     }
    //                     mward.push(ob);
    //                 }
    //         } 
    //     }

    //     for(let i=0;i<Hector.length;i++){
    //         total=total+Hector[i];
    //     }

    //     for(let i=0;i<mward.length;i++){
    //         if(mward[i].type=="k"){
    //             if(mward[i].val<=506){
    //                 total=total+(mward[i].name*mward[i].val);
    //             }
    //             else{
    //                 total=total+(mward[i].name*(mward[i].val-506)*0.25)+(506*mward[i].name);
          
    //             }
    //         }else{
    //             if(mward[i].val<=1014){
    //                 total=total+(mward[i].name*mward[i].val);
    //             }
    //             else{
    //                 total=total+(mward[i].name*(mward[i].val-1014)*0.60)+(1014*mward[i].name);
          
    //             }                }
    //     }
    // }
    // else if(sak=="raygarh2"){
    //     for(let i=0;i<ward.length;i++){
    //         if(bhumi[i]=="N"){
    //             warr.push(0);
    //         }
    //         else{
    //             for(let j=0;j<obj1.length;j++){
    //                 if(bhumi[i]==obj1[j].name){
    //                    warr.push(obj1[j].price);
    //                 }
    //             }
    //         }
    //     }
    //     for(let i=0;i<hbumi.length;i++){
    //         if(hbumi[i]=="N"){
    //             Hector.push(0);
    //         }
    //         else{
    //             let to;
    //             let tt=0;
    //             if(ty[i]!="k"){

    //                 for(let j=0;j<objH1.length;j++){
    //                     if(hbumi[i]==objH1[j].name){
    //                         to=objH1[j].price*(rakba[i]/10120)*2.5;
    //                         tt=tt+to;
    //                     }
    //                 }

    //             }
    //             else{
    //                 for(let j=0;j<objH1.length;j++){
    //                     if(hbumi[i]==objH1[j].name){
    //                         to=objH1[j].price*(rakba[i]/10120);
    //                         tt=tt+to;
    //                     }
    //                 }
    //             }
    //                 for(let j=0;j<fobj.length;j++){
    //                     if(fasl[i]==fobj[j].name){
    //                         tt=tt+(fobj[j].per*to)/100;
    //                     }
    //                 }
        
    //                 for(let j=0;j<robj.length;j++){
    //                     if(road[i]==robj[j].name){
    //                         tt=tt+(robj[j].per*to)/100;
    //                     }
    //                 }
                
    
    //             Hector.push(tt);
    //         }
    //     }

    //     for(let i=0;i<warr.length;i++){
    //         if(warr[i]!=0){
    //             let flag=0;
    //             for(let j=0;j<mward.length;j++){
    //                 if(mward[j].name==warr[i]){
    //                     if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
    //                         mward[j].val=mward[j].val+Number(rakba[i]);
    //                         flag=1;
    //                         break;
    //                     }
    //                 }
    //             }
    //                 if(flag==0){
    //                     let ob={
    //                         name:warr[i],
    //                         val:Number(rakba[i]),
    //                         type:ty[i]
    //                     }
    //                     mward.push(ob);
    //                 }
    //         } 
    //     }

    //     for(let i=0;i<Hector.length;i++){
    //         total=total+Hector[i];
    //     }

    //     for(let i=0;i<mward.length;i++){
    //         if(mward[i].type=="k"){
    //             if(mward[i].val<=506){
    //                 total=total+(mward[i].name*mward[i].val);
    //             }
    //             else{
    //                 total=total+(mward[i].name*(mward[i].val-506)*0.25)+(506*mward[i].name);
          
    //             }
    //         }else{
    //             if(mward[i].val<=1014){
    //                 total=total+(mward[i].name*mward[i].val);
    //             }
    //             else{
    //                 total=total+(mward[i].name*(mward[i].val-1014)*0.60)+(1014*mward[i].name);
          
    //             }                }
    //     }
    // }
    // else if(sak=="raygarh3"){
    //     for(let i=0;i<ward.length;i++){
    //         if(bhumi[i]=="N"){
    //             warr.push(0);
    //         }
    //         else{
    //             for(let j=0;j<obj1.length;j++){
    //                 if(bhumi[i]==obj1[j].name){
    //                    warr.push(obj1[j].price);
    //                 }
    //             }
    //         }
    //     }
    //     for(let i=0;i<hbumi.length;i++){
    //         if(hbumi[i]=="N"){
    //             Hector.push(0);
    //         }
    //         else{
    //             let to;
    //             let tt=0;
    //             if(ty[i]=="pa"){

    //                 for(let j=0;j<objH1.length;j++){
    //                     if(hbumi[i]==objH1[j].name){
    //                         to=objH1[j].price*(rakba[i]/10120)*2.5;
    //                         tt=tt+to;
    //                     }
    //                 }

    //             }
    //             else{
    //                 for(let j=0;j<objH1.length;j++){
    //                     if(hbumi[i]==objH1[j].name){
    //                         to=objH1[j].price*(rakba[i]/10120);
    //                         tt=tt+to;
    //                     }
    //                 }
    //             }
    //                 for(let j=0;j<fobj.length;j++){
    //                     if(fasl[i]==fobj[j].name){
    //                         tt=tt+(fobj[j].per*to)/100;
    //                     }
    //                 }
        
    //                 for(let j=0;j<robj.length;j++){
    //                     if(road[i]==robj[j].name){
    //                         tt=tt+(robj[j].per*to)/100;
    //                     }
    //                 }
                
    
    //             Hector.push(tt);
    //         }
    //     }

    //     for(let i=0;i<warr.length;i++){
    //         if(warr[i]!=0){
    //             let flag=0;
    //             for(let j=0;j<mward.length;j++){
    //                 if(mward[j].name==warr[i]){
    //                     if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
    //                         mward[j].val=mward[j].val+Number(rakba[i]);
    //                         flag=1;
    //                         break;
    //                     }
    //                 }
    //             }
    //                 if(flag==0){
    //                     let ob={
    //                         name:warr[i],
    //                         val:Number(rakba[i]),
    //                         type:ty[i]
    //                     }
    //                     mward.push(ob);
    //                 }
    //         } 
    //     }

    //     for(let i=0;i<Hector.length;i++){
    //         total=total+Hector[i];
    //     }

    //     for(let i=0;i<mward.length;i++){
    //         if(mward[i].type=="k"){
    //             if(mward[i].val<=506){
    //                 total=total+(mward[i].name*mward[i].val);
    //             }
    //             else if(mward[i].val<=1012){
    //                 total=total+(mward[i].name*(mward[i].val-506)*0.8)+(506*mward[i].name);
          
    //             }else{
    //                 total=total+(mward[i].name*(mward[i].val-1012)*0.5)+(506*mward[i].name*0.8)+(506*mward[i].name);
          
    //             }
    //         }else{
    //             if(mward[i].val<=1014){
    //                 total=total+(mward[i].name*mward[i].val);
    //             }
    //             else{
    //                 total=total+(mward[i].name*(mward[i].val-1014)*0.60)+(1014*mward[i].name);
          
    //             }   
    //         }
    //     }
    // }
    // else if(sak=="mahasam"){
    //     for(let i=0;i<ward.length;i++){
    //         if(bhumi[i]=="N"){
    //             warr.push(0);
    //         }
    //         else{
    //             for(let j=0;j<obj1.length;j++){
    //                 if(bhumi[i]==obj1[j].name){
    //                    warr.push(obj1[j].price);
    //                 }
    //             }
    //         }
    //     }
    //     for(let i=0;i<hbumi.length;i++){
    //         if(hbumi[i]=="N"){
    //             Hector.push(0);
    //         }
    //         else{
    //             let to;
    //             let tt=0;
    //             if(ty[i]=="pa"){

    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120)*2.5;
    //                         tt=tt+to;
    //                     }
    //                 }

    //             }
    //             else{
    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120);
    //                         tt=tt+to;
    //                     }
    //                 }
    //             }
    //                 for(let j=0;j<fobj.length;j++){
    //                     if(fasl[i]==fobj[j].name){
    //                         tt=tt+(fobj[j].per*to)/100;
    //                     }
    //                 }
        
    //                 for(let j=0;j<robj.length;j++){
    //                     if(road[i]==robj[j].name){
    //                         tt=tt+(robj[j].per*to)/100;
    //                     }
    //                 }
                
    
    //             Hector.push(tt);
    //         }
    //     }

    //     for(let i=0;i<warr.length;i++){
    //         if(warr[i]!=0){
    //             let flag=0;
    //             for(let j=0;j<mward.length;j++){
    //                 if(mward[j].name==warr[i]){
    //                     if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
    //                         mward[j].val=mward[j].val+Number(rakba[i]);
    //                         flag=1;
    //                         break;
    //                     }
    //                 }
    //             }
    //                 if(flag==0){
    //                     let ob={
    //                         name:warr[i],
    //                         val:Number(rakba[i]),
    //                         type:ty[i]
    //                     }
    //                     mward.push(ob);
    //                 }
    //         } 
    //     }

    //     for(let i=0;i<Hector.length;i++){
    //         total=total+Hector[i];
    //     }

    //     for(let i=0;i<mward.length;i++){
    //         total=total+(mward[i].name*mward[i].val);                 
    //     }
    // }
    // else if(sak=="sitapur"){
    //     for(let i=0;i<ward.length;i++){
    //         if(bhumi[i]=="N"){
    //             warr.push(0);
    //         }
    //         else{
    //             for(let j=0;j<obj1.length;j++){
    //                 if(bhumi[i]==obj1[j].name){
    //                    warr.push(obj1[j].price);
    //                 }
    //             }
    //         }
    //     }
    //     for(let i=0;i<hbumi.length;i++){
    //         if(hbumi[i]=="N"){
    //             Hector.push(0);
    //         }
    //         else{
    //             let to;
    //             let tt=0;
    //             if(ty[i]=="pa"){

    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120)*2.5;
    //                         tt=tt+to;
    //                     }
    //                 }

    //             }
    //             else{
    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120);
    //                         tt=tt+to;
    //                     }
    //                 }
    //             }
    //                 for(let j=0;j<fobj.length;j++){
    //                     if(fasl[i]==fobj[j].name){
    //                         tt=tt+(fobj[j].per*to)/100;
    //                     }
    //                 }
        
    //                 for(let j=0;j<robj.length;j++){
    //                     if(road[i]==robj[j].name){
    //                         tt=tt+(robj[j].per*to)/100;
    //                     }
    //                 }
                
    
    //             Hector.push(tt);
    //         }
    //     }

    //     for(let i=0;i<warr.length;i++){
    //         if(warr[i]!=0){
    //             let flag=0;
    //             for(let j=0;j<mward.length;j++){
    //                 if(mward[j].name==warr[i]){
    //                     if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
    //                         mward[j].val=mward[j].val+Number(rakba[i]);
    //                         flag=1;
    //                         break;
    //                     }
    //                 }
    //             }
    //                 if(flag==0){
    //                     let ob={
    //                         name:warr[i],
    //                         val:Number(rakba[i]),
    //                         type:ty[i]
    //                     }
    //                     mward.push(ob);
    //                 }
    //         } 
    //     }

    //     for(let i=0;i<Hector.length;i++){
    //         total=total+Hector[i];
    //     }

    //     for(let i=0;i<mward.length;i++){
    //         total=total+(mward[i].name*mward[i].val);                 
    //     }
    // }
    // else if(sak=="surajpur"){
    //     for(let i=0;i<ward.length;i++){
    //         if(bhumi[i]=="N"){
    //             warr.push(0);
    //         }
    //         else{
    //             for(let j=0;j<obj1.length;j++){
    //                 if(bhumi[i]==obj1[j].name){
    //                    warr.push(obj1[j].price);
    //                 }
    //             }
    //         }
    //     }
    //     for(let i=0;i<hbumi.length;i++){
    //         if(hbumi[i]=="N"){
    //             Hector.push(0);
    //         }
    //         else{
    //             let to;
    //             let tt=0;
    //             if(ty[i]=="pa"){

    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120)*2.5;
    //                         tt=tt+to;
    //                     }
    //                 }

    //             }
    //             else{
    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120);
    //                         tt=tt+to;
    //                     }
    //                 }
    //             }
    //                 for(let j=0;j<fobj.length;j++){
    //                     if(fasl[i]==fobj[j].name){
    //                         tt=tt+(fobj[j].per*to)/100;
    //                     }
    //                 }
        
    //                 for(let j=0;j<robj.length;j++){
    //                     if(road[i]==robj[j].name){
    //                         tt=tt+(robj[j].per*to)/100;
    //                     }
    //                 }
                
    
    //             Hector.push(tt);
    //         }
    //     }

    //     for(let i=0;i<warr.length;i++){
    //         if(warr[i]!=0){
    //             let flag=0;
    //             for(let j=0;j<mward.length;j++){
    //                 if(mward[j].name==warr[i]){
    //                     if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
    //                         mward[j].val=mward[j].val+Number(rakba[i]);
    //                         flag=1;
    //                         break;
    //                     }
    //                 }
    //             }
    //                 if(flag==0){
    //                     let ob={
    //                         name:warr[i],
    //                         val:Number(rakba[i]),
    //                         type:ty[i]
    //                     }
    //                     mward.push(ob);
    //                 }
    //         } 
    //     }

    //     for(let i=0;i<Hector.length;i++){
    //         total=total+Hector[i];
    //     }

    //     for(let i=0;i<mward.length;i++){
    //         total=total+(mward[i].name*mward[i].val);                 
    //     }
    // }
    // else if(sak=="patna"){
    //     for(let i=0;i<ward.length;i++){
    //         if(bhumi[i]=="N"){
    //             warr.push(0);
    //         }
    //         else{
    //             for(let j=0;j<obj1.length;j++){
    //                 if(bhumi[i]==obj1[j].name){
    //                    warr.push(obj1[j].price);
    //                 }
    //             }
    //         }
    //     }
    //     for(let i=0;i<hbumi.length;i++){
    //         if(hbumi[i]=="N"){
    //             Hector.push(0);
    //         }
    //         else{
    //             let to;
    //             let tt=0;
    //             if(ty[i]=="pa"){

    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120)*2.5;
    //                         tt=tt+to;
    //                     }
    //                 }

    //             }
    //             else{
    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120);
    //                         tt=tt+to;
    //                     }
    //                 }
    //             }
    //                 for(let j=0;j<fobj.length;j++){
    //                     if(fasl[i]==fobj[j].name){
    //                         tt=tt+(fobj[j].per*to)/100;
    //                     }
    //                 }
        
    //                 for(let j=0;j<robj.length;j++){
    //                     if(road[i]==robj[j].name){
    //                         tt=tt+(robj[j].per*to)/100;
    //                     }
    //                 }
                
    
    //             Hector.push(tt);
    //         }
    //     }

    //     for(let i=0;i<warr.length;i++){
    //         if(warr[i]!=0){
    //             let flag=0;
    //             for(let j=0;j<mward.length;j++){
    //                 if(mward[j].name==warr[i]){
    //                     if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
    //                         mward[j].val=mward[j].val+Number(rakba[i]);
    //                         flag=1;
    //                         break;
    //                     }
    //                 }
    //             }
    //                 if(flag==0){
    //                     let ob={
    //                         name:warr[i],
    //                         val:Number(rakba[i]),
    //                         type:ty[i]
    //                     }
    //                     mward.push(ob);
    //                 }
    //         } 
    //     }

    //     for(let i=0;i<Hector.length;i++){
    //         total=total+Hector[i];
    //     }

    //     for(let i=0;i<mward.length;i++){
    //         total=total+(mward[i].name*mward[i].val);                 
    //     }
    // }
    // else if(sak=="baloda"){
    //     for(let i=0;i<ward.length;i++){
    //         if(bhumi[i]=="N"){
    //             warr.push(0);
    //         }
    //         else{
    //             for(let j=0;j<obj1.length;j++){
    //                 if(bhumi[i]==obj1[j].name){
    //                    warr.push(obj1[j].price);
    //                 }
    //             }
    //         }
    //     }
    //     for(let i=0;i<hbumi.length;i++){
    //         if(hbumi[i]=="N"){
    //             Hector.push(0);
    //         }
    //         else{
    //             let to;
    //             let tt=0;
    //             if(ty[i]=="pa"){

    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120)*2.5;
    //                         tt=tt+to;
    //                     }
    //                 }

    //             }
    //             else{
    //                 for(let j=0;j<objH.length;j++){
    //                     if(hbumi[i]==objH[j].name){
    //                         to=objH[j].price*(rakba[i]/10120);
    //                         tt=tt+to;
    //                     }
    //                 }
    //             }
    //                 for(let j=0;j<fobj.length;j++){
    //                     if(fasl[i]==fobj[j].name){
    //                         tt=tt+(fobj[j].per*to)/100;
    //                     }
    //                 }
        
    //                 for(let j=0;j<robj.length;j++){
    //                     if(road[i]==robj[j].name){
    //                         tt=tt+(robj[j].per*to)/100;
    //                     }
    //                 }
                
    
    //             Hector.push(tt);
    //         }
    //     }

    //     for(let i=0;i<warr.length;i++){
    //         if(warr[i]!=0){
    //             let flag=0;
    //             for(let j=0;j<mward.length;j++){
    //                 if(mward[j].name==warr[i]){
    //                     if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
    //                         mward[j].val=mward[j].val+Number(rakba[i]);
    //                         flag=1;
    //                         break;
    //                     }
    //                 }
    //             }
    //                 if(flag==0){
    //                     let ob={
    //                         name:warr[i],
    //                         val:Number(rakba[i]),
    //                         type:ty[i]
    //                     }
    //                     mward.push(ob);
    //                 }
    //         } 
    //     }

    //     for(let i=0;i<Hector.length;i++){
    //         total=total+Hector[i];
    //     }

    //     for(let i=0;i<mward.length;i++){
    //         total=total+(mward[i].name*mward[i].val);                 
    //     }
    // }

// Stamp

var पंजीयन=0
var संलग्न=0
var अतिरिक्त=0
var योग=0
var पंचायत=0
var उपकार=0
var स्टाम्प=0
var pop=0

app.get("/stamp",async (req,res)=>{
    const fou= await User.findOne({email:req.cookies.useremail})
    let obj;
    let obj1;
    let pra=0;
    let market=0;
    let mauk;
    for(let i=0;i<fou.application.length;i++){
        if(fou.application[i].number==req.query.number){
            obj=fou.application[i].Dastavej[0].document;
            obj1=fou.application[i].Dastavej[0].subdocument;
            console.log(fou.application[i].Sampati)
            if(fou.application[i].Sampati.length!=0){
                market=Number(fou.application[i].Sampati[0].marketValue)
            }
            const doc= await Doc.findOne({name:obj})
            for(let j=0;j<doc.sub.length;j++){
                if(doc.sub[j].name==obj1){
                    mauk=doc.sub[j].SamptiMauk
                }
            }
            console.log(mauk)
            for(let j=0;j<fou.application[i].Dastavej[0].Partifal.length;j++){
                pra=pra+Number(fou.application[i].Dastavej[0].Partifal[j].amount)
            }
            break;
        }
    }
    Doc.findOne({name:obj}).then((found)=>{
        for(let i=0;i<found.sub.length;i++){
            if(found.sub[i].name==obj1){
                res.render("stamp",{docum:found.sub[i].Reason,pratifal:pra,mauk:mauk,appli:req.query.number,market:market,pop:pop,स्टाम्प:स्टाम्प,उपकार:उपकार,पंचायत:पंचायत,योग:योग,अतिरिक्त:अतिरिक्त,संलग्न:संलग्न,पंजीयन:पंजीयन})
                pop=0
                स्टाम्प=0
                पंचायत=0
                उपकार=0
                योग=0
                अतिरिक्त=0
                संलग्न=0
                पंजीयन=0
                break;
            }
        }
    })
})

app.get("/diagram",async (req,res)=>{
    const fou= await User.findOne({email:req.cookies.useremail})
    
    res.render("diagram",{appli:req.query.number})

})

app.post("/diagram",async (req,res)=>{
    const fou= await User.findOne({email:req.cookies.useremail})
    let obj={
        dia:req.body.diagram,
     }
     let arr=[]
     arr.push(obj)

     for(let i=0;i<fou.application.length;i++){
         if(fou.application[i].number==req.query.number){
             fou.application[i].diagram=arr
             break;
         }
     }

     await fou.save().then(()=>{
        if(req.body.diagram=="हां"){
            res.redirect(`/draw?number=${req.query.number}`)
        }
        else{
            res.redirect(`/katchat?number=${req.query.number}`)
        }
     })


})

// Define a route to render the form
app.get("/draw", (req, res) => {
    res.render("aa",{appli:req.query.number});
});

// Define a route to handle form submissions
app.post("/draw/submit",async  (req, res) => {
    const fou= await User.findOne({email:req.cookies.useremail})
    let obj={
        drawing:req.body.drawing,
     }
     let arr=[]
     arr.push(obj)


     for(let i=0;i<fou.application.length;i++){
        if(fou.application[i].number==req.query.number){
            fou.application[i].map=arr
            break;
        }
    }

    await fou.save().then(()=>{
        res.redirect(`/katchat?number=${req.query.number}`)
    })

});

app.get("/katchat",async (req,res)=>{
    const fou= await User.findOne({email:req.cookies.useremail})
    res.render("katjat",{appli:req.query.number})

})

app.post("/katchat",async (req,res)=>{
    const fou= await User.findOne({email:req.cookies.useremail})
    let obj={
        बाजार:req.body.बाजार,
        प्रतिफल:req.body.प्रतिफल,
        निर्माण1:req.body.निर्माण1,
        निर्माण:req.body.निर्माण,
        खसरा1:req.body.खसरा1,
        खसराि:req.body.खसराि,
        City:req.body.City,
        Gao:req.body.Gao,
        Patwari:req.body.Patwari,
        Rajiv:req.body.Rajiv,
        Tehsil:req.body.Tehsil,
        Jila:req.body.Jila,
     }
     let arr=[]
     arr.push(obj)

     for(let i=0;i<fou.application.length;i++){
         if(fou.application[i].number==req.query.number){
             fou.application[i].katchat=arr
             break;
         }
     }

     await fou.save().then(()=>{
         res.redirect(`/pakashkar?number=${req.query.number}`)
     })


})

app.post("/stamp",async (req,res)=>{
    const fou= await User.findOne({email:req.cookies.useremail})
    let actual=Number(req.body.actual);
    if(Number(req.body.actual)<Number(req.body.sell)){
        actual=Number(req.body.sell)
    }
    let document
    let sub1
    for(let i=0;i<fou.application.length;i++){
        if(fou.application[i].number==req.query.number){
            document=fou.application[i].Dastavej[0].document
            sub1=fou.application[i].Dastavej[0].subdocument
            break;
        }
    }
    let upk
    let jan
    let sta
    let panji
    let total_st=0;
    console.log(document)
    await Doc.findOne({name: document}).then(async (found)=>{
        for(let i=0;i<found.sub.length;i++){
            if(found.sub[i].name==sub1){
                if(found.sub[i].Type=="Percentage"){
                    upk=(Number(found.sub[i].Upkar)*Number(actual))/100;
                    jan=(Number(found.sub[i].Janpad)*Number(actual))/100;
                    sta=(Number(found.sub[i].Stamp)*Number(actual))/100;
                    total_st=upk+jan+sta;
                }
                else if(found.sub[i].Type=="Fixed"){
                    console.log("Yes12")
                    upk=Number(found.sub[i].Upkar);
                    jan=Number(found.sub[i].Janpad);
                    sta=Number(found.sub[i].Stamp);
                    total_st=upk+jan+sta;
                    console.log("Yes12")
                }
                else{
                    upk=Numbner(found.sub[i].Upkar)*Number(req.header.part);
                    jan=Number(found.sub[i].Janpad)*Number(req.header.part);
                    sta=Number(found.sub[i].Stamp)*Number(req.header.part);
                    total_st=upk+jan+sta;
                }

                if(found.sub[i].PanType=="Percentage"){
                    panji=(Number(found.sub[i].panjikar)*Number(actual))/100;
                }
                else if(found.sub[i].PanType=="Fixed"){
                    panji=Number(found.sub[i].panjikar);
                }
                else{
                    panji=Number(found.sub[i].panjikar)*Number(req.header.part);
                }

           
               
                if(req.body.prepaid=="Yes"){
                    sta=sta-Number(req.body.pst)
                    total_st=upk+jan+sta;
        
                    panji=panji-Number(req.body.ppt)
                }

                if(found.sub[i].SamptiMauk=="Yes"){
                    if(req.body.cent=="Yes"){
                        sta=sta+1100;
                        total_st=total_st+1100;
                    }
                }
                let balance = (Math.round(total_st/ 50) * 50)-(total_st);


                console.log("Yes12")
                // let total=total_st+panji
                pop=1
                स्टाम्प=sta
                पंचायत=jan
                उपकार=upk
                योग=total_st
                अतिरिक्त=balance
                संलग्न=balance+total_st
                पंजीयन=panji
                res.redirect(`/stamp?number=${req.query.number}`)
     
                
            }
        }
    }).catch((e)=>{
        console.log(e)
    })
})

app.get("/stamp12", async (req,res)=>{
    const fou= await User.findOne({email:req.cookies.useremail})

      let obj={
                   stamp:req.query.स्टाम्प,
                   upkar:req.query.उपकार,
                   janpad:req.query.पंचायत,
                   stamp_total:req.query.संलग्न,
                   balance:req.query.अतिरिक्त,
                   panjiyan:req.query.पंजीयन,
                   total:Number(req.query.संलग्न)+Number(req.query.पंजीयन)
                }
                let arr=[]
                arr.push(obj)

                for(let i=0;i<fou.application.length;i++){
                    if(fou.application[i].number==req.query.number){
                        fou.application[i].Stamp=arr
                        break;
                    }
                }

                await fou.save().then(()=>{
                    res.redirect(`/diagram?number=${req.query.number}`)
                })
})

// pakashkar
var doc_valid23=0


app.get("/pakashkar",async (req,res)=>{
    const fou= await User.findOne({email:req.cookies.useremail})
    let parray2=[];
    let parray4=[];
    let obj;
   
    let access="Yes";
    let app=req.query.number;
    for(let i=0;i<fou.application.length;i++){
        if(fou.application[i].number==req.query.number){
            obj=fou.application[i].Dastavej[0].document;
            parray2=fou.application[i].Pakshkar;
            break;
        }
    }
    console.log(access)
    Verify.find().then((found)=>{
        Doc.findOne({name:obj}).then((found1)=>{
            for(let i=0;i<found1.pakskarbutt.length;i++){
                if(found1.pakskarbutt[i].minimum=="हां"){
                    for(let j=0;j<parray2.length;j++){
                        if(parray2[j].type1==found1.pakskarbutt[i].name){
                            let fl=false;
                            for(let k=0;k<parray4.length;k++){
                                if(parray4[k].name==found1.pakskarbutt[i].name){
                                    parray4[k].value++;
                                    fl=true;
                                    break;
                                }
                            }
                            if(!fl){
                                let obj1={
                                    name:found1.pakskarbutt[i].name,
                                    value:1
                                }
                                parray4.push(obj1)
                            }

                        }
                    }
                }
        
            }
            for(let i=0;i<found1.pakskarbutt.length;i++){
                if(found1.pakskarbutt[i].minimum=="हां"){
                    let fl=true;
                            for(let k=0;k<parray4.length;k++){
                                if(parray4[k].name==found1.pakskarbutt[i].name){
                                        fl=false;
                                        break;
                                }
                            }
                            if(fl){
                                let obj1={
                                    name:found1.pakskarbutt[i].name,
                                    value:0
                                }
                                parray4.push(obj1)
                            }
                }
        
            }
            for(let i=0;i<found1.pakskarbutt.length;i++){
                if(found1.pakskarbutt[i].minimum=="हां"){
                    let fl=true;
                            for(let k=0;k<parray4.length;k++){
                                if(parray4[k].name==found1.pakskarbutt[i].name){
                                    console.log(parray4[k].value)
                                    if(parray4[k].value<found1.pakskarbutt[i].partition){
                                        fl=false;
                                        break;
                                    }
                                }
                            }
                            console.log(fl)
                            if(!fl){
                                console.log(fl)
                                access="no"
                                break;
                            }
                }
        
            }
            console.log(access)

         
            res.render("pakashkar",{parray:found,parray1:found1.people,parray2:parray2,app:app,access:access,parray3:found1.pakskarbutt,parray4:parray4,doc_valid23:doc_valid23})
            doc_valid23=0

        })
    })
})


app.get("/pakashkar/delete",async (req,res)=>{
    const fou= await User.findOne({email:req.cookies.useremail})
    let parray2=[];
   
    for(let i=0;i<fou.application.length;i++){
        if(fou.application[i].number==req.query.number){

            for(let j=0;j<fou.application[i].Pakshkar.length;j++){
                if(fou.application[i].Pakshkar[j].type1!=req.query.type || fou.application[i].Pakshkar[j].name!=req.query.name){
                    parray2.push(fou.application[i].Pakshkar[j])
                }
            }
            fou.application[i].Pakshkar=parray2
        }
    }
    await fou.save().then(()=>{
        res.redirect(`/pakashkar?number=${req.query.number}`)
    })
   
})

app.post("/pakashkar",async (req,res)=>{
    console.log(req.body);
    let obj={
        type1:req.body.type1,
        gender:req.body.gender,
        verify:req.body.verify,
        category:req.body.category,
        religion:req.body.religion,
        number1:req.body.number1,
        Designation:req.body.Designation,
        DOB:req.body.DOB,
        number:req.body.number,
        name:req.body.name,
        father:req.body.father,
        अंगूठा:req.body.अंगूठा,
        हस्ताक्षर:req.body.हस्ताक्षर,
        relition:req.body.relition,
        age:req.body.age,
        panCardRadio:req.body.panCardRadio,
        panNumber:req.body.panNumber,
    }
    const fou= await User.findOne({email:req.cookies.useremail})
    for(let i=0;i<fou.application.length;i++){
        if(fou.application[i].number==req.query.number){
            let fl=false;
            for(let j=0;j<fou.application[i].Pakshkar.length;j++){
                if(fou.application[i].Pakshkar[j].type1==req.body.type1 && fou.application[i].Pakshkar[j].name==req.body.name){
                    fl=true;
                    break;
                }
            }
            if(!fl){
                fou.application[i].Pakshkar.push(obj);
            }
            else{
                doc_valid23=1
            }
            break;
        }
    }
    await fou.save().then(()=>{
        res.redirect(`/pakashkar?number=${req.query.number}`)
    })
})

// Template
app.get("/templete",async (req,res)=>{
    const fou= await User.findOne({email:req.cookies.useremail})
    let obj
    let obj1
    for(let i=0;i<fou.application.length;i++){
        if(fou.application[i].number==req.query.number){
            obj=fou.application[i].Dastavej[0].document;
            obj1=fou.application[i].Dastavej[0].subdocument;
            break;
        }
    }
    Doc.findOne({name:obj}).then( (found)=>{
        for(let i=0;i<found.sub.length;i++){
            if(found.sub[i].name==obj1){
                res.render("templete",{unit1:found.sub[i].templete,number:req.query.number})
            }
        }

    })
})

app.post("/templete",async (req,res)=>{
    console.log(req.body);
    const fou= await User.findOne({email:req.cookies.useremail})
    let obj={
        name:req.body.name,
        body:req.body.Description
    }
    let arr=[];
    for(let i=0;i<fou.application.length;i++){
        if(fou.application[i].number==req.query.number){
            fou.application[i].Templete=arr;
            break;
        }
    }
    await fou.save().then(async ()=>{
        const fou1= await User.findOne({email:req.cookies.useremail})
        let object;
        for(let i=0;i<fou1.application.length;i++){
            if(fou1.application[i].number==req.query.number){
                console.log(fou1.application[i])
                object=fou1.application[i];
                break;
            }
        }
        console.log(object)
        res.send(object)
    })
})




// admin

// User


app.get("/admin/user",(req,res)=>{
    User.find().then((found)=>{
        res.render("admin_user",{parray:found})
    })
})

    // Document

    var doc_valid=0;



    app.get("/admin/document",(req,res)=>{
        res.render("admin_document",{doc_valid:doc_valid})
    })

    app.get("/admin/document/list",(req,res)=>{
        Doc.find().then((found)=>{
            res.render("admin_document_list",{parray:found})
        })
    })
    app.get("/admin/:name/document/delete",(req,res)=>{
        Doc.deleteOne({name:req.params.name}).then((found)=>{
            res.redirect("/admin/document/list")
        })
    })

    app.post("/admin/document",(req,res)=>{
        const name=req.body.name
        const description=req.body.description
        const par=req.body.par
        const adi=req.body.adi
        const PRATIFAL=req.body.PRATIFAL
        const Loan=req.body.Loan
        const Ledge=req.body.Ledge
        const Sampati=req.body.Sampati
        Doc.findOne({name:name}).then(async(found)=>{
            if(found){
                doc_valid=1;
            }else{
                const doc=new Doc({
                    name: name,
                    description: description,
                    par: par,
                    adi: adi,
                    PRATIFAL:PRATIFAL,
                    Loan:Loan,
                    Ledge:Ledge,
                    Sampati:Sampati,
                    sub: [],
                    people:[]
                })
                await doc.save();
            }
            res.redirect("/admin/document")
        }).catch((e)=>{
            console.log(e)
        })
    })

    app.get("/admin/:name/document/update",(req,res)=>{
        Doc.findOne({name:req.params.name}).then((found)=>{
            res.render("admin_document_update",{found:found})
        })
    })

    app.post("/admin/document/update",async(req,res)=>{
       const name=req.body.name
       const description=req.body.description
       const par=req.body.par
       const adi=req.body.adi
       const PRATIFAL=req.body.PRATIFAL
       const Loan=req.body.Loan
       const Ledge=req.body.Ledge
       const Sampati=req.body.Sampati
       const found=await Doc.findOne({name:name})
       found.description=description
       found.par=par
       found.adi=adi
       found.PRATIFAL=PRATIFAL
       found.Loan=Loan
       found.Ledge=Ledge
       found.Sampati=Sampati
       await found.save().then(()=>{
        res.redirect("/admin/document/list")
       })
    })

    //DastvajJilla

    var DastvajJilla_valid=0;

    app.get("/admin/DastvajJilla",(req,res)=>{
        res.render("admin_dasjilla",{DastvajJilla_valid:DastvajJilla_valid})
    })

    app.get("/admin/DastvajJilla/list",(req,res)=>{
        DastvajJila.find().then((found)=>{
            res.render("admin_dasjilla_list",{parray:found})
        })
    })
    app.get("/admin//DastvajJilla/delete",(req,res)=>{
        DastvajJila.deleteOne({name:req.query.name}).then((found)=>{
            res.redirect("/admin/DastvajJilla/list")
        })
    })

    app.post("/admin/DastvajJilla",(req,res)=>{
        const name=req.body.name
        DastvajJila.findOne({name:name}).then(async(found)=>{
            if(found){
                DastvajJilla_valid=1;
            }else{
                const dastvajJila=new DastvajJila({
                    name: name,
                    office:[]
                })
                await dastvajJila.save();
            }
            res.redirect("/admin/DastvajJilla")
        }).catch((e)=>{
            console.log(e)
        })
    })

      //DastvajOffice

      var DastvajOffice_valid=0;

      app.get("/admin/DastvajOffice",(req,res)=>{

        DastvajJila.find().then((found)=>{
            res.render("admin_office",{DastvajOffice_valid:DastvajOffice_valid,parray:found})
            DastvajOffice_valid=0;
        })
    })
  
      app.get("/admin/DastvajOffice/list",(req,res)=>{
          DastvajJila.find().then((found)=>{
              res.render("admin_office_list",{parray:found,k:1})
          })
      })
      app.get("/admin/:name/:dname/DastvajOffice/delete",(req,res)=>{
        DastvajJila.updateOne({name:req.params.dname},{$pull:{office: {name:req.params.name}}}).then((found)=>{
            res.redirect("/admin/DastvajOffice/list")
        })
      })
  
      app.post("/admin/DastvajOffice",async (req,res)=>{
        const name=req.body.name
        const Jilla=req.body.Jilla
       
        const found= await DastvajJila.findOne({name:Jilla})
        for(let i=0;i<found.office.length;i++){
            if(name==found.office[i].name){
                DastvajOffice_valid=1;
                    break;
                }
            }
        if(DastvajOffice_valid==0){
            const obj={
                name:name,
            }
            found.office.push(obj)
            await found.save();
        }
        res.redirect("/admin/DastvajOffice")
        
      })

    // Sub document
    var sub_valid=0;

    app.get("/admin/sub",(req,res)=>{
        Doc.find().then((found)=>{
            res.render("admin_sub",{sub_valid:sub_valid,parray:found})
            sub_valid=0;
        })
    })

    app.get("/admin/:name/:dname/sub/delete",(req,res)=>{
        Doc.updateOne({name:req.params.dname},{$pull:{sub: {name:req.params.name}}}).then((found)=>{
            res.redirect("/admin/sub/list")
        })
    })
    app.get("/admin/:name/:dname/sub/update",async(req,res)=>{ 
        const parray=await  Doc.find()
        Doc.findOne({name:req.params.dname}).then((found)=>{
            for(let i=0;i<found.sub.length;i++){
                if(req.params.name==found.sub[i].name){
                    res.render("admin_sub_update",{name:req.params.name,description:found.sub[i].description,parray:parray,Type:found.sub[i].Type,Stamp:found.sub[i].Stamp,Upkar:found.sub[i].Upkar,Janpad:found.sub[i].Janpad,panjikar:found.sub[i].panjikar,dname:req.params.dname,PanType:found.sub[i].PanType,Partiton:found.sub[i].Partiton,Paksh:found.sub[i].Paksh,SamptiRequi:found.sub[i].SamptiRequi,SamptiMauk:found.sub[i].SamptiMauk,Pakshsam:found.sub[i].Pakshsam})
                    
                    break;
                }
            }
        })
    })

    app.get("/admin/sub/list",(req,res)=>{
        Doc.find().then((found)=>{
            res.render("admin_sub_list",{parray:found,k:1})
        })
    })

    app.post("/admin/sub",async (req,res)=>{
        const name=req.body.name
        const description=req.body.description
        const विलेख=req.body.विलेख
        const Type=req.body.Type
        const Stamp=req.body.Stamp
        const Upkar=req.body.Upkar
        const Pakshsam=req.body.Pakshsam
        const Janpad=req.body.Janpad
        const panjikar=req.body.panjikar
        const PanType=req.body.PanType
        const Partiton=req.body.Partiton
        const Paksh=req.body.Paksh
        const SamptiRequi=req.body.SamptiRequi
        const SamptiMauk=req.body.SamptiMauk
        const found= await Doc.findOne({name:विलेख})
        for(let i=0;i<found.sub.length;i++){
            if(name==found.sub[i].name){
                sub_valid=1;
                    break;
                }
            }
        if(sub_valid==0){
            const obj={
                name:name,
                description:description,
                Stamp:Stamp,
                Upkar:Upkar,
                Janpad:Janpad,
                panjikar: panjikar,
                Type:Type,
                SamptiRequi:SamptiRequi,
                Paksh:Paksh,
                PanType:PanType,
                Partiton:Partiton,
                SamptiMauk:SamptiMauk,
                Pakshsam:Pakshsam,
                Reason:[],
                templete:[],
            }
            found.sub.push(obj)
            await found.save();
        }
        res.redirect("/admin/sub")
        
    })


    app.post("/admin/sub/:dname/update",async(req,res)=>{
        const विलेख=req.params.dname
        const name=req.body.name
        const description=req.body.description
        const Type=req.body.Type
        const Stamp=req.body.Stamp
        const Upkar=req.body.Upkar
        const Pakshsam=req.body.Pakshsam
        const Janpad=req.body.Janpad
        const panjikar=req.body.panjikar
        const PanType=req.body.PanType
        const Partiton=req.body.Partiton
        const Paksh=req.body.Paksh
        const SamptiRequi=req.body.SamptiRequi
        const SamptiMauk=req.body.SamptiMauk
        console.log(विलेख)
        Doc.updateOne({name:विलेख},{$set:{"sub.$[elem].description":description, "sub.$[elem].Type":Type, "sub.$[elem].Stamp":Stamp,"sub.$[elem].Upkar":Upkar,"sub.$[elem].Janpad":Janpad,"sub.$[elem].panjikar":panjikar,"sub.$[elem].PanType":PanType,"sub.$[elem].Partiton":Partiton,"sub.$[elem].Paksh":Paksh,"sub.$[elem].SamptiRequi":SamptiRequi,"sub.$[elem].Pakshsam":Pakshsam,"sub.$[elem].SamptiMauk":SamptiMauk}},{arrayFilters:[{"elem.name":name}]}).then(()=>{
            res.redirect("/admin/sub/list")
        }).catch((e)=>{
            console.log(e)
        })
    })

 

    // sampati
    var sampati_valid=0;
    app.get("/admin/sampati",(req,res)=>{
        res.render("admin_samp",{sampati_valid:sampati_valid})
        sampati_valid=0;
    })

    app.get("/admin/sampati/list",(req,res)=>{
        Sampati.find().then((found)=>{
            res.render("admin_samp_list",{parray:found})
        })
    })

    app.get("/admin/:name/sampati/delete",(req,res)=>{
        Sampati.deleteOne({name:req.params.name}).then((found)=>{
            res.redirect("/admin/sampati/list")
        })
    })
    app.get("/admin/:name/sampati/update",(req,res)=>{
        Sampati.findOne({name:req.params.name}).then((found)=>{
            res.render("admin_samp_update",{found:found})
        })
    })

    app.post("/admin/sampati",(req,res)=>{
        const name=req.body.name
        const type=req.body.type
        Sampati.findOne({name:name}).then(async(found)=>{
            if(found){
                sampati_valid=1;
            }else{
                const samp=new Sampati({
                    name:name,
                    other:type,
                })
                await samp.save();
            }
            res.redirect("/admin/sampati")
        }).catch((e)=>{
            console.log(e)
        })
    })

    app.post("/admin/sampati/update",async(req,res)=>{
        const name=req.body.name
        const type=req.body.type
       const found=await Sampati.findOne({name:name})
       found.other=type
       await found.save().then(()=>{
        res.redirect("/admin/sampati/list")
       })
    })

    // people
    var people_valid=0;

    app.get("/admin/people",(req,res)=>{
        Doc.find().then((found)=>{
            res.render("admin_people",{people_valid:people_valid,parray:found})
            people_valid=0;
        })
    })

    app.get("/admin/people/list",(req,res)=>{
        Doc.find().then((found)=>{
            res.render("admin_people_list",{parray:found,k:1})
        })
    })

    app.get("/admin/:name/:dname/people/delete",(req,res)=>{
        Doc.updateOne({name:req.params.dname},{$pull:{people: {name:req.params.name}}}).then((found)=>{
            res.redirect("/admin/people/list")
        })
    })

    app.post("/admin/people",async(req,res)=>{
        const name=req.body.name
        const विलेख=req.body.विलेख
        const found= await Doc.findOne({name:विलेख})
        for(let i=0;i<found.people.length;i++){
            if(name==found.people[i].name){
                people_valid=1;
                    break;
                }
            }
        if(people_valid==0){
            const obj={
                name:name,
            }
            found.people.push(obj)
            await found.save();
        }
        res.redirect("/admin/people")

    })


      // Tree
      var tree_valid=0;

      app.get("/admin/tree",(req,res)=>{
        res.render("admin_timber",{tree_valid:tree_valid})
        tree_valid=0;
      })
  
      app.get("/admin/tree/list",(req,res)=>{
          Tree.find().then((found)=>{
              res.render("admin_timber_list",{parray:found})
          })
      })
  
      app.get("/admin/tree/delete",(req,res)=>{
        Tree.deleteOne({name:req.query.name,quality:req.query.quality,size:req.query.size}).then((found)=>{
            res.redirect("/admin/tree/list")
        })
      })
  
      app.post("/admin/tree",async(req,res)=>{
          const name=req.body.name
          const quality=req.body.quality
          const size=req.body.size
          const price=req.body.price
          Tree.findOne({name:name,quality:quality,size:size}).then(async(found)=>{
            if(found){
                tree_valid=1;
            }else{
                const tree=new Tree({
                    name:name,
                    quality:quality,
                    size:size,
                    price:price
                })
                await tree.save();
            }
            res.redirect("/admin/tree")
        }).catch((e)=>{
            console.log(e)
        })
  
      })

      app.get("/admin/tree/update",(req,res)=>{
        Tree.findOne({name:req.query.name,quality:req.query.quality,size:req.query.size}).then((found)=>{
            res.render("admin_timber_update",{found:found})
        })
    })

    app.post("/admin/tree/update",async(req,res)=>{
       const name=req.body.name
       const quality=req.body.quality
       const size=req.body.size
       const price=req.body.price
       const found=await Tree.findOne({name:name})
       found.quality=quality
       found.size=size
       found.price=price
       await found.save().then(()=>{
        res.redirect("/admin/tree/list")
       })
    })

    // Fruit

    var fruit_valid=0;

    app.get("/admin/fruit",(req,res)=>{
      res.render("admin_fruit",{fruit_valid:fruit_valid})
      fruit_valid=0;
    })

    app.get("/admin/fruit/list",(req,res)=>{
        Fruit.find().then((found)=>{
            res.render("admin_fruit_list",{parray:found})
        })
    })

    app.get("/admin/:name/fruit/delete",(req,res)=>{
      Fruit.deleteOne({name:req.params.name}).then((found)=>{
          res.redirect("/admin/fruit/list")
      })
    })

    app.post("/admin/fruit",async(req,res)=>{
        const name=req.body.name
        const price=req.body.price
        Fruit.findOne({name:name}).then(async(found)=>{
          if(found){
            fruit_valid=1;
          }else{
              const fruit=new Fruit({
                  name:name,
                  price:price
              })
              await fruit.save();
          }
          res.redirect("/admin/fruit")
      }).catch((e)=>{
          console.log(e)
      })

    })

    app.get("/admin/:name/fruit/update",(req,res)=>{
      Fruit.findOne({name:req.params.name}).then((found)=>{
          res.render("admin_fruit_update",{found:found})
      })
  })

  app.post("/admin/fruit/update",async(req,res)=>{
     const name=req.body.name
     const price=req.body.price
     const found=await Fruit.findOne({name:name})
     found.price=price
     await found.save().then(()=>{
      res.redirect("/admin/fruit/list")
     })
  })


   // Famous

   var famous_valid=0;

   app.get("/admin/famous",(req,res)=>{
     res.render("admin_famous",{famous_valid:famous_valid})
     famous_valid=0;
   })

   app.get("/admin/famous/list",(req,res)=>{
    Famous.find().then((found)=>{
           res.render("admin_famous_list",{parray:found})
       })
   })

   app.get("/admin/:name/famous/delete",(req,res)=>{
    Famous.deleteOne({name:req.params.name}).then((found)=>{
         res.redirect("/admin/famous/list")
     })
   })

   app.post("/admin/famous",async(req,res)=>{
       const name=req.body.name
       const price=req.body.price
       Famous.findOne({name:name}).then(async(found)=>{
         if(found){
            famous_valid=1;
         }else{
             const famous=new Famous({
                 name:name,
                 price:price
             })
             await famous.save();
         }
         res.redirect("/admin/famous")
     }).catch((e)=>{
         console.log(e)
     })

   })

   app.get("/admin/:name/famous/update",(req,res)=>{
    Famous.findOne({name:req.params.name}).then((found)=>{
         res.render("admin_famous_update",{found:found})
     })
 })

 app.post("/admin/famous/update",async(req,res)=>{
    const name=req.body.name
    const price=req.body.price
    const found=await Famous.findOne({name:name})
    found.price=price
    await found.save().then(()=>{
     res.redirect("/admin/famous/list")
    })
 })

//  Fasal
 
 var fasal_valid=0;

 app.get("/admin/fasal",(req,res)=>{
   res.render("admin_fasal",{fasal_valid:fasal_valid})
   fasal_valid=0;
 })

 app.get("/admin/fasal/list",(req,res)=>{
     Fasal.find().then((found)=>{
         res.render("admin_fasal_list",{parray:found})
     })
 })

 app.get("/admin/:name/fasal/delete",(req,res)=>{
    Fasal.deleteOne({name:req.params.name}).then((found)=>{
       res.redirect("/admin/fasal/list")
   })
 })

 app.post("/admin/fasal",async(req,res)=>{
     const name=req.body.name
     const Percentage=req.body.Percentage
     Fasal.findOne({name:name}).then(async(found)=>{
       if(found){
        fasal_valid=1;
       }else{
           const fasal=new Fasal({
               name:name,
               Percentage:Percentage
           })
           await fasal.save();
       }
       res.redirect("/admin/fasal")
   }).catch((e)=>{
       console.log(e)
   })

 })

 app.get("/admin/:name/fasal/update",(req,res)=>{
    Fasal.findOne({name:req.params.name}).then((found)=>{
       res.render("admin_fasal_update",{found:found})
   })
})

app.post("/admin/fasal/update",async(req,res)=>{
  const name=req.body.name
  const Percentage=req.body.Percentage
  const found=await Fasal.findOne({name:name})
  found.Percentage=Percentage
  await found.save().then(()=>{
   res.redirect("/admin/fasal/list")
  })
})


// Road

var road_valid=0;

app.get("/admin/road",(req,res)=>{
    res.render("admin_road",{road_valid:road_valid})
    road_valid=0;
  })
 
  app.get("/admin/road/list",(req,res)=>{
    Road.find().then((found)=>{
          res.render("admin_road_list",{parray:found})
      })
  })
 
  app.get("/admin/:name/road/delete",(req,res)=>{
    Road.deleteOne({name:req.params.name}).then((found)=>{
        res.redirect("/admin/road/list")
    })
  })
 
  app.post("/admin/road",async(req,res)=>{
      const name=req.body.name
      const Percentage=req.body.Percentage
      Road.findOne({name:name}).then(async(found)=>{
        if(found){
            road_valid=1;
        }else{
            const road=new Road({
                name:name,
                Percentage:Percentage
            })
            await road.save();
        }
        res.redirect("/admin/road")
    }).catch((e)=>{
        console.log(e)
    })
 
  })
 
  app.get("/admin/:name/road/update",(req,res)=>{
    Road.findOne({name:req.params.name}).then((found)=>{
        res.render("admin_road_update",{found:found})
    })
 })
 
 app.post("/admin/road/update",async(req,res)=>{
   const name=req.body.name
   const Percentage=req.body.Percentage
   const found=await Road.findOne({name:name})
   found.Percentage=Percentage
   await found.save().then(()=>{
    res.redirect("/admin/road/list")
   })
 })


  //  Makan
 
  var makan_valid=0;

  app.get("/admin/makan",(req,res)=>{
    res.render("admin_makan",{makan_valid:makan_valid})
    makan_valid=0;
  })
 
  app.get("/admin/makan/list",(req,res)=>{
      Makan.find().then((found)=>{
          res.render("admin_makan_list",{parray:found})
      })
  })
 
  app.get("/admin/makan/delete",(req,res)=>{
    Makan.deleteOne({city:req.query.city,sampati:req.query.sampati,sagrachna:req.query.sagrachna}).then((found)=>{
        res.redirect("/admin/makan/list")
    })
  })
 
  app.post("/admin/makan",async(req,res)=>{
      const city=req.body.city
      const sampati=req.body.sampati
      const sagrachna=req.body.sagrachna
      const upbad=req.body.upbad
      const second=req.body.second
      const tal=req.body.tal
      const avskarn=req.body.avskarn
      Makan.findOne({city:city,sampati:sampati,sagrachna:sagrachna}).then(async(found)=>{
        if(found){
            makan_valid=1;
        }else{
            const makan=new Makan({
                city:city,
                sampati:sampati,
                sagrachna:sagrachna,
                upbad:upbad,
                second:second,
                tal:tal,
                avskarn:avskarn
            })
            await makan.save();
        }
        res.redirect("/admin/makan")
    }).catch((e)=>{
        console.log(e)
    })
 
  })
 
  app.get("/admin/makan/update",(req,res)=>{

    Makan.findOne({city:req.query.city,sampati:req.query.sampati,sagrachna:req.query.sagrachna}).then((found)=>{
        res.render("admin_makan_update",{found:found})
    })
 })
 
 app.post("/admin/makan/update",async(req,res)=>{
    const city=req.body.city
    const sampati=req.body.sampati
    const sagrachna=req.body.sagrachna
    const upbad=req.body.upbad
    const second=req.body.second
    const tal=req.body.tal
    const avskarn=req.body.avskarn
   const found=await Makan.findOne({city:city,sampati:sampati,sagrachna:sagrachna})
   found.upbad=upbad
   found.second=second
   found.tal=tal
   found.avskarn=avskarn
   await found.save().then(()=>{
    res.redirect("/admin/makan/list")
   })
 })

 //  Tal
 
 var tal_valid=0;

 app.get("/admin/tal",(req,res)=>{
   res.render("admin_makan_tal",{tal_valid:tal_valid})
   tal_valid=0;
 })

 app.get("/admin/tal/list",(req,res)=>{
     Tal.find().then((found)=>{
         res.render("admin_makan_tal_list",{parray:found})
     })
 })

 app.get("/admin/:name/tal/delete",(req,res)=>{
    Tal.deleteOne({name:req.params.name}).then((found)=>{
       res.redirect("/admin/tal/list")
   })
 })

 app.post("/admin/tal",async(req,res)=>{
     const name=req.body.name
     const Percentage=req.body.Percentage
     Tal.findOne({name:name}).then(async(found)=>{
       if(found){
        tal_valid=1;
       }else{
           const tal=new Tal({
               name:name,
               Percentage:Percentage
           })
           await tal.save();
       }
       res.redirect("/admin/tal")
   }).catch((e)=>{
       console.log(e)
   })

 })

 app.get("/admin/:name/tal/update",(req,res)=>{
    Tal.findOne({name:req.params.name}).then((found)=>{
       res.render("admin_makan_tal_update",{found:found})
   })
})

app.post("/admin/tal/update",async(req,res)=>{
  const name=req.body.name
  const Percentage=req.body.Percentage
  const found=await Tal.findOne({name:name})
  found.Percentage=Percentage
  await found.save().then(()=>{
   res.redirect("/admin/tal/list")
  })
})

//  Extra
 
var extra_valid=0;

app.get("/admin/extra",(req,res)=>{
  res.render("admin_makan_extra",{extra_valid:extra_valid})
  extra_valid=0;
})

app.get("/admin/extra/list",(req,res)=>{
    Extra.find().then((found)=>{
        res.render("admin_makan_extra_list",{parray:found})
    })
})

app.get("/admin/:name/extra/delete",(req,res)=>{
   Extra.deleteOne({name:req.params.name}).then((found)=>{
      res.redirect("/admin/extra/list")
  })
})

app.post("/admin/extra",async(req,res)=>{
    const name=req.body.name
    const Percentage=req.body.Percentage
    Extra.findOne({name:name}).then(async(found)=>{
      if(found){
       extra_valid=1;
      }else{
          const extra=new Extra({
              name:name,
              Percentage:Percentage
          })
          await extra.save();
      }
      res.redirect("/admin/extra")
  }).catch((e)=>{
      console.log(e)
  })

})

app.get("/admin/:name/extra/update",(req,res)=>{
   Extra.findOne({name:req.params.name}).then((found)=>{
      res.render("admin_makan_extra_update",{found:found})
  })
})

app.post("/admin/extra/update",async(req,res)=>{
 const name=req.body.name
 const Percentage=req.body.Percentage
 const found=await Extra.findOne({name:name})
 found.Percentage=Percentage
 await found.save().then(()=>{
  res.redirect("/admin/extra/list")
 })
})


//  Incomplete
 
var incomplete_valid=0;

app.get("/admin/incomplete",(req,res)=>{
  res.render("admin_makan_incomplete",{incomplete_valid:incomplete_valid})
  incomplete_valid=0;
})

app.get("/admin/incomplete/list",(req,res)=>{
    Incomplete.find().then((found)=>{
        res.render("admin_makan_incomplete_list",{parray:found})
    })
})

app.get("/admin/:name/incomplete/delete",(req,res)=>{
   Incomplete.deleteOne({name:req.params.name}).then((found)=>{
      res.redirect("/admin/incomplete/list")
  })
})

app.post("/admin/incomplete",async(req,res)=>{
    const name=req.body.name
    const Percentage=req.body.Percentage
    Incomplete.findOne({name:name}).then(async(found)=>{
      if(found){
       incomplete_valid=1;
      }else{
          const incomplete=new Incomplete({
              name:name,
              Percentage:Percentage
          })
          await incomplete.save();
      }
      res.redirect("/admin/incomplete")
  }).catch((e)=>{
      console.log(e)
  })

})

app.get("/admin/:name/incomplete/update",(req,res)=>{
   Incomplete.findOne({name:req.params.name}).then((found)=>{
      res.render("admin_makan_incomplete_update",{found:found})
  })
})

app.post("/admin/incomplete/update",async(req,res)=>{
 const name=req.body.name
 const Percentage=req.body.Percentage
 const found=await Incomplete.findOne({name:name})
 found.Percentage=Percentage
 await found.save().then(()=>{
  res.redirect("/admin/incomplete/list")
 })
})

// condition upload
app.get('/admin/condition/list', async (req, res) => {
    Condition1Model.find().then((found)=>{
        res.render("admin_condition_list1",{parray:found})
    })
})
app.get('/admin/:name/condition/list', async (req, res) => {
    Condition1Model.findOne({name:req.params.name}).then((found)=>{
        res.render("admin_condition_list2",{parray:found.condition2,condition1:req.params.name})
    })
})
app.get('/admin/:name1/:name/condition1/list', async (req, res) => {
    Condition1Model.findOne({name:req.params.name1}).then((found)=>{
        for(let i=0;i<found.condition2.length;i++){
            if(found.condition2[i].name==req.params.name){
                res.render("admin_condition_list3",{parray:found.condition2[i].condition3,condition1:req.params.name1,condition2:req.params.name})

            }
        }
    })
})

app.get('/admin/:name1/:name2/:name/condition3/update', async (req, res) => {
    const found=await  Condition1Model.findOne({name:req.params.name1});
    for(let i=0;i<found.condition2.length;i++){
        if(found.condition2[i].name==req.params.name2){
            for(let j=0;j<found.condition2[i].condition3.length;j++){
                if(found.condition2[i].condition3[j].name==req.params.name){
                    res.render("admin_condition_update",{condition1:req.params.name1,condition2:req.params.name2,condition3:req.params.name,output:found.condition2[i].condition3[j].output,remark:found.condition2[i].condition3[j].remark})
                    
                }
            }
        }
    }
})

app.post('/admin/condition/update', async (req, res) => {
    const condition1=req.body.condition1;
    const condition2=req.body.condition2;
    const condition3=req.body.condition3;
    const output=req.body.output;
    const remark=req.body.remark;
    const found=await  Condition1Model.findOne({name:condition1});
    for(let i=0;i<found.condition2.length;i++){
        if(found.condition2[i].name==condition2){
            for(let j=0;j<found.condition2[i].condition3.length;j++){
                if(found.condition2[i].condition3[j].name==condition3){
                    found.condition2[i].condition3[j].output=output;
                    found.condition2[i].condition3[j].remark=remark;
                }
            }
        }
    }
    await found.save();
    res.redirect(`/admin/${condition1}/${condition2}/condition1/list`)

})


app.get('/admin/:name/condition/delete', async (req, res) => {
    Condition1Model.deleteOne({name:req.params.name}).then(()=>{
        res.redirect("/admin/condition/list")
    })
})

app.get('/admin/:name1/:name/condition2/delete', async (req, res) => {
    Condition1Model.updateOne({name:req.params.name1},{$pull:{condition2: {name:req.params.name} }}).then(()=>{
        res.redirect(`/admin/${req.params.name1}/condition/list`)
    })
})

app.get('/admin/:name1/:name2/:name/condition3/delete', async (req, res) => {
    Condition1Model.updateOne({name:req.params.name1},{$pull:{"condition2.$[elem].condition3": {name:req.params.name} }},  {arrayFilters:[{"elem.name":req.params.name2}]}).then((found)=>{
        res.redirect(`/admin/${req.params.name1}/${req.params.name2}/condition1/list`)
    })
})

app.get("/conditionUpload", async (req, res) => {
    res.render('admin_condition')
})

async function processUploadedFile(uploadedFile) {
    try {
        // Load the Excel file
        const workbook = xlsx.readFile(`uploads/conditions/${uploadedFile.originalname}`);

        // Assuming your Excel file has a single sheet named 'Sheet1'
        const sheetName = 'Sheet1';
        const sheet = workbook.Sheets[sheetName];

        // Convert Excel data to an array of objects
        const excelData = xlsx.utils.sheet_to_json(sheet);

        for (const item of excelData) {
            const country = item['Condition1'];
            const state = item['Condition2'];
            const city = item['Condition3'];
            const outputValue = item['Output'];
            const remark = item['Remark'];

            // Find or create a Condition1 document by the country name
            let existingCondition1 = await Condition1Model.findOne({ name: country });

            if (!existingCondition1) {
                // Create a new Condition1 document if it doesn't exist
                existingCondition1 = new Condition1Model({
                    name: country,
                    condition2: [
                        {
                            name: state,
                            condition3: [
                                {
                                    name: city,
                                    output: outputValue,
                                    remark: remark,
                                },
                            ],
                        },
                    ],
                });
                await existingCondition1.save();
            } else {
                // Check if Condition2 already exists within the existing Condition1
                let existingCondition2 = existingCondition1.condition2.find(cond2 => cond2.name === state);

                if (!existingCondition2) {
                    // Create a new Condition2 and Condition3 within the existing Condition1
                    existingCondition1.condition2.push({
                        name: state,
                        condition3: [
                            {
                                name: city,
                                output: outputValue,
                                remark: remark,
                            },
                        ],
                    });
                } else {
                    // Check if Condition3 already exists within the existing Condition2
                    let existingCondition3 = existingCondition2.condition3.find(cond3 => cond3.name === city);

                    if (!existingCondition3) {
                        // Create a new Condition3 within the existing Condition2
                        existingCondition2.condition3.push({
                            name: city,
                            output: outputValue,
                            remark: remark,
                        });
                    } else {
                        // Ensure that existingCondition3.output is an array
                        if (!Array.isArray(existingCondition3.output)) {
                            existingCondition3.output = [existingCondition3.output];
                        }
                        // Add the output value to an existing Condition3 document
                        existingCondition3.output = outputValue;
                        existingCondition3.remark = remark;
                    }
                }
                await existingCondition1.save();
            }
        }
        fs.unlinkSync(`uploads/conditions/${uploadedFile.originalname}`);
        return 'Data uploaded to the database.'
    } catch (error) {
        console.error('Error uploading data:', error);
        return 'Internal Server Error'
    }

}

app.post('/conditionUpload', uploadCondition.single('ConditionFile'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        const resp = await processUploadedFile(req.file);

        if (resp === 'Internal Server Error') {
            res.status(500).json({ error: 'Internal Server Error' });
            return
        }

        res.status(200).redirect("/conditionUpload")
        return
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

app.get('/condition', async (req, res) => {
    const condition1Options = await Condition1Model.find().exec();
    res.render('condiionForm', { condition1Options });
})

app.get('/condition1', async (req, res) => {
    const condition1Options = await Condition1Model.find().exec();
    res.render('condiionForm1', { condition1Options });
})

app.get('/fetchCondition2', async (req, res) => {
    const selectedCondition1 = req.query.condition1;
    try {
        // Fetch Condition2 options based on the selected Condition1 from your database
        const condition2Options = await Condition1Model.find({ name: selectedCondition1 }, { 'condition2.name': 1 }).exec();
        // Extract unique Condition2 names
        const uniqueCondition2Options = [...new Set(condition2Options.flatMap(option => option.condition2.map(c2 => c2.name)))];
        res.json(uniqueCondition2Options);
    } catch (error) {
        console.error('Error fetching Condition2 options:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/fetchCondition3', async (req, res) => {
    const selectedCondition2 = req.query.condition1.split('=')[1];
    const selectedCondition1 = req.query.condition1.split('?')[0];
    console.log(selectedCondition1, selectedCondition2)
    try {
        // Fetch Condition3 options based on the selected Condition2 from your database
        const condition3Options = await Condition1Model.aggregate([
            {
                $match: {
                    "name": selectedCondition1, // Replace with the desired value for "name"
                    "condition2.name": selectedCondition2, // Replace with the desired value for "condition2.name"
                },
            },
            {
                $unwind: "$condition2",
            },
            {
                $match: {
                    "condition2.name": selectedCondition2, // Replace with the desired value for "condition2.name"
                },
            },
            {
                $unwind: "$condition2.condition3",
            },
            {
                $project: {
                    "condition3Name": "$condition2.condition3.name",
                },
            },
        ]);
        console.log(condition3Options)

        let condition3OptionsList = condition3Options.map((item) => item.condition3Name)
        const uniqueCondition3Options = [...new Set(condition3OptionsList)]

        res.json(uniqueCondition3Options);
    } catch (error) {
        console.error('Error fetching Condition3 options:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/fetchOutput', async (req, res) => {
    const selectedCondition1 = req.query.condition1.split('?')[0];
    const selectedCondition2 = req.query.condition1.split('?')[1].split('=')[1];
    const selectedCondition3 = req.query.condition1.split('?')[2].split('=')[1]
    console.log(selectedCondition2)

    try {
        // Fetch the output based on the selected conditions using aggregation
        const output = await Condition1Model.aggregate([
            {
                $match: {
                    "name": selectedCondition1,
                },
            },
            {
                $unwind: "$condition2",
            },
            {
                $match: {
                    "condition2.name": selectedCondition2,
                },
            },
            {
                $unwind: "$condition2.condition3",
            },
            {
                $match: {
                    "condition2.condition3.name": selectedCondition3,
                },
            },
            {
                $project: {
                    "output": "$condition2.condition3.output",
                    "remark": "$condition2.condition3.remark",
                },
            },
        ]);

        if (output.length > 0) {
            let obj={
                output:output[0].output,
                remark:output[0].remark
            }
            res.json(obj);
        } else {
            res.status(404).send('Output not found');
        }
    } catch (error) {
        console.error('Error fetching output:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});  


    // verify
    var verify_valid=0;

    app.get("/admin/verify",(req,res)=>{
        res.render("admin_verification",{verify_valid:verify_valid})
        verify_valid=0;
    })

    app.get("/admin/verify/list",(req,res)=>{
        Verify.find().then((found)=>{
            res.render("admin_verify_list",{parray:found})
        })
    })

    app.get("/admin/:name/verify/delete",(req,res)=>{
        Verify.deleteOne({name:req.params.name}).then((found)=>{
            res.redirect("/admin/verify/list")
        })
    })

    app.post("/admin/verify",(req,res)=>{
        const name=req.body.name
        Verify.findOne({name:name}).then(async(found)=>{
            if(found){
                verify_valid=1;
            }else{
                const verify=new Verify({
                    name:name,
                })
                await verify.save();
            }
            res.redirect("/admin/verify")
        }).catch((e)=>{
            console.log(e)
        })
    })

  

    // Sampati Jila
const processUploadedFileJila = async (uploadedFile) => {
    try {
        console.log("Processing file:", uploadedFile.originalname);

        // Load the Excel file
        const workbook = xlsx.readFile(`uploads/conditions/${uploadedFile.originalname}`);
        const sheetName = 'Sheet1';
        const sheetNames = workbook.SheetNames;

        if (!sheetNames.includes(sheetName)) {
            console.error(`Sheet "${sheetName}" not found in the uploaded file.`);
            throw new Error(`Sheet "${sheetName}" not found.`);
        }

        const sheet = workbook.Sheets[sheetName];
        const excelData = xlsx.utils.sheet_to_json(sheet);

        if (!excelData || excelData.length === 0) {
            console.error("Excel file contains no data.");
            throw new Error("Excel file is empty.");
        }

        for (const item of excelData) {
            const Jila = item['Jila'];
            const Thensil = item['Thensil'];
            const Rajiv = item['Rajiv'];
            const Patwari = item['Patwari'];
            const Gao = item['Gao'];
            const CityName = item['City Name'];
            const CityType = item['City Type'];
            const Ward = item['Ward'];
            const Mohalla = item['Mohalla'];
            const Society = item['Society'];
            const WardBhumi = item['Ward Bhumi'];
            const WardPrice = item['Ward price'];
            const HectorBhumi = item['Hector Bhumi'];
            const HectorPrice = item['Hector Price'];

            if (!Jila || !Thensil || !CityName) {
                console.warn("Skipping row due to missing required fields:", item);
                continue;
            }

            let jila = await JilaModel.findOne({ name: Jila });

            if (!jila) {
                console.log(`Creating new Jila: ${Jila}`);
                jila = new JilaModel({
                    name: Jila,
                    Thesil: [
                        {
                            name: Thensil,
                            Rajiv: [
                                {
                                    name: Rajiv,
                                    Patwari: [
                                        {
                                            name: Patwari,
                                            Gao: [
                                                {
                                                    name: Gao,
                                                    city: [
                                                        {
                                                            name: CityName,
                                                            cityType: CityType,
                                                            ward: [
                                                                {
                                                                    name: Ward,
                                                                    mohalla: [
                                                                        {
                                                                            name: Mohalla,
                                                                            Society: [
                                                                                {
                                                                                    name: Society,
                                                                                    Bhumi: [
                                                                                        { name: WardBhumi, Price: WardPrice }
                                                                                    ],
                                                                                },
                                                                            ],
                                                                        },
                                                                    ],
                                                                },
                                                            ],
                                                            hector: [{ name: HectorBhumi, Price: HectorPrice }],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                });
                await jila.save();
                console.log("Jila saved successfully.");
            } else {
                console.log(`Updating existing Jila: ${Jila}`);
                // Update logic here
                await jila.save();
            }
        }

        try {
            fs.unlinkSync(`uploads/conditions/${uploadedFile.originalname}`);
            console.log("File deleted successfully.");
        } catch (err) {
            console.warn("Error deleting file:", err.message);
        }

        return "Data uploaded to the database.";
    } catch (error) {
        console.error("Error processing file:", error.message, error.stack);
        return "Internal Server Error";
    }
};

    app.get("/admin/jila",(req,res)=>{
        res.render("admin_jila");
    })

app.post("/admin/jila", uploadCondition.single('ConditionFile'), async (req, res) => {
    try {
        if (!req.file) {
            console.error("No file uploaded.");
            res.status(400).json({ error: "No file uploaded." });
            return;
        }

        console.log("File uploaded:", req.file.originalname);
        const resp = await processUploadedFileJila(req.file);

        if (resp === "Internal Server Error") {
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }

        res.redirect("/admin/jila");
    } catch (error) {
        console.error("Error processing request:", error.message, error.stack);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

    // Ward List

    app.get("/admin/ward",(req,res)=>{
        JilaModel.find().then((found)=>{
            res.render("admin_ward_list",{parray:found,k:0});
        })
    })

    app.get("/:jila/:thesil/:rajiv/:patwari/:gao/:city/:ward/:mohalla/:society/:bhumi/admin/ward",async (req,res)=>{
        const jila=await JilaModel.findOne({name:req.params.jila});
        let thensil = jila.Thesil.find(cond2 => cond2.name === req.params.thesil);
        let rajiv = thensil.Rajiv.find(cond3 => cond3.name === req.params.rajiv);
        let patwari = rajiv.Patwari.find(cond4 => cond4.name == req.params.patwari);
        let gao = patwari.Gao.find(cond4 => cond4.name === req.params.gao);
        let City = gao.city.find(cond5 => cond5.name === req.params.city);
        let ward1 = City.ward.find(cond7 => cond7.name === req.params.ward);
        let mohalla1 = ward1.mohalla.find(cond8 => cond8.name === req.params.mohalla);
        let society = mohalla1.Society.find(cond9 => cond9.name === req.params.society);
        let arr=[];
        for(let i=0;i< society.Bhumi.length;i++){
            if( req.params.bhumi!= society.Bhumi[i].name){
                let obj={
                    name:society.Bhumi[i].name,
                    Price:society.Bhumi[i].Price,
                    _id:society.Bhumi[i]._id,
                }
                arr.push(obj);
            }
        }
        society.Bhumi=arr;
        await jila.save().then(()=>{
            res.redirect("/admin/ward");
        })
    })


    // Hector List 

    app.get("/admin/hector",(req,res)=>{
        JilaModel.find().then((found)=>{
            res.render("admin_hector_list",{parray:found,k:0});
        })
    })

    app.get("/:jila/:thesil/:rajiv/:patwari/:gao/:city/:bhumi/admin/hector",async (req,res)=>{
        const jila=await JilaModel.findOne({name:req.params.jila});
        let thensil = jila.Thesil.find(cond2 => cond2.name === req.params.thesil);
        let rajiv = thensil.Rajiv.find(cond3 => cond3.name === req.params.rajiv);
        let patwari = rajiv.Patwari.find(cond4 => cond4.name == req.params.patwari);
        let gao = patwari.Gao.find(cond4 => cond4.name === req.params.gao);
        let City = gao.city.find(cond5 => cond5.name === req.params.city);
        let arr=[];
        for(let i=0;i< City.hector.length;i++){
            if( req.params.bhumi!= City.hector[i].name){
                let obj={
                    name:City.hector[i].name,
                    Price:City.hector[i].Price,
                    _id:City.hector[i]._id,
                }
                arr.push(obj);
            }
        }
        City.hector=arr;
        await jila.save().then(()=>{
            res.redirect("/admin/hector");
        })
    })



    // Templete

    var tem_valid=0;
    app.get("/admin/temp",(req,res)=>{
        Doc.find().then((found)=>{
            res.render("admin_templete",{tem_valid:tem_valid,parray:found})
            tem_valid=0;
        })
    })

    app.get("/admin/temp/list",(req,res)=>{
        Doc.find().then((found)=>{
            res.render("admin_templete_list",{parray:found,k:1})
        })
    })

    app.get("/admin/:name/:dname/:vname/temp/delete",(req,res)=>{

        Doc.updateOne({name:req.params.vname},{$pull:{"sub.$[elem].templete": {name:req.params.name} }},  {arrayFilters:[{"elem.name":req.params.dname}]}).then((found)=>{
            res.redirect("/admin/temp/list")
        })

    })
    app.get("/admin/:name/:dname/:vname/temp/update",async(req,res)=>{
        const found=await Doc.findOne({name:req.params.vname});
        for(let i=0;i<found.sub.length;i++){
            if(found.sub[i].name==req.params.dname){
                for(let j=0;j<found.sub[i].templete.length;j++){
                    if(found.sub[i].templete[j].name==req.params.name){
                        res.render("admin_templete_update",{vname:req.params.vname,dname:req.params.dname,name:req.params.name,description:found.sub[i].templete[j].description})
                    }
                }
            }
        }
       
    })

    app.post("/admin/temp",async (req,res)=>{
        const name=req.body.name
        const description=req.body.description
        const विलेख=req.body.विलेख
        const दस्तावेज=req.body.दस्तावेज
        const found= await Doc.findOne({name:विलेख});
        console.log(found);
            for(let i=0;i<found.sub.length;i++){
                if(दस्तावेज==found.sub[i].name){
                        for(let j=0;j<found.sub[i].templete.length;j++){
                            if(name==found.sub[i].templete[j].name){
                                tem_valid=1;
                                break;
                            }
                        }
                        if(tem_valid==0){
                            const obj={
                                name:name,
                                description:description
                            }
                            found.sub[i].templete.push(obj)
                        }
                        break;
                    }
                }
                await found.save();
            
            res.redirect("/admin/temp")
       
    })

    app.post("/admin/temp/update",async(req,res)=>{
        const name=req.body.name
        const दस्तावेज=req.body.दस्तावेज
        const विलेख=req.body.विलेख
        const description=req.body.description
        Doc.updateOne({name:विलेख},{$set:{"sub.$[elem].templete.$[ele1].description": description }},  {arrayFilters:[{"elem.name":दस्तावेज},{"elem.name":name}]}).then((found)=>{
            res.redirect("/admin/temp/list")
        })
    })

    // Pakshkar Button

    var rea_valid1=0;
    app.get("/admin/pak/button",(req,res)=>{
        Doc.find().then((found)=>{
            res.render("admin_pak_button",{rea_valid1:rea_valid1,parray:found})
            rea_valid1=0;
        })
    })

    app.get("/admin/pak/button/list",(req,res)=>{
        
        Doc.findOne({name:req.query.vname}).then((found)=>{
            res.render("admin_pak_button_list",{parray:found.pakskarbutt,Doc:req.query.vname})
        })
    })

    app.get("/admin/pak/button/delete",(req,res)=>{
        Doc.updateOne({name:req.query.vname},{$pull:{pakskarbutt: {name:req.query.name}}}).then((found)=>{
            res.redirect(`/admin/${req.query.vname}/pak/button/list`)
        })
    })
  

    app.post("/admin/pak/button",async (req,res)=>{
        const name=req.body.name
        const विलेख=req.body.विलेख
        const found= await Doc.findOne({name:विलेख});
        console.log(found.pakskarbutt)
                        for(let j=0;j<found.pakskarbutt.length;j++){
                            if(name==found.pakskarbutt[j].name){
                                rea_valid1=1;
                                break;
                            }
                        }
                        if(rea_valid1==0){
                            const obj={
                                name:name,
                                minimum:req.body.minimum,
                                partition:req.body.partition,
                            }
                            found.pakskarbutt.push(obj)
                        }
                
                await found.save();
            
            res.redirect("/admin/pak/button")
       
    })

    // Pakshkar

    var rea_valid=0;
    app.get("/admin/rea",(req,res)=>{
        Doc.find().then((found)=>{
            res.render("admin_Reason",{rea_valid:rea_valid,parray:found})
            rea_valid=0;
        })
    })

    app.get("/admin/:vname/:dname/rea/list",(req,res)=>{
        Doc.findOne({name:req.params.vname}).then((found)=>{
            console.log(found)
            for(let i=0;i<found.sub.length;i++){
                if(req.params.dname==found.sub[i].name){
                    res.render("admin_Reason_list",{parray:found.sub[i].Reason,Sub:req.params.dname,Doc:req.params.vname})
                }
            }
        })
    })

    app.get("/admin/:name/:dname/:vname/reas/delete",(req,res)=>{

        Doc.updateOne({name:req.params.vname},{$pull:{"sub.$[elem].Reason": {name:req.params.name} }},  {arrayFilters:[{"elem.name":req.params.dname}]}).then((found)=>{
            res.redirect(`/admin/${req.params.vname}/${req.params.dname}/rea/list`)
        })

    })
  

    app.post("/admin/rea",async (req,res)=>{
        const name=req.body.name
        const विलेख=req.body.विलेख
        const दस्तावेज=req.body.दस्तावेज
        const found= await Doc.findOne({name:विलेख});
        console.log(found);
            for(let i=0;i<found.sub.length;i++){
                if(दस्तावेज==found.sub[i].name){
                        for(let j=0;j<found.sub[i].Reason.length;j++){
                            if(name==found.sub[i].Reason[j].name){
                                rea_valid=1;
                                break;
                            }
                        }
                        if(rea_valid==0){
                            const obj={
                                name:name,
                            }
                            found.sub[i].Reason.push(obj)
                        }
                        break;
                    }
                }
                await found.save();
            
            res.redirect("/admin/rea")
       
    })


   
    // Important
    var Important_valid=0;
    app.get("/admin/important",(req,res)=>{
        res.render("admin_important",{Important_valid:Important_valid})
        Important_valid=0
    })
    
    app.post("/admin/important",upload120.single('importantPDF'),async(req,res)=>{ 
        try{
            const important=req.body.important;
            const importantImage = `/uploads/important/${req.file.filename}`;
    
    
            Imp.findOne({name:important}).then(async(found)=>{
                if(found){
                    Important_valid=1
                    res.redirect("/admin/important")
                }
                else{
                    const imp=new Imp({
                        name:important,
                        path:importantImage
                    })
                    await imp.save().then(()=>{
                        res.redirect("/admin/important")
                    })
                }
            })
        }catch(e){
            console.log(e);
        }
    })


    app.get("/admin/important/list",(req,res)=>{
        Imp.find().then((found)=>{
            res.render("admin_important_list",{parray:found})
        })
    })

    app.get("/admin/:name/imp/delete",async (req,res)=>{
        const found= await Imp.findOne({name:req.params.name});
        const path=found.path.substring(1);
        fs.unlinkSync(path);
        Imp.deleteOne({name:req.params.name}).then(()=>{
            res.redirect("/admin/important/list")
        })
    })

       // Help

       app.get("/admin/help",(req,res)=>{
           Doc.find().then((found)=>{
               res.render("admin_help",{parray:found})
           })
       })
   
       app.get("/admin/help/list",(req,res)=>{
        Help.find().then((found)=>{
            res.render("admin_help_list",{parray:found})
        })
       })
   
       app.get("/admin/help/delete",async (req,res)=>{
            // const found= await Help.findOne({name:req.query.name,vilakh:req.query.vilakh,dastavej:req.query.dastavej});
            // const link=found.link.substring(1);
            // fs.unlinkSync(link);
            Help.deleteOne({name:req.query.name,vilakh:req.query.vilakh,dastavej:req.query.dastavej}).then(()=>{
                res.redirect("/admin/help/list")
            })
       })
     
   
       app.post("/admin/help",upload200.single('helpPDF'),async (req,res)=>{
           const name=req.body.name
           const Vilakh=req.body.Vilakh
           const Dastavej=req.body.Dastavej
           const helppdf = `/uploads/help/${req.file.filename}`;
           const help=new Help({
                name:name,
                vilakh:Vilakh,
                dastavej:Dastavej,
                link:helppdf
            })
            await help.save().then(()=>{
                res.redirect("/admin/help")
            })          
       })

         // Checklists

         app.get("/admin/check",(req,res)=>{
            Doc.find().then((found)=>{
                res.render("admin_check",{parray:found})
            })
        })
    
        app.get("/admin/check/list",(req,res)=>{
            Check.find().then((found)=>{
             res.render("admin_check_list",{parray:found})
         })
        })
    
        app.get("/admin/check/delete",async (req,res)=>{
             const found= await Check.findOne({name:req.query.name,vilakh:req.query.vilakh,dastavej:req.query.dastavej});
             const link=found.link.substring(1);
             fs.unlinkSync(link);
            Check.deleteOne({name:req.query.name,vilakh:req.query.vilakh,dastavej:req.query.dastavej}).then(()=>{
                 res.redirect("/admin/check/list")
             })
        })
      
    
        app.post("/admin/check",upload201.single('checkPDF'),async (req,res)=>{
            const name=req.body.name
            const Vilakh=req.body.Vilakh
            const Dastavej=req.body.Dastavej
            const checkpdf = `/uploads/checklist/${req.file.filename}`;
            const check=new Check({
                 name:name,
                 vilakh:Vilakh,
                 dastavej:Dastavej,
                 link:checkpdf
             })
             await check.save().then(()=>{
                 res.redirect("/admin/check")
             })          
        })

    // APP REST API
    app.get("/application/important",async (req,res)=>{
        await Imp.find().then((found)=>{
            res.status(200).json(found)
        }).catch((e)=>{
            res.status(400).send(e)
        })
    })

    app.get("/application/document",async (req,res)=>{
        await Doc.find().then((found)=>{
            res.status(200).json(found)
        }).catch((e)=>{
            res.status(400).send(e)
        })
    })




    app.get("/application/stamp",async (req,res)=>{
        const document=req.header.vilakh
        const sub1=req.header.dastavej
        await Doc.findOne({name: document}).then((found)=>{
            for(let i=0;i<found.sub.length;i++){
                if(found.sub[i].name==sub1){
                    res.status(200).json(found.sub[i].Reason)
                    break;
                }
            }
        }).catch((e)=>{
            res.status(400).send(e)
        })
    })

    app.post("/application/stamp",async (req,res)=>{
        const document=req.header.vilakh
        const sub1=req.header.dastavej
        let actual=req.header.market;
        if(req.header.market<req.header.amount){
            actual=req.header.amount
        }
        let upk
        let jan
        let sta
        let panji
        let total_st=0;
        await Doc.findOne({name: document}).then((found)=>{
            for(let i=0;i<found.sub.length;i++){
                if(found.sub[i].name==sub1){
                    if(found.sub[i].Type=="Percentage"){
                        upk=(found.sub[i].Upkar*actual)/100;
                        jan=(found.sub[i].Janpad*actual)/100;
                        sta=(found.sub[i].Stamp*actual)/100;
                        panji=(found.sub[i].panjikar*actual)/100;
                        total_st=upk+jan+sta;
                    }
                    else if(found.sub[i].Type=="Fixed"){
                        upk=found.sub[i].Upkar;
                        jan=found.sub[i].Janpad;
                        sta=found.sub[i].Stamp;
                        panji=found.sub[i].panjikar;
                        total_st=upk+jan+sta;
                    }
                    else{
                        upk=found.sub[i].Upkar*req.header.part;
                        jan=found.sub[i].Janpad*req.header.part;
                        sta=found.sub[i].Stamp*req.header.part;
                        panji=found.sub[i].panjikar*req.header.part;
                        total_st=upk+jan+sta;
                    }

                    if(found.sub[i].PanType=="Percentage"){
                        panji=(found.sub[i].panjikar*actual)/100;
                    }
                    else if(found.sub[i].PanType=="Fixed"){
                        panji=found.sub[i].panjikar;
                    }
                    else{
                        panji=found.sub[i].panjikar*req.header.part;
                    }

                    if(req.header.stampdiscount=="Yes"){
                
                        sta=sta-((sta*req.header.stampdiscountprice)/100)
                        total_st=upk+jan+sta;
            
                    }
                    if(panjyandiscount=="Yes"){
                        panji=panji-((panji*req.header.panjyandiscountprice)/100)
                    }
                    if(prepaid=="Yes"){
                        sta=sta-req.header.stampprepaid
                        total_st=upk+jan+sta;
            
                        panji=panji-req.header.panjyanprepaid
                    }

                    if(found.sub[i].SamptiMauk=="Yes"){
                        if(req.header.stampofficecenter=="Yes"){
                            sta=sta+1100;
                            total_st=total_st+1100;
                        }
                    }
                    let obj={
                       sta:sta,
                       upk:upk,
                       jan:jan,
                       total:total_st,
                       panji:panji
                    }
                    res.status(200).json(obj)
                    break;
                }
            }
        }).catch((e)=>{
            res.status(400).send(e)
        })
    })

    app.post("/application/templete",async (req,res)=>{
        const document=req.header.vilakh
        const sub1=req.header.dastavej
        await Doc.findOne({name: document}).then((found)=>{
            for(let i=0;i<found.sub.length;i++){
                if(found.sub[i].name==sub1){
                    res.status(200).json(found.sub[i].templete)
                    break;
                }
            }
        }).catch((e)=>{
            res.status(400).send(e)
        })
    })




// Rest Api

app.get("/otp12",async (req,res)=>{
    let testmessage="*प्रिय ग्राहक, आपके पासवर्ड को 2222 पर रीसेट करने के लिए वन टाइम पासवर्ड 2222 है। यह ओटीपी 5 मिनट में समाप्त हो जाएगा. RDS SERVICE"
    let response = await axios.get(`http://smslogin.pcexpert.in/api/mt/SendSMS?user=RAMADH&password=ABcd@54321&senderid=RDSSRV&channel=Trans&DCS=08&flashsms=0&number=916397239387&text=${testmessage}&route=46`)
    res.send(response.data)
})

// English

const edocSchema= new mongoose.Schema({
    name: String,
    description: String,
    par: String,
    adi: String,
    PRATIFAL:String,
    Sampati:String,
    Loan:String,
    Ledge:String,
    sub: [
        {
            name: String,
            description: String,
            Stamp:Number,
            Upkar:Number,
            Janpad:Number,
            Partiton:Number,
            SamptiRequi:String,
            Pakshsam:String,
            SamptiMauk:String,
            PanType:String,
            Paksh:String,
            panjikar: Number,
            Type:String,
            Reason:[
                {
                    name:String,
                }
            ],
            templete:[
                {
                    name:String,
                    description:String
                }
            ]
        }   
    ],
    people:[{
        name:String
        }
    ],
    pakskarbutt:[{
            name:String,
            minimum:String,
            partition:String,
        }
    ]
  });

const EDoc= mongoose.model("EDoc",edocSchema);

const ehelpSchema= new mongoose.Schema({
    name: String,
    vilakh: String,
    dastavej: String,
    link: String,
  });
  
const EHelp= mongoose.model("EHelp",ehelpSchema);

const echeckSchema= new mongoose.Schema({
    name: String,
    vilakh: String,
    dastavej: String,
    link: String,
  });
  
const ECheck= mongoose.model("ECheck",echeckSchema);


const etempSchema= new mongoose.Schema({
    name: String,   
    description: String,   
  });

const ETemplete= mongoose.model("ETemplete",etempSchema);

const everifySchema= new mongoose.Schema({
    name: String,   
  });

const EVerify= mongoose.model("EVerify",everifySchema);

const eSampatiSchema= new mongoose.Schema({
    name: String,
    other: String,
  });

const ESampati= mongoose.model("ESampati",eSampatiSchema);

const eRoadSchema= new mongoose.Schema({
    name: String,
    Percentage: String,
  });

const ERoad= mongoose.model("ERoad",eRoadSchema);

const eFasalSchema= new mongoose.Schema({
    name: String,
    Percentage: String,
  });

const EFasal= mongoose.model("EFasal",eFasalSchema);

const eExtraSchema= new mongoose.Schema({
    name: String,
    Percentage: String,
  });

const EExtra= mongoose.model("EExtra",eExtraSchema);

const eIncompleteSchema= new mongoose.Schema({
    name: String,
    Percentage: String,
  });

const EIncomplete= mongoose.model("EIncomplete",eIncompleteSchema);

const eTalSchema= new mongoose.Schema({
    name: String,
    Percentage: String,
  });


const ETal= mongoose.model("ETal",eTalSchema);

const emakanSchema= new mongoose.Schema({
    city: String,
    sampati: String,
    sagrachna: String,
    upbad: String,
    second:String,
    tal:String,
    avskarn:String,
  });

const EMakan= mongoose.model("EMakan",emakanSchema);

const eimpSchema= new mongoose.Schema({
    name: String,   
    path: String,   
  });

const EImp= mongoose.model("EImp",eimpSchema);

const eTreeSchema= new mongoose.Schema({
    name: String,   
    quality: String,   
    size:String,
    price:Number
  });

const ETree= mongoose.model("ETree",eTreeSchema);

const eFruitSchema= new mongoose.Schema({
    name: String,   
    price: Number,   
  });

const EFruit= mongoose.model("EFruit",eFruitSchema);

const eFamousSchema= new mongoose.Schema({
    name: String,   
    price: Number,   
  });

const EFamous= mongoose.model("EFamous",eFamousSchema);


const eDastvajJilaSchema= new mongoose.Schema({
    name: String,   
    office: [
        {
            name:String,
        }
    ],   
  });

const EDastvajJila= mongoose.model("EDastvajJila",eDastvajJilaSchema);


// User


app.get("/en/admin/user",(req,res)=>{
    User.find().then((found)=>{
        res.render("en_admin_user",{parray:found})
    })
})

  // Document

  var edoc_valid=0;



  app.get("/en/admin/document",(req,res)=>{
      res.render("en_admin_document",{doc_valid:edoc_valid})
  })

  app.get("/en/admin/document/list",(req,res)=>{
      EDoc.find().then((found)=>{
          res.render("en_admin_document_list",{parray:found})
      })
  })
  app.get("/en/admin/:name/document/delete",(req,res)=>{
    EDoc.deleteOne({name:req.params.name}).then((found)=>{
          res.redirect("/en/admin/document/list")
      })
  })

  app.post("/en/admin/document",(req,res)=>{
      const name=req.body.name
      const description=req.body.description
      const par=req.body.par
      const adi=req.body.adi
      const PRATIFAL=req.body.PRATIFAL
      const Loan=req.body.Loan
      const Ledge=req.body.Ledge
      const Sampati=req.body.Sampati
      EDoc.findOne({name:name}).then(async(found)=>{
          if(found){
              edoc_valid=1;
          }else{
              const doc=new EDoc({
                  name: name,
                  description: description,
                  par: par,
                  adi: adi,
                  PRATIFAL:PRATIFAL,
                  Loan:Loan,
                  Ledge:Ledge,
                  Sampati:Sampati,
                  sub: [],
                  people:[]
              })
              await doc.save();
          }
          res.redirect("/en/admin/document")
      }).catch((e)=>{
          console.log(e)
      })
  })

  app.get("/en/admin/:name/document/update",(req,res)=>{
    EDoc.findOne({name:req.params.name}).then((found)=>{
          res.render("en_admin_document_update",{found:found})
      })
  })

  app.post("/en/admin/document/update",async(req,res)=>{
     const name=req.body.name
     const description=req.body.description
     const par=req.body.par
     const adi=req.body.adi
     const PRATIFAL=req.body.PRATIFAL
     const Loan=req.body.Loan
     const Ledge=req.body.Ledge
     const Sampati=req.body.Sampati
     const found=await EDoc.findOne({name:name})
     found.description=description
     found.par=par
     found.adi=adi
     found.PRATIFAL=PRATIFAL
     found.Loan=Loan
     found.Ledge=Ledge
     found.Sampati=Sampati
     await found.save().then(()=>{
      res.redirect("/en/admin/document/list")
     })
  })

    //DastvajJilla

    var EDastvajJilla_valid=0;

    app.get("/en/admin/DastvajJilla",(req,res)=>{
        res.render("en_admin_dasjilla",{DastvajJilla_valid:EDastvajJilla_valid})
    })

    app.get("/en/admin/DastvajJilla/list",(req,res)=>{
        EDastvajJila.find().then((found)=>{
            res.render("en_admin_dasjilla_list",{parray:found})
        })
    })
    app.get("/en/admin//DastvajJilla/delete",(req,res)=>{
        EDastvajJila.deleteOne({name:req.query.name}).then((found)=>{
            res.redirect("/en/admin/DastvajJilla/list")
        })
    })

    app.post("/en/admin/DastvajJilla",(req,res)=>{
        const name=req.body.name
        EDastvajJila.findOne({name:name}).then(async(found)=>{
            if(found){
                EDastvajJilla_valid=1;
            }else{
                const dastvajJila=new EDastvajJila({
                    name: name,
                    office:[]
                })
                await dastvajJila.save();
            }
            res.redirect("/en/admin/DastvajJilla")
        }).catch((e)=>{
            console.log(e)
        })
    })

      //DastvajOffice

      var EDastvajOffice_valid=0;

      app.get("/en/admin/DastvajOffice",(req,res)=>{

        EDastvajJila.find().then((found)=>{
            res.render("en_admin_office",{DastvajOffice_valid:EDastvajOffice_valid,parray:found})
            EDastvajOffice_valid=0;
        })
    })
  
      app.get("/en/admin/DastvajOffice/list",(req,res)=>{
          EDastvajJila.find().then((found)=>{
              res.render("en_admin_office_list",{parray:found,k:1})
          })
      })
      app.get("/en/admin/:name/:dname/DastvajOffice/delete",(req,res)=>{
        EDastvajJila.updateOne({name:req.params.dname},{$pull:{office: {name:req.params.name}}}).then((found)=>{
            res.redirect("/en/admin/DastvajOffice/list")
        })
      })
  
      app.post("/en/admin/DastvajOffice",async (req,res)=>{
        const name=req.body.name
        const Jilla=req.body.Jilla
       
        const found= await EDastvajJila.findOne({name:Jilla})
        for(let i=0;i<found.office.length;i++){
            if(name==found.office[i].name){
                EDastvajOffice_valid=1;
                    break;
                }
            }
        if(EDastvajOffice_valid==0){
            const obj={
                name:name,
            }
            found.office.push(obj)
            await found.save();
        }
        res.redirect("/en/admin/DastvajOffice")
        
      })

    // Sub document
    var Esub_valid=0;

    app.get("/en/admin/sub",(req,res)=>{
        EDoc.find().then((found)=>{
            res.render("en_admin_sub",{sub_valid:Esub_valid,parray:found})
            Esub_valid=0;
        })
    })

    app.get("/en/admin/:name/:dname/sub/delete",(req,res)=>{
        EDoc.updateOne({name:req.params.dname},{$pull:{sub: {name:req.params.name}}}).then((found)=>{
            res.redirect("/en/admin/sub/list")
        })
    })
    app.get("/en/admin/:name/:dname/sub/update",async(req,res)=>{ 
        const parray=await  EDoc.find()
        EDoc.findOne({name:req.params.dname}).then((found)=>{
            for(let i=0;i<found.sub.length;i++){
                if(req.params.name==found.sub[i].name){
                    res.render("en_admin_sub_update",{name:req.params.name,description:found.sub[i].description,parray:parray,Type:found.sub[i].Type,Stamp:found.sub[i].Stamp,Upkar:found.sub[i].Upkar,Janpad:found.sub[i].Janpad,panjikar:found.sub[i].panjikar,dname:req.params.dname,PanType:found.sub[i].PanType,Partiton:found.sub[i].Partiton,Paksh:found.sub[i].Paksh,SamptiRequi:found.sub[i].SamptiRequi,SamptiMauk:found.sub[i].SamptiMauk,Pakshsam:found.sub[i].Pakshsam})
                    
                    break;
                }
            }
        })
    })

    app.get("/en/admin/sub/list",(req,res)=>{
        EDoc.find().then((found)=>{
            res.render("en_admin_sub_list",{parray:found,k:1})
        })
    })

    app.post("/en/admin/sub",async (req,res)=>{
        const name=req.body.name
        const description=req.body.description
        const विलेख=req.body.विलेख
        const Type=req.body.Type
        const Stamp=req.body.Stamp
        const Upkar=req.body.Upkar
        const Pakshsam=req.body.Pakshsam
        const Janpad=req.body.Janpad
        const panjikar=req.body.panjikar
        const PanType=req.body.PanType
        const Partiton=req.body.Partiton
        const Paksh=req.body.Paksh
        const SamptiRequi=req.body.SamptiRequi
        const SamptiMauk=req.body.SamptiMauk
        const found= await EDoc.findOne({name:विलेख})
        for(let i=0;i<found.sub.length;i++){
            if(name==found.sub[i].name){
                Esub_valid=1;
                    break;
                }
            }
        if(Esub_valid==0){
            const obj={
                name:name,
                description:description,
                Stamp:Stamp,
                Upkar:Upkar,
                Janpad:Janpad,
                panjikar: panjikar,
                Type:Type,
                SamptiRequi:SamptiRequi,
                Paksh:Paksh,
                PanType:PanType,
                Partiton:Partiton,
                SamptiMauk:SamptiMauk,
                Pakshsam:Pakshsam,
                Reason:[],
                templete:[],
            }
            found.sub.push(obj)
            await found.save();
        }
        res.redirect("/en/admin/sub")
        
    })


    app.post("/en/admin/sub/:dname/update",async(req,res)=>{
        const विलेख=req.params.dname
        const name=req.body.name
        const description=req.body.description
        const Type=req.body.Type
        const Stamp=req.body.Stamp
        const Upkar=req.body.Upkar
        const Pakshsam=req.body.Pakshsam
        const Janpad=req.body.Janpad
        const panjikar=req.body.panjikar
        const PanType=req.body.PanType
        const Partiton=req.body.Partiton
        const Paksh=req.body.Paksh
        const SamptiRequi=req.body.SamptiRequi
        const SamptiMauk=req.body.SamptiMauk
        console.log(विलेख)
        EDoc.updateOne({name:विलेख},{$set:{"sub.$[elem].description":description, "sub.$[elem].Type":Type, "sub.$[elem].Stamp":Stamp,"sub.$[elem].Upkar":Upkar,"sub.$[elem].Janpad":Janpad,"sub.$[elem].panjikar":panjikar,"sub.$[elem].PanType":PanType,"sub.$[elem].Partiton":Partiton,"sub.$[elem].Paksh":Paksh,"sub.$[elem].SamptiRequi":SamptiRequi,"sub.$[elem].Pakshsam":Pakshsam,"sub.$[elem].SamptiMauk":SamptiMauk}},{arrayFilters:[{"elem.name":name}]}).then(()=>{
            res.redirect("/en/admin/sub/list")
        }).catch((e)=>{
            console.log(e)
        })
    })

    
    // sampati
    var Esampati_valid=0;
    app.get("/en/admin/sampati",(req,res)=>{
        res.render("en_admin_samp",{sampati_valid:Esampati_valid})
        Esampati_valid=0;
    })

    app.get("/en/admin/sampati/list",(req,res)=>{
        ESampati.find().then((found)=>{
            res.render("en_admin_samp_list",{parray:found})
        })
    })

    app.get("/en/admin/:name/sampati/delete",(req,res)=>{
        ESampati.deleteOne({name:req.params.name}).then((found)=>{
            res.redirect("/en/admin/sampati/list")
        })
    })
    app.get("/en/admin/:name/sampati/update",(req,res)=>{
        ESampati.findOne({name:req.params.name}).then((found)=>{
            res.render("en_admin_samp_update",{found:found})
        })
    })

    app.post("/en/admin/sampati",(req,res)=>{
        const name=req.body.name
        const type=req.body.type
        ESampati.findOne({name:name}).then(async(found)=>{
            if(found){
                Esampati_valid=1;
            }else{
                const samp=new Sampati({
                    name:name,
                    other:type,
                })
                await samp.save();
            }
            res.redirect("/en/admin/sampati")
        }).catch((e)=>{
            console.log(e)
        })
    })

    app.post("/en/admin/sampati/update",async(req,res)=>{
        const name=req.body.name
        const type=req.body.type
       const found=await ESampati.findOne({name:name})
       found.other=type
       await found.save().then(()=>{
        res.redirect("/en/admin/sampati/list")
       })
    })

    // people
    var Epeople_valid=0;

    app.get("/en/admin/people",(req,res)=>{
        EDoc.find().then((found)=>{
            res.render("en_admin_people",{people_valid:Epeople_valid,parray:found})
            Epeople_valid=0;
        })
    })

    app.get("/en/admin/people/list",(req,res)=>{
        EDoc.find().then((found)=>{
            res.render("en_admin_people_list",{parray:found,k:1})
        })
    })

    app.get("/en/admin/:name/:dname/people/delete",(req,res)=>{
        EDoc.updateOne({name:req.params.dname},{$pull:{people: {name:req.params.name}}}).then((found)=>{
            res.redirect("/en/admin/people/list")
        })
    })

    app.post("/en/admin/people",async(req,res)=>{
        const name=req.body.name
        const विलेख=req.body.विलेख
        const found= await EDoc.findOne({name:विलेख})
        for(let i=0;i<found.people.length;i++){
            if(name==found.people[i].name){
                people_valid=1;
                    break;
                }
            }
        if(people_valid==0){
            const obj={
                name:name,
            }
            found.people.push(obj)
            await found.save();
        }
        res.redirect("/en/admin/people")

    })


      // Tree
      var Etree_valid=0;

      app.get("/en/admin/tree",(req,res)=>{
        res.render("en_admin_timber",{tree_valid:Etree_valid})
        Etree_valid=0;
      })
  
      app.get("/en/admin/tree/list",(req,res)=>{
          ETree.find().then((found)=>{
              res.render("en_admin_timber_list",{parray:found})
          })
      })
  
      app.get("/en/admin/tree/delete",(req,res)=>{
        ETree.deleteOne({name:req.query.name,quality:req.query.quality,size:req.query.size}).then((found)=>{
            res.redirect("/en/admin/tree/list")
        })
      })
  
      app.post("/en/admin/tree",async(req,res)=>{
          const name=req.body.name
          const quality=req.body.quality
          const size=req.body.size
          const price=req.body.price
          ETree.findOne({name:name,quality:quality,size:size}).then(async(found)=>{
            if(found){
                Etree_valid=1;
            }else{
                const tree=new ETree({
                    name:name,
                    quality:quality,
                    size:size,
                    price:price
                })
                await tree.save();
            }
            res.redirect("/en/admin/tree")
        }).catch((e)=>{
            console.log(e)
        })
  
      })

      app.get("/en/admin/tree/update",(req,res)=>{
        ETree.findOne({name:req.query.name,quality:req.query.quality,size:req.query.size}).then((found)=>{
            res.render("en_admin_timber_update",{found:found})
        })
    })

    app.post("/en/admin/tree/update",async(req,res)=>{
       const name=req.body.name
       const quality=req.body.quality
       const size=req.body.size
       const price=req.body.price
       const found=await ETree.findOne({name:name})
       found.quality=quality
       found.size=size
       found.price=price
       await found.save().then(()=>{
        res.redirect("/en/admin/tree/list")
       })
    })

    // Fruit

    var Efruit_valid=0;

    app.get("/en/admin/fruit",(req,res)=>{
      res.render("en_admin_fruit",{fruit_valid:fruit_valid})
      Efruit_valid=0;
    })

    app.get("/en/admin/fruit/list",(req,res)=>{
        EFruit.find().then((found)=>{
            res.render("en_admin_fruit_list",{parray:found})
        })
    })

    app.get("/en/admin/:name/fruit/delete",(req,res)=>{
      EFruit.deleteOne({name:req.params.name}).then((found)=>{
          res.redirect("/en/admin/fruit/list")
      })
    })

    app.post("/en/admin/fruit",async(req,res)=>{
        const name=req.body.name
        const price=req.body.price
        EFruit.findOne({name:name}).then(async(found)=>{
          if(found){
            Efruit_valid=1;
          }else{
              const fruit=new EFruit({
                  name:name,
                  price:price
              })
              await fruit.save();
          }
          res.redirect("/en/admin/fruit")
      }).catch((e)=>{
          console.log(e)
      })

    })

    app.get("/en/admin/:name/fruit/update",(req,res)=>{
      EFruit.findOne({name:req.params.name}).then((found)=>{
          res.render("en_admin_fruit_update",{found:found})
      })
  })

  app.post("/en/admin/fruit/update",async(req,res)=>{
     const name=req.body.name
     const price=req.body.price
     const found=await EFruit.findOne({name:name})
     found.price=price
     await found.save().then(()=>{
      res.redirect("/en/admin/fruit/list")
     })
  })


   // Famous

   var Efamous_valid=0;

   app.get("/en/admin/famous",(req,res)=>{
     res.render("en_admin_famous",{famous_valid:Efamous_valid})
     Efamous_valid=0;
   })

   app.get("/en/admin/famous/list",(req,res)=>{
    EFamous.find().then((found)=>{
           res.render("en_admin_famous_list",{parray:found})
       })
   })

   app.get("/en/admin/:name/famous/delete",(req,res)=>{
    EFamous.deleteOne({name:req.params.name}).then((found)=>{
         res.redirect("/en/admin/famous/list")
     })
   })

   app.post("/en/admin/famous",async(req,res)=>{
       const name=req.body.name
       const price=req.body.price
       EFamous.findOne({name:name}).then(async(found)=>{
         if(found){
            Efamous_valid=1;
         }else{
             const famous=new EFamous({
                 name:name,
                 price:price
             })
             await famous.save();
         }
         res.redirect("/en/admin/famous")
     }).catch((e)=>{
         console.log(e)
     })

   })

   app.get("/en/admin/:name/famous/update",(req,res)=>{
    EFamous.findOne({name:req.params.name}).then((found)=>{
         res.render("en_admin_famous_update",{found:found})
     })
 })

 app.post("/en/admin/famous/update",async(req,res)=>{
    const name=req.body.name
    const price=req.body.price
    const found=await EFamous.findOne({name:name})
    found.price=price
    await found.save().then(()=>{
     res.redirect("/en/admin/famous/list")
    })
 })

 //  Fasal
 
 var Efasal_valid=0;

 app.get("/en/admin/fasal",(req,res)=>{
   res.render("en_admin_fasal",{fasal_valid:Efasal_valid})
   Efasal_valid=0;
 })

 app.get("/en/admin/fasal/list",(req,res)=>{
     EFasal.find().then((found)=>{
         res.render("en_admin_fasal_list",{parray:found})
     })
 })

 app.get("/en/admin/:name/fasal/delete",(req,res)=>{
    EFasal.deleteOne({name:req.params.name}).then((found)=>{
       res.redirect("/en/admin/fasal/list")
   })
 })

 app.post("/en/admin/fasal",async(req,res)=>{
     const name=req.body.name
     const Percentage=req.body.Percentage
     EFasal.findOne({name:name}).then(async(found)=>{
       if(found){
        Efasal_valid=1;
       }else{
           const fasal=new EFasal({
               name:name,
               Percentage:Percentage
           })
           await fasal.save();
       }
       res.redirect("/en/admin/fasal")
   }).catch((e)=>{
       console.log(e)
   })

 })

 app.get("/en/admin/:name/fasal/update",(req,res)=>{
    EFasal.findOne({name:req.params.name}).then((found)=>{
       res.render("en_admin_fasal_update",{found:found})
   })
})

app.post("/en/admin/fasal/update",async(req,res)=>{
  const name=req.body.name
  const Percentage=req.body.Percentage
  const found=await EFasal.findOne({name:name})
  found.Percentage=Percentage
  await found.save().then(()=>{
   res.redirect("/en/admin/fasal/list")
  })
})


// Road

var Eroad_valid=0;

app.get("/en/admin/road",(req,res)=>{
    res.render("en_admin_road",{road_valid:Eroad_valid})
    Eroad_valid=0;
  })
 
  app.get("/en/admin/road/list",(req,res)=>{
    ERoad.find().then((found)=>{
          res.render("en_admin_road_list",{parray:found})
      })
  })
 
  app.get("/en/admin/:name/road/delete",(req,res)=>{
    ERoad.deleteOne({name:req.params.name}).then((found)=>{
        res.redirect("/en/admin/road/list")
    })
  })
 
  app.post("/en/admin/road",async(req,res)=>{
      const name=req.body.name
      const Percentage=req.body.Percentage
      ERoad.findOne({name:name}).then(async(found)=>{
        if(found){
            Eroad_valid=1;
        }else{
            const road=new ERoad({
                name:name,
                Percentage:Percentage
            })
            await road.save();
        }
        res.redirect("/en/admin/road")
    }).catch((e)=>{
        console.log(e)
    })
 
  })
 
  app.get("/en/admin/:name/road/update",(req,res)=>{
    ERoad.findOne({name:req.params.name}).then((found)=>{
        res.render("en_admin_road_update",{found:found})
    })
 })
 
 app.post("/en/admin/road/update",async(req,res)=>{
   const name=req.body.name
   const Percentage=req.body.Percentage
   const found=await ERoad.findOne({name:name})
   found.Percentage=Percentage
   await found.save().then(()=>{
    res.redirect("/en/admin/road/list")
   })
 })


  //  Makan
 
  var Emakan_valid=0;

  app.get("/en/admin/makan",(req,res)=>{
    res.render("en_admin_makan",{makan_valid:Emakan_valid})
    Emakan_valid=0;
  })
 
  app.get("/en/admin/makan/list",(req,res)=>{
      EMakan.find().then((found)=>{
          res.render("en_admin_makan_list",{parray:found})
      })
  })
 
  app.get("/en/admin/makan/delete",(req,res)=>{
    EMakan.deleteOne({city:req.query.city,sampati:req.query.sampati,sagrachna:req.query.sagrachna}).then((found)=>{
        res.redirect("/en/admin/makan/list")
    })
  })
 
  app.post("/en/admin/makan",async(req,res)=>{
      const city=req.body.city
      const sampati=req.body.sampati
      const sagrachna=req.body.sagrachna
      const upbad=req.body.upbad
      const second=req.body.second
      const tal=req.body.tal
      const avskarn=req.body.avskarn
      EMakan.findOne({city:city,sampati:sampati,sagrachna:sagrachna}).then(async(found)=>{
        if(found){
            Emakan_valid=1;
        }else{
            const makan=new EMakan({
                city:city,
                sampati:sampati,
                sagrachna:sagrachna,
                upbad:upbad,
                second:second,
                tal:tal,
                avskarn:avskarn
            })
            await makan.save();
        }
        res.redirect("/en/admin/makan")
    }).catch((e)=>{
        console.log(e)
    })
 
  })
 
  app.get("/en/admin/makan/update",(req,res)=>{

    EMakan.findOne({city:req.query.city,sampati:req.query.sampati,sagrachna:req.query.sagrachna}).then((found)=>{
        res.render("en_admin_makan_update",{found:found})
    })
 })
 
 app.post("/en/admin/makan/update",async(req,res)=>{
    const city=req.body.city
    const sampati=req.body.sampati
    const sagrachna=req.body.sagrachna
    const upbad=req.body.upbad
    const second=req.body.second
    const tal=req.body.tal
    const avskarn=req.body.avskarn
   const found=await EMakan.findOne({city:city,sampati:sampati,sagrachna:sagrachna})
   found.upbad=upbad
   found.second=second
   found.tal=tal
   found.avskarn=avskarn
   await found.save().then(()=>{
    res.redirect("/en/admin/makan/list")
   })
 })

 //  Tal
 
 var Etal_valid=0;

 app.get("/en/admin/tal",(req,res)=>{
   res.render("en_admin_makan_tal",{tal_valid:Etal_valid})
   Etal_valid=0;
 })

 app.get("/en/admin/tal/list",(req,res)=>{
     ETal.find().then((found)=>{
         res.render("en_admin_makan_tal_list",{parray:found})
     })
 })

 app.get("/en/admin/:name/tal/delete",(req,res)=>{
    ETal.deleteOne({name:req.params.name}).then((found)=>{
       res.redirect("/en/admin/tal/list")
   })
 })

 app.post("/en/admin/tal",async(req,res)=>{
     const name=req.body.name
     const Percentage=req.body.Percentage
     ETal.findOne({name:name}).then(async(found)=>{
       if(found){
        Etal_valid=1;
       }else{
           const tal=new ETal({
               name:name,
               Percentage:Percentage
           })
           await tal.save();
       }
       res.redirect("/en/admin/tal")
   }).catch((e)=>{
       console.log(e)
   })

 })

 app.get("/en/admin/:name/tal/update",(req,res)=>{
    ETal.findOne({name:req.params.name}).then((found)=>{
       res.render("en_admin_makan_tal_update",{found:found})
   })
})

app.post("/en/admin/tal/update",async(req,res)=>{
  const name=req.body.name
  const Percentage=req.body.Percentage
  const found=await ETal.findOne({name:name})
  found.Percentage=Percentage
  await found.save().then(()=>{
   res.redirect("/en/admin/tal/list")
  })
})

//  Extra
 
var Eextra_valid=0;

app.get("/en/admin/extra",(req,res)=>{
  res.render("en_admin_makan_extra",{extra_valid:Eextra_valid})
  Eextra_valid=0;
})

app.get("/en/admin/extra/list",(req,res)=>{
    EExtra.find().then((found)=>{
        res.render("en_admin_makan_extra_list",{parray:found})
    })
})

app.get("/en/admin/:name/extra/delete",(req,res)=>{
   EExtra.deleteOne({name:req.params.name}).then((found)=>{
      res.redirect("/en/admin/extra/list")
  })
})

app.post("/en/admin/extra",async(req,res)=>{
    const name=req.body.name
    const Percentage=req.body.Percentage
    EExtra.findOne({name:name}).then(async(found)=>{
      if(found){
       Eextra_valid=1;
      }else{
          const extra=new EExtra({
              name:name,
              Percentage:Percentage
          })
          await extra.save();
      }
      res.redirect("/en/admin/extra")
  }).catch((e)=>{
      console.log(e)
  })

})

app.get("/en/admin/:name/extra/update",(req,res)=>{
   EExtra.findOne({name:req.params.name}).then((found)=>{
      res.render("en_admin_makan_extra_update",{found:found})
  })
})

app.post("/en/admin/extra/update",async(req,res)=>{
 const name=req.body.name
 const Percentage=req.body.Percentage
 const found=await EExtra.findOne({name:name})
 found.Percentage=Percentage
 await found.save().then(()=>{
  res.redirect("/en/admin/extra/list")
 })
})


//  Incomplete
 
var Eincomplete_valid=0;

app.get("/en/admin/incomplete",(req,res)=>{
  res.render("en_admin_makan_incomplete",{incomplete_valid:Eincomplete_valid})
  Eincomplete_valid=0;
})

app.get("/en/admin/incomplete/list",(req,res)=>{
    EIncomplete.find().then((found)=>{
        res.render("en_admin_makan_incomplete_list",{parray:found})
    })
})

app.get("/en/admin/:name/incomplete/delete",(req,res)=>{
   EIncomplete.deleteOne({name:req.params.name}).then((found)=>{
      res.redirect("/en/admin/incomplete/list")
  })
})

app.post("/en/admin/incomplete",async(req,res)=>{
    const name=req.body.name
    const Percentage=req.body.Percentage
    EIncomplete.findOne({name:name}).then(async(found)=>{
      if(found){
       Eincomplete_valid=1;
      }else{
          const incomplete=new EIncomplete({
              name:name,
              Percentage:Percentage
          })
          await incomplete.save();
      }
      res.redirect("/en/admin/incomplete")
  }).catch((e)=>{
      console.log(e)
  })

})

app.get("/en/admin/:name/incomplete/update",(req,res)=>{
   EIncomplete.findOne({name:req.params.name}).then((found)=>{
      res.render("en_admin_makan_incomplete_update",{found:found})
  })
})

app.post("/en/admin/incomplete/update",async(req,res)=>{
 const name=req.body.name
 const Percentage=req.body.Percentage
 const found=await EIncomplete.findOne({name:name})
 found.Percentage=Percentage
 await found.save().then(()=>{
  res.redirect("/en/admin/incomplete/list")
 })
})

// condition upload
app.get('/en/admin/condition/list', async (req, res) => {
    ECondition1Model.find().then((found)=>{
        res.render("en_admin_condition_list1",{parray:found})
    })
})
app.get('/en/admin/:name/condition/list', async (req, res) => {
    ECondition1Model.findOne({name:req.params.name}).then((found)=>{
        res.render("en_admin_condition_list2",{parray:found.condition2,condition1:req.params.name})
    })
})
app.get('/en/admin/:name1/:name/condition1/list', async (req, res) => {
    ECondition1Model.findOne({name:req.params.name1}).then((found)=>{
        for(let i=0;i<found.condition2.length;i++){
            if(found.condition2[i].name==req.params.name){
                res.render("en_admin_condition_list3",{parray:found.condition2[i].condition3,condition1:req.params.name1,condition2:req.params.name})

            }
        }
    })
})

app.get('/en/admin/:name1/:name2/:name/condition3/update', async (req, res) => {
    const found=await  ECondition1Model.findOne({name:req.params.name1});
    for(let i=0;i<found.condition2.length;i++){
        if(found.condition2[i].name==req.params.name2){
            for(let j=0;j<found.condition2[i].condition3.length;j++){
                if(found.condition2[i].condition3[j].name==req.params.name){
                    res.render("en_admin_condition_update",{condition1:req.params.name1,condition2:req.params.name2,condition3:req.params.name,output:found.condition2[i].condition3[j].output,remark:found.condition2[i].condition3[j].remark})
                    
                }
            }
        }
    }
})

app.post('/en/admin/condition/update', async (req, res) => {
    const condition1=req.body.condition1;
    const condition2=req.body.condition2;
    const condition3=req.body.condition3;
    const output=req.body.output;
    const remark=req.body.remark;
    const found=await  ECondition1Model.findOne({name:condition1});
    for(let i=0;i<found.condition2.length;i++){
        if(found.condition2[i].name==condition2){
            for(let j=0;j<found.condition2[i].condition3.length;j++){
                if(found.condition2[i].condition3[j].name==condition3){
                    found.condition2[i].condition3[j].output=output;
                    found.condition2[i].condition3[j].remark=remark;
                }
            }
        }
    }
    await found.save();
    res.redirect(`/en/admin/${condition1}/${condition2}/condition1/list`)

})


app.get('/en/admin/:name/condition/delete', async (req, res) => {
    ECondition1Model.deleteOne({name:req.params.name}).then(()=>{
        res.redirect("/en/admin/condition/list")
    })
})

app.get('/en/admin/:name1/:name/condition2/delete', async (req, res) => {
    ECondition1Model.updateOne({name:req.params.name1},{$pull:{condition2: {name:req.params.name} }}).then(()=>{
        res.redirect(`/en/admin/${req.params.name1}/condition/list`)
    })
})

app.get('/en/admin/:name1/:name2/:name/condition3/delete', async (req, res) => {
    ECondition1Model.updateOne({name:req.params.name1},{$pull:{"condition2.$[elem].condition3": {name:req.params.name} }},  {arrayFilters:[{"elem.name":req.params.name2}]}).then((found)=>{
        res.redirect(`/en/admin/${req.params.name1}/${req.params.name2}/condition1/list`)
    })
})

app.get("/conditionUpload", async (req, res) => {
    res.render('en_admin_condition')
})

async function processUploadedFile(uploadedFile) {
    try {
        // Load the Excel file
        const workbook = xlsx.readFile(`uploads/conditions/${uploadedFile.originalname}`);

        // Assuming your Excel file has a single sheet named 'Sheet1'
        const sheetName = 'Sheet1';
        const sheet = workbook.Sheets[sheetName];

        // Convert Excel data to an array of objects
        const excelData = xlsx.utils.sheet_to_json(sheet);

        for (const item of excelData) {
            const country = item['Condition1'];
            const state = item['Condition2'];
            const city = item['Condition3'];
            const outputValue = item['Output'];
            const remark = item['Remark'];

            // Find or create a Condition1 document by the country name
            let existingCondition1 = await ECondition1Model.findOne({ name: country });

            if (!existingCondition1) {
                // Create a new Condition1 document if it doesn't exist
                existingCondition1 = new ECondition1Model({
                    name: country,
                    condition2: [
                        {
                            name: state,
                            condition3: [
                                {
                                    name: city,
                                    output: outputValue,
                                    remark: remark,
                                },
                            ],
                        },
                    ],
                });
                await existingCondition1.save();
            } else {
                // Check if Condition2 already exists within the existing Condition1
                let existingCondition2 = existingCondition1.condition2.find(cond2 => cond2.name === state);

                if (!existingCondition2) {
                    // Create a new Condition2 and Condition3 within the existing Condition1
                    existingCondition1.condition2.push({
                        name: state,
                        condition3: [
                            {
                                name: city,
                                output: outputValue,
                                remark: remark,
                            },
                        ],
                    });
                } else {
                    // Check if Condition3 already exists within the existing Condition2
                    let existingCondition3 = existingCondition2.condition3.find(cond3 => cond3.name === city);

                    if (!existingCondition3) {
                        // Create a new Condition3 within the existing Condition2
                        existingCondition2.condition3.push({
                            name: city,
                            output: outputValue,
                            remark: remark,
                        });
                    } else {
                        // Ensure that existingCondition3.output is an array
                        if (!Array.isArray(existingCondition3.output)) {
                            existingCondition3.output = [existingCondition3.output];
                        }
                        // Add the output value to an existing Condition3 document
                        existingCondition3.output = outputValue;
                        existingCondition3.remark = remark;
                    }
                }
                await existingCondition1.save();
            }
        }
        fs.unlinkSync(`uploads/conditions/${uploadedFile.originalname}`);
        return 'Data uploaded to the database.'
    } catch (error) {
        console.error('Error uploading data:', error);
        return 'Internal Server Error'
    }

}

app.post('/conditionUpload', uploadCondition.single('ConditionFile'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        const resp = await processUploadedFile(req.file);

        if (resp === 'Internal Server Error') {
            res.status(500).json({ error: 'Internal Server Error' });
            return
        }

        res.status(200).redirect("/conditionUpload")
        return
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

    // verify
    var Everify_valid=0;

    app.get("/en/admin/verify",(req,res)=>{
        res.render("en_admin_verification",{verify_valid:Everify_valid})
        Everify_valid=0;
    })

    app.get("/en/admin/verify/list",(req,res)=>{
        EVerify.find().then((found)=>{
            res.render("en_admin_verify_list",{parray:found})
        })
    })

    app.get("/en/admin/:name/verify/delete",(req,res)=>{
        EVerify.deleteOne({name:req.params.name}).then((found)=>{
            res.redirect("/en/admin/verify/list")
        })
    })

    app.post("/en/admin/verify",(req,res)=>{
        const name=req.body.name
        EVerify.findOne({name:name}).then(async(found)=>{
            if(found){
                Everify_valid=1;
            }else{
                const verify=new EVerify({
                    name:name,
                })
                await verify.save();
            }
            res.redirect("/en/admin/verify")
        }).catch((e)=>{
            console.log(e)
        })
    })

  

    // Sampati Jila
    // async function processUploadedFileJila(uploadedFile) {
    //     try {
    //         // Load the Excel file
    //         const workbook = xlsx.readFile(`uploads/conditions/${uploadedFile.originalname}`);
    
    //         // Assuming your Excel file has a single sheet named 'Sheet1'
    //         const sheetName = 'Sheet1';
    //         const sheet = workbook.Sheets[sheetName];
    
    //         // Convert Excel data to an array of objects
    //         const excelData = xlsx.utils.sheet_to_json(sheet);
    
    //         for (const item of excelData) {
    //             const Jila = item['Jila'];
    //             const Thensil = item['Thensil'];
    //             const Rajiv = item['Rajiv'];
    //             const Patwari = item['Patwari'];
    //             const Gao = item['Gao'];
    //             const CityName = item['City Name'];
    //             const CityType = item['City Type'];
    //             const Ward = item['Ward'];
    //             const Mohalla = item['Mohalla'];
    //             const Society = item['Society'];
    //             const WardBhumi = item['Ward Bhumi'];
    //             const Wardprice = item['Ward price'];
    //             const HectorBhumi = item['Hector Bhumi'];
    //             const HectorPrice = item['Hector Price'];
    
    //             // Find or create a Condition1 document by the country name
    //             let jila = await EJilaModel.findOne({ name: Jila });
    
    //             if (!jila) {
    //                 // Create a new Condition1 document if it doesn't exist
    //                 jila = new EJilaModel({
    //                     name: Jila,
    //                     Thesil: [
    //                         {
    //                             name: Thensil,
    //                             Rajiv: [
    //                                 {
    //                                     name: Rajiv,
    //                                     Patwari: [
    //                                         {
    //                                             name: Patwari,
    //                                             Gao:[
    //                                                 {
    //                                                     name:Gao,
    //                                                     city:[
    //                                                         {
    //                                                             name:CityName,
    //                                                             cityType:CityType,
    //                                                             ward:[
    //                                                                 {
    //                                                                     name:Ward,
    //                                                                     mohalla:[
    //                                                                         {
    //                                                                             name:Mohalla,
    //                                                                             Society:[
    //                                                                                 {
    //                                                                                     name:Society,
    //                                                                                     Bhumi:[
    //                                                                                         {
    //                                                                                             name: WardBhumi,
    //                                                                                             Price: Wardprice
    //                                                                                         }
    //                                                                                     ]
    //                                                                                 }
    //                                                                             ]
    //                                                                         }
    //                                                                     ]
    //                                                                 }
    //                                                             ],
    //                                                             hector:[
    //                                                                 {
    //                                                                     name:HectorBhumi,
    //                                                                     Price:HectorPrice
    //                                                                 }
    //                                                             ]
    //                                                         }
    //                                                     ]

    //                                                 }
    //                                             ]
    //                                         }
    //                                     ],
    //                                 },
    //                             ],
    //                         },
    //                     ],
    //                 });
    //                 await jila.save();
    //             }
    //              else {
    //                 // Check if Condition2 already exists within the existing Condition1
    //                 let thensil = jila.Thesil.find(cond2 => cond2.name === Thensil);
    
    //                 if (!thensil) {
    //                     // Create a new Condition2 and Condition3 within the existing Condition1
    //                     jila.Thesil.push({
    //                             name: Thensil,
    //                             Rajiv: [
    //                                 {
    //                                     name: Rajiv,
    //                                     Patwari: [
    //                                         {
    //                                             name: Patwari,
    //                                             Gao:[
    //                                                 {
    //                                                     name:Gao,
    //                                                     city:[
    //                                                         {
    //                                                             name:CityName,
    //                                                             cityType:CityType,
    //                                                             ward:[
    //                                                                 {
    //                                                                     name:Ward,
    //                                                                     mohalla:[
    //                                                                         {
    //                                                                             name:Mohalla,
    //                                                                             Society:[
    //                                                                                 {
    //                                                                                     name:Society,
    //                                                                                     Bhumi:[
    //                                                                                         {
    //                                                                                             name: WardBhumi,
    //                                                                                             Price: Wardprice
    //                                                                                         }
    //                                                                                     ]
    //                                                                                 }
    //                                                                             ]
    //                                                                         }
    //                                                                     ]
    //                                                                 }
    //                                                             ],
    //                                                             hector:[
    //                                                                 {
    //                                                                     name:HectorBhumi,
    //                                                                     Price:HectorPrice
    //                                                                 }
    //                                                             ]
    //                                                         }
    //                                                     ]

    //                                                 }
    //                                             ]
    //                                         }
    //                                     ],
    //                                 },
    //                             ],
    //                     });
    //                 }
    //                 else {
    //                     // Check if Condition3 already exists within the existing Condition2
    //                     let rajiv = thensil.Rajiv.find(cond3 => cond3.name === Rajiv);
    //                     if (!rajiv) {
    //                         // Create a new Condition3 within the existing Condition2
    //                         thensil.Rajiv.push(
    //                             {
    //                                 name: Rajiv,
    //                                 Patwari: [
    //                                     {
    //                                         name: Patwari,
    //                                         Gao:[
    //                                             {
    //                                                 name:Gao,
    //                                                 city:[
    //                                                     {
    //                                                         name:CityName,
    //                                                         cityType:CityType,
    //                                                         ward:[
    //                                                             {
    //                                                                 name:Ward,
    //                                                                 mohalla:[
    //                                                                     {
    //                                                                         name:Mohalla,
    //                                                                         Society:[
    //                                                                             {
    //                                                                                 name:Society,
    //                                                                                 Bhumi:[
    //                                                                                     {
    //                                                                                         name: WardBhumi,
    //                                                                                         Price: Wardprice
    //                                                                                     }
    //                                                                                 ]
    //                                                                             }
    //                                                                         ]
    //                                                                     }
    //                                                                 ]
    //                                                             }
    //                                                         ],
    //                                                         hector:[
    //                                                             {
    //                                                                 name:HectorBhumi,
    //                                                                 Price:HectorPrice
    //                                                             }
    //                                                         ]
    //                                                     }
    //                                                 ]

    //                                             }
    //                                         ]
    //                                     }
    //                                 ],
    //                             },
    //                         );
    //                     } 
    //                     else {
    //                         let patwari = rajiv.Patwari.find(cond4 => cond4.name == Patwari);
    //                         if (!patwari) {
    //                             // Create a new Condition3 within the existing Condition2
    //                             rajiv.Patwari.push(
    //                                 {
    //                                     name: Patwari,
    //                                     Gao:[
    //                                         {
    //                                             name:Gao,
    //                                             city:[
    //                                                 {
    //                                                     name:CityName,
    //                                                     cityType:CityType,
    //                                                     ward:[
    //                                                         {
    //                                                             name:Ward,
    //                                                             mohalla:[
    //                                                                 {
    //                                                                     name:Mohalla,
    //                                                                     Society:[
    //                                                                         {
    //                                                                             name:Society,
    //                                                                             Bhumi:[
    //                                                                                 {
    //                                                                                     name: WardBhumi,
    //                                                                                     Price: Wardprice
    //                                                                                 }
    //                                                                             ]
    //                                                                         }
    //                                                                     ]
    //                                                                 }
    //                                                             ]
    //                                                         }
    //                                                     ],
    //                                                     hector:[
    //                                                         {
    //                                                             name:HectorBhumi,
    //                                                             Price:HectorPrice
    //                                                         }
    //                                                     ]
    //                                                 }
    //                                             ]

    //                                         }
    //                                     ]
    //                                 }
    //                             );
    //                         }
    //                         else{
    //                             let gao = patwari.Gao.find(cond4 => cond4.name === Gao);
    //                             if (!gao) {
    //                                 // Create a new Condition3 within the existing Condition2
    //                                 patwari.Gao.push(
    //                                     {
    //                                         name:Gao,
    //                                         city:[
    //                                             {
    //                                                 name:CityName,
    //                                                 cityType:CityType,
    //                                                 ward:[
    //                                                     {
    //                                                         name:Ward,
    //                                                         mohalla:[
    //                                                             {
    //                                                                 name:Mohalla,
    //                                                                 Society:[
    //                                                                     {
    //                                                                         name:Society,
    //                                                                         Bhumi:[
    //                                                                             {
    //                                                                                 name: WardBhumi,
    //                                                                                 Price: Wardprice
    //                                                                             }
    //                                                                         ]
    //                                                                     }
    //                                                                 ]
    //                                                             }
    //                                                         ]
    //                                                     }
    //                                                 ],
    //                                                 hector:[
    //                                                     {
    //                                                         name:HectorBhumi,
    //                                                         Price:HectorPrice
    //                                                     }
    //                                                 ]
    //                                             }
    //                                         ]

    //                                     }
    //                                 );
    //                             }

    //                             else{
    //                                 let City = gao.city.find(cond5 => cond5.name === CityName);
    //                                 if (!City) {
    //                                     // Create a new Condition3 within the existing Condition2
    //                                     gao.city.push(
    //                                         {
    //                                             name:CityName,
    //                                             cityType:CityType,
    //                                             ward:[
    //                                                 {
    //                                                     name:Ward,
    //                                                     mohalla:[
    //                                                         {
    //                                                             name:Mohalla,
    //                                                             Society:[
    //                                                                 {
    //                                                                     name:Society,
    //                                                                     Bhumi:[
    //                                                                         {
    //                                                                             name: WardBhumi,
    //                                                                             Price: Wardprice
    //                                                                         }
    //                                                                     ]
    //                                                                 }
    //                                                             ]
    //                                                         }
    //                                                     ]
    //                                                 }
    //                                             ],
    //                                             hector:[
    //                                                 {
    //                                                     name:HectorBhumi,
    //                                                     Price:HectorPrice
    //                                                 }
    //                                             ]
    //                                         }
    //                                     );
    //                                 }
    //                                 else{
    //                                     if(CityType!==City.cityType){
    //                                         City.cityType=CityType;
    //                                     }
    //                                     console.log(HectorPrice)
    //                                     if(HectorPrice!="-1"){
    //                                         console.log(HectorPrice)
    //                                         let hectorBhumi = City.hector.find(cond6 => cond6.name === HectorBhumi);
    //                                         if (!hectorBhumi) {
    //                                             // Create a new Condition3 within the existing Condition2
    //                                             City.hector.push(
    //                                                 {
    //                                                     name:HectorBhumi,
    //                                                     Price:HectorPrice
    //                                                 }
    //                                             );
    //                                         }
    //                                         else{
    //                                             hectorBhumi.Price=HectorPrice
    //                                         }
    //                                     }
    //                                     if(Wardprice!="-1"){
    //                                         let ward1 = City.ward.find(cond7 => cond7.name === Ward);
    //                                         if (!ward1) {
    //                                             // Create a new Condition3 within the existing Condition2
    //                                             City.ward.push(
    //                                                 {
    //                                                     name:Ward,
    //                                                     mohalla:[
    //                                                         {
    //                                                             name:Mohalla,
    //                                                             Society:[
    //                                                                 {
    //                                                                     name:Society,
    //                                                                     Bhumi:[
    //                                                                         {
    //                                                                             name: WardBhumi,
    //                                                                             Price: Wardprice
    //                                                                         }
    //                                                                     ]
    //                                                                 }
    //                                                             ]
    //                                                         }
    //                                                     ]
    //                                                 }
    //                                             );
    //                                         }
    //                                         else{
    //                                             let mohalla1 = ward1.mohalla.find(cond8 => cond8.name === Mohalla);
    //                                             if (!mohalla1) {
    //                                                 // Create a new Condition3 within the existing Condition2
    //                                                 ward1.mohalla.push(
    //                                                     {
    //                                                         name:Mohalla,
    //                                                         Society:[
    //                                                             {
    //                                                                 name:Society,
    //                                                                 Bhumi:[
    //                                                                     {
    //                                                                         name: WardBhumi,
    //                                                                         Price: Wardprice
    //                                                                     }
    //                                                                 ]
    //                                                             }
    //                                                         ]
    //                                                     }
    //                                                 );
    //                                             }
    //                                             else{
    //                                                 let society = mohalla1.Society.find(cond9 => cond9.name === Society);
    //                                                 if (!society) {
    //                                                     // Create a new Condition3 within the existing Condition2
    //                                                     mohalla1.Society.push(
    //                                                         {
    //                                                             name:Society,
    //                                                             Bhumi:[
    //                                                                 {
    //                                                                     name: WardBhumi,
    //                                                                     Price: Wardprice
    //                                                                 }
    //                                                             ]
    //                                                         }
    //                                                     );
    //                                                 }
    //                                                 else{
    //                                                     let wardBhumi = society.Bhumi.find(cond10 => cond10.name === WardBhumi);
    //                                                     if (!wardBhumi) {
    //                                                         // Create a new Condition3 within the existing Condition2
    //                                                         society.Bhumi.push(
    //                                                             {
    //                                                                 name: WardBhumi,
    //                                                                 Price: Wardprice
    //                                                             }
    //                                                         );
    //                                                     }
    //                                                     else{
    //                                                         wardBhumi.Price=Wardprice
    //                                                     }
    //                                                 }
    //                                             }
    //                                         }
    //                                     }

    //                                 }
    //                             }
    //                         }
    //                     }
    //                 }
    //                 await jila.save();
    //             }
    //         }
    //         fs.unlinkSync(`uploads/conditions/${uploadedFile.originalname}`);
    //         return 'Data uploaded to the database.'
    //     } catch (error) {
    //         console.error('Error uploading data:', error);
    //         return 'Internal Server Error'
    //     }
    
    // }

    app.get("/en/admin/jila",(req,res)=>{
        res.render("en_admin_jila");
    })

    app.post("/en/admin/jila", uploadCondition.single('ConditionFile'),async(req,res)=>{
        try {
            if (!req.file) {
                throw new Error('No file uploaded');
            }
    
            const resp = await processUploadedFileJila(req.file);
    
            if (resp === 'Internal Server Error') {
                res.status(500).json({ error: 'Internal Server Error' });
                return
            }
            EJilaModel.find().then((found)=>{
                console.log(found[0].Thesil);
            })
            res.status(200).redirect("/en/admin/jila")
            return
        } catch (error) {
            console.error('Error processing file:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    })

    // Ward List

   

    app.get("/en/admin/ward",(req,res)=>{
        EJilaModel.find().then((found)=>{
            res.render("en_admin_ward_list",{parray:found,k:0});
        })
    })

    app.get("/:jila/:thesil/:rajiv/:patwari/:gao/:city/:ward/:mohalla/:society/:bhumi/en/admin/ward",async (req,res)=>{
        const jila=await EJilaModel.findOne({name:req.params.jila});
        let thensil = jila.Thesil.find(cond2 => cond2.name === req.params.thesil);
        let rajiv = thensil.Rajiv.find(cond3 => cond3.name === req.params.rajiv);
        let patwari = rajiv.Patwari.find(cond4 => cond4.name == req.params.patwari);
        let gao = patwari.Gao.find(cond4 => cond4.name === req.params.gao);
        let City = gao.city.find(cond5 => cond5.name === req.params.city);
        let ward1 = City.ward.find(cond7 => cond7.name === req.params.ward);
        let mohalla1 = ward1.mohalla.find(cond8 => cond8.name === req.params.mohalla);
        let society = mohalla1.Society.find(cond9 => cond9.name === req.params.society);
        let arr=[];
        for(let i=0;i< society.Bhumi.length;i++){
            if( req.params.bhumi!= society.Bhumi[i].name){
                let obj={
                    name:society.Bhumi[i].name,
                    Price:society.Bhumi[i].Price,
                    _id:society.Bhumi[i]._id,
                }
                arr.push(obj);
            }
        }
        society.Bhumi=arr;
        await jila.save().then(()=>{
            res.redirect("/en/admin/ward");
        })
    })


    // Hector List 

    app.get("/en/admin/hector",(req,res)=>{
        EJilaModel.find().then((found)=>{
            res.render("en_admin_hector_list",{parray:found,k:0});
        })
    })

    app.get("/:jila/:thesil/:rajiv/:patwari/:gao/:city/:bhumi/en/admin/hector",async (req,res)=>{
        const jila=await EJilaModel.findOne({name:req.params.jila});
        let thensil = jila.Thesil.find(cond2 => cond2.name === req.params.thesil);
        let rajiv = thensil.Rajiv.find(cond3 => cond3.name === req.params.rajiv);
        let patwari = rajiv.Patwari.find(cond4 => cond4.name == req.params.patwari);
        let gao = patwari.Gao.find(cond4 => cond4.name === req.params.gao);
        let City = gao.city.find(cond5 => cond5.name === req.params.city);
        let arr=[];
        for(let i=0;i< City.hector.length;i++){
            if( req.params.bhumi!= City.hector[i].name){
                let obj={
                    name:City.hector[i].name,
                    Price:City.hector[i].Price,
                    _id:City.hector[i]._id,
                }
                arr.push(obj);
            }
        }
        City.hector=arr;
        await jila.save().then(()=>{
            res.redirect("/en/admin/hector");
        })
    })



    // Templete

    var Etem_valid=0;
    app.get("/en/admin/temp",(req,res)=>{
        EDoc.find().then((found)=>{
            res.render("en_admin_templete",{tem_valid:Etem_valid,parray:found})
            Etem_valid=0;
        })
    })

    app.get("/en/admin/temp/list",(req,res)=>{
        EDoc.find().then((found)=>{
            res.render("en_admin_templete_list",{parray:found,k:1})
        })
    })

    app.get("/en/admin/:name/:dname/:vname/temp/delete",(req,res)=>{

        EDoc.updateOne({name:req.params.vname},{$pull:{"sub.$[elem].templete": {name:req.params.name} }},  {arrayFilters:[{"elem.name":req.params.dname}]}).then((found)=>{
            res.redirect("/en/admin/temp/list")
        })

    })
    app.get("/en/admin/:name/:dname/:vname/temp/update",async(req,res)=>{
        const found=await EDoc.findOne({name:req.params.vname});
        for(let i=0;i<found.sub.length;i++){
            if(found.sub[i].name==req.params.dname){
                for(let j=0;j<found.sub[i].templete.length;j++){
                    if(found.sub[i].templete[j].name==req.params.name){
                        res.render("en_admin_templete_update",{vname:req.params.vname,dname:req.params.dname,name:req.params.name,description:found.sub[i].templete[j].description})
                    }
                }
            }
        }
       
    })

    app.post("/en/admin/temp",async (req,res)=>{
        const name=req.body.name
        const description=req.body.description
        const विलेख=req.body.विलेख
        const दस्तावेज=req.body.दस्तावेज
        const found= await EDoc.findOne({name:विलेख});
        console.log(found);
            for(let i=0;i<found.sub.length;i++){
                if(दस्तावेज==found.sub[i].name){
                        for(let j=0;j<found.sub[i].templete.length;j++){
                            if(name==found.sub[i].templete[j].name){
                                tem_valid=1;
                                break;
                            }
                        }
                        if(tem_valid==0){
                            const obj={
                                name:name,
                                description:description
                            }
                            found.sub[i].templete.push(obj)
                        }
                        break;
                    }
                }
                await found.save();
            
            res.redirect("/en/admin/temp")
       
    })

    app.post("/en/admin/temp/update",async(req,res)=>{
        const name=req.body.name
        const दस्तावेज=req.body.दस्तावेज
        const विलेख=req.body.विलेख
        const description=req.body.description
        EDoc.updateOne({name:विलेख},{$set:{"sub.$[elem].templete.$[ele1].description": description }},  {arrayFilters:[{"elem.name":दस्तावेज},{"elem.name":name}]}).then((found)=>{
            res.redirect("/en/admin/temp/list")
        })
    })

    // Pakshkar Button

    var Erea_valid1=0;
    app.get("/en/admin/pak/button",(req,res)=>{
        EDoc.find().then((found)=>{
            res.render("en_admin_pak_button",{rea_valid1:Erea_valid1,parray:found})
            Erea_valid1=0;
        })
    })

    app.get("/en/admin/pak/button/list",(req,res)=>{
        
        EDoc.findOne({name:req.query.vname}).then((found)=>{
            res.render("en_admin_pak_button_list",{parray:found.pakskarbutt,Doc:req.query.vname})
        })
    })

    app.get("/en/admin/pak/button/delete",(req,res)=>{
        EDoc.updateOne({name:req.query.vname},{$pull:{pakskarbutt: {name:req.query.name}}}).then((found)=>{
            res.redirect(`/en/admin/${req.query.vname}/pak/button/list`)
        })
    })
  

    app.post("/en/admin/pak/button",async (req,res)=>{
        const name=req.body.name
        const विलेख=req.body.विलेख
        const found= await EDoc.findOne({name:विलेख});
        console.log(found.pakskarbutt)
                        for(let j=0;j<found.pakskarbutt.length;j++){
                            if(name==found.pakskarbutt[j].name){
                                rea_valid1=1;
                                break;
                            }
                        }
                        if(rea_valid1==0){
                            const obj={
                                name:name,
                                minimum:req.body.minimum,
                                partition:req.body.partition,
                            }
                            found.pakskarbutt.push(obj)
                        }
                
                await found.save();
            
            res.redirect("/en/admin/pak/button")
       
    })

    // Pakshkar

    var Erea_valid=0;
    app.get("/en/admin/rea",(req,res)=>{
        EDoc.find().then((found)=>{
            res.render("en_admin_Reason",{rea_valid:Erea_valid,parray:found})
            Erea_valid=0;
        })
    })

    app.get("/en/admin/:vname/:dname/rea/list",(req,res)=>{
        EDoc.findOne({name:req.params.vname}).then((found)=>{
            console.log(found)
            for(let i=0;i<found.sub.length;i++){
                if(req.params.dname==found.sub[i].name){
                    res.render("en_admin_Reason_list",{parray:found.sub[i].Reason,Sub:req.params.dname,Doc:req.params.vname})
                }
            }
        })
    })

    app.get("/en/admin/:name/:dname/:vname/reas/delete",(req,res)=>{

        EDoc.updateOne({name:req.params.vname},{$pull:{"sub.$[elem].Reason": {name:req.params.name} }},  {arrayFilters:[{"elem.name":req.params.dname}]}).then((found)=>{
            res.redirect(`/en/admin/${req.params.vname}/${req.params.dname}/rea/list`)
        })

    })
  

    app.post("/en/admin/rea",async (req,res)=>{
        const name=req.body.name
        const विलेख=req.body.विलेख
        const दस्तावेज=req.body.दस्तावेज
        const found= await EDoc.findOne({name:विलेख});
        console.log(found);
            for(let i=0;i<found.sub.length;i++){
                if(दस्तावेज==found.sub[i].name){
                        for(let j=0;j<found.sub[i].Reason.length;j++){
                            if(name==found.sub[i].Reason[j].name){
                                rea_valid=1;
                                break;
                            }
                        }
                        if(rea_valid==0){
                            const obj={
                                name:name,
                            }
                            found.sub[i].Reason.push(obj)
                        }
                        break;
                    }
                }
                await found.save();
            
            res.redirect("/en/admin/rea")
       
    })


   
    // Important
    var EImportant_valid=0;
    app.get("/en/admin/important",(req,res)=>{
        res.render("en_admin_important",{Important_valid:EImportant_valid})
        EImportant_valid=0
    })
    
    app.post("/en/admin/important",upload120.single('importantPDF'),async(req,res)=>{ 
        try{
            const important=req.body.important;
            const importantImage = `/uploads/important/${req.file.filename}`;
    
    
            EImp.findOne({name:important}).then(async(found)=>{
                if(found){
                    EImportant_valid=1
                    res.redirect("/en/admin/important")
                }
                else{
                    const imp=new EImp({
                        name:important,
                        path:importantImage
                    })
                    await imp.save().then(()=>{
                        res.redirect("/en/admin/important")
                    })
                }
            })
        }catch(e){
            console.log(e);
        }
    })


    app.get("/en/admin/important/list",(req,res)=>{
        EImp.find().then((found)=>{
            res.render("en_admin_important_list",{parray:found})
        })
    })

    app.get("/en/admin/:name/imp/delete",async (req,res)=>{
        const found= await Imp.findOne({name:req.params.name});
        const path=found.path.substring(1);
        fs.unlinkSync(path);
        EImp.deleteOne({name:req.params.name}).then(()=>{
            res.redirect("/en/admin/important/list")
        })
    })

       // Help

       app.get("/en/admin/help",(req,res)=>{
           EDoc.find().then((found)=>{
               res.render("en_admin_help",{parray:found})
           })
       })
   
       app.get("/en/admin/help/list",(req,res)=>{
        EHelp.find().then((found)=>{
            res.render("en_admin_help_list",{parray:found})
        })
       })
   
       app.get("/en/admin/help/delete",async (req,res)=>{
            // const found= await Help.findOne({name:req.query.name,vilakh:req.query.vilakh,dastavej:req.query.dastavej});
            // const link=found.link.substring(1);
            // fs.unlinkSync(link);
            EHelp.deleteOne({name:req.query.name,vilakh:req.query.vilakh,dastavej:req.query.dastavej}).then(()=>{
                res.redirect("/en/admin/help/list")
            })
       })
     
   
       app.post("/en/admin/help",upload200.single('helpPDF'),async (req,res)=>{
           const name=req.body.name
           const Vilakh=req.body.Vilakh
           const Dastavej=req.body.Dastavej
           const helppdf = `/uploads/help/${req.file.filename}`;
           const help=new EHelp({
                name:name,
                vilakh:Vilakh,
                dastavej:Dastavej,
                link:helppdf
            })
            await help.save().then(()=>{
                res.redirect("/en/admin/help")
            })          
       })

         // Checklists

         app.get("/en/admin/check",(req,res)=>{
            EDoc.find().then((found)=>{
                res.render("en_admin_check",{parray:found})
            })
        })
    
        app.get("/en/admin/check/list",(req,res)=>{
            ECheck.find().then((found)=>{
             res.render("en_admin_check_list",{parray:found})
         })
        })
    
        app.get("/en/admin/check/delete",async (req,res)=>{
             const found= await Check.findOne({name:req.query.name,vilakh:req.query.vilakh,dastavej:req.query.dastavej});
             const link=found.link.substring(1);
             fs.unlinkSync(link);
            ECheck.deleteOne({name:req.query.name,vilakh:req.query.vilakh,dastavej:req.query.dastavej}).then(()=>{
                 res.redirect("/en/admin/check/list")
             })
        })
      
    
        app.post("/en/admin/check",upload201.single('checkPDF'),async (req,res)=>{
            const name=req.body.name
            const Vilakh=req.body.Vilakh
            const Dastavej=req.body.Dastavej
            const checkpdf = `/uploads/checklist/${req.file.filename}`;
            const check=new ECheck({
                 name:name,
                 vilakh:Vilakh,
                 dastavej:Dastavej,
                 link:checkpdf
             })
             await check.save().then(()=>{
                 res.redirect("/en/admin/check")
             })          
        })

app.listen(3000,(req,res)=>{
    console.log("Server started at port 3000")
})
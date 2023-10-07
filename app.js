require("dotenv").config()
const express=require("express") 
const app = express();
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const nodemailer=require("nodemailer");
const multer=require("multer");
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
const vigyaapnUpload = require("./controller/vigyaapnUpload");
const documentUpload = require("./controller/documentUpload");
const sampatiVivran = require("./controller/sampatiVivran");
const datsavejLogin = require("./controller/DastavejLogin");
const datsavejRegister = require("./controller/DasavejRegister");

//Models
const DocumentSchema = require('./models/Documents');
const DastavejUser = require("./models/DastavejUser");
const JilaModel = require('./models/JilaModel');
const Condition1Model = require("./models/Condition");


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



mongoose.connect("mongodb://0.0.0.0:27017/govdb",{
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
  Dastavej:{
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
            type:String,
            amount:Number,
            date:String,
            bank:String,
            check:toString
        }
    ]
  }
});

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
            SamptiMauk:String,
            PanType:String,
            Paksh:String,
            panjikar: Number,
            Type:String,
            Reason:[
                {
                    name:String,
                    discount:Number,
                    Type:String,
                    Applicable:String
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
    ]
  });

const Doc= mongoose.model("Doc",docSchema);

const parSchema= new mongoose.Schema({
    name: String,   
  });

const Parskh= mongoose.model("Parskh",parSchema);

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
        number:appli
    }
    fou.application.push(obj);
    await fou.save()
    Doc.find().then((found)=>{
         Parskh.find().then((parskh)=>{
            Sampati.find().then((samp)=>{
                res.render("new",{unit1:found,parskh:parskh,samp:samp,appli:appli})

            })
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
    let Sampati=[]
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
            Sampati.push(ob);
        }
        else{
            let ob={
                valid:req.body.sampati,
                number:"",
                office:"",
                date:"",
                file:""
            }
            Sampati.push(ob);
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
            Aadiwasi.push(obj);
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
        if(typeof(req.body.pratifal)==string){
            let ob={
                type:req.body.pratifal,
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
                    type:req.body.pratifal,
                    date:req.body.pratifaldate,
                    check:req.body.check,
                    amount:req.body.pratifalamount,
                    bank:req.body.pratifalbank
                }
                Partifal.push(ob);
            }
        }
       
    }

    let obj={
        document:req.body.doc,
        docdescription:req.body.docdes,
        pakshkar:req.body.parskh,
        subdocument:req.body.sub,
        subdocdescription:req.body.subdes,
        Sampati:Sampati,
        Aadiwasi:Aadiwasi,
        Loan:Loan,
        Ledge:Ledge,
        Partifal:Partifal
    }

    const user1= await User.findOne({email:req.cookies.useremail});
    for(let i=0;i<user1.application.length;i++){
        if(user1.application[i].number==req.params.number){
            user1.application[i].Dastavej=obj;
            break;
        }
    }
    res.redirect(`${req.params.number}/new`)
})



// Sampati form

let obj=[
    {
      name: "A",
      mohalla:[
        {
            name:"B",
            society:[
                {
                    name:"C",
                    bhumi:[{
                        name:"20 andar",     
                        price:14000    
                      },
                      {
                        name:"20 bhar",
                        price:20000,
                      }
                    ]
                },
                {
                    name:"C1",
                    bhumi:[{
                        name:"20 andar",     
                        price:12560  
                      },
                      {
                        name:"20 bhar",
                        price:8400,
                      }
                    ]
                }
            ]
        }
      ]  
    }
]

let obj1=[   
    {
        name:"20 andar",     
        price:14000    
    },
    {
        name:"20 bhar",
        price:20000,
    }    
]


let objH=[
    {
        name:"H",
        price:1500000
    }
]
let objH1=[
    {
        name:"H",
        price:1500000
    },
    {
        name:"H1",
        price:150000
    }
]

let fobj=[
    {
        name:"D",
        per:25
    },
    {
        name:"C",
        per:25
    },
    {
        name:"DC",
        per:50
    },
    
]

let robj=[
    {
        name:"R1",
        per:10
    },
    {
        name:"R2",
        per:30
    },
    {
        name:"H3",
        per:20
    },
    
]


app.post("/sampti",(req,res)=>{
    const sak=req.body.sak
    const k=req.body.k
    const rakba=req.body.rakba
    const hbumi=req.body.Hbumi;
    const ward=req.body.ward;
    const mohalla=req.body.mohalla;
    const society=req.body.society;
    const bhumi=req.body.bhumi;
    const fasl=req.body.fasl;
    const road=req.body.road;
    const ty=req.body.ty;
    let warr=[]
    let Hector=[]
    let mward=[]
    let total=0;
    const tree=req.body.tree;
    const treeType=req.body.treeType;
    const treeQuantity=req.body.treeQuantity;
    const treeName=req.body.treeName;
    const treeQuality=req.body.treeQuality;
    const treeSize=req.body.treeSize;

    let tree_total=0;    
    const vishesh=req.body.vishesh;
    const vishName=req.body.vishName;
    const vishType=req.body.vishType;
    const vishPrice=req.body.vishPrice;
    const vishQuantity=req.body.vishQuantity;
    let vish_total=0;


    if(sak=="kakarNagarPalika"){
        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1.length;j++){
                    if(bhumi[i]==obj1[j].name){
                       warr.push(obj1[j].price);
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
                if(ty[i]=="pa"){

                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120)*2.5;
                            tt=tt+to;
                        }
                    }

                }
                else{
                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                }
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].per*to)/100;
                        }
                    }
        
                    for(let j=0;j<robj.length;j++){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].per*to)/100;
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
                        if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
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
            if(mward[i].type=="k"){
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

    else if(sak=="kakarNagarPanchayat"){
        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1.length;j++){
                    if(bhumi[i]==obj1[j].name){
                       warr.push(obj1[j].price);
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
                if(ty[i]=="pa"){

                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120)*2.5;
                            tt=tt+to;
                        }
                    }

                }
                else{
                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                }
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].per*to)/100;
                        }
                    }
        
                    for(let j=0;j<robj.length;j++){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].per*to)/100;
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
                        if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
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
            if(mward[i].type=="k"){
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

    else if(sak=="baNagarPan"){
        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1.length;j++){
                    if(bhumi[i]==obj1[j].name){
                       warr.push(obj1[j].price);
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
                if(ty[i]=="pa"){

                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120)*2.5;
                            tt=tt+to;
                        }
                    }

                }
                else{
                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                }
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].per*to)/100;
                        }
                    }
        
                    for(let j=0;j<robj.length;j++){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].per*to)/100;
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
                        if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
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
            if(mward[i].type=="k"){
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

    else if(sak=="MarPan"){
        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1.length;j++){
                    if(bhumi[i]==obj1[j].name){
                       warr.push(obj1[j].price);
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
                            to=objH[j].price*(rakba[i]/10120);
                            tt=tt+to;
                        }
                }
                
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].per*to)/100;
                        }
                    }
        
                    for(let j=0;j<robj.length;j++){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].per*to)/100;
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
                        if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
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
            if(mward[i].type=="k"){
                if(mward[i].val<=506){
                    total=total+(mward[i].name*mward[i].val);
                }
                else{
                    total=total+(mward[i].name*(mward[i].val-506)*0.25)+(506*mward[i].name);
          
                }
            }else{
                if(mward[i].val<=506){
                    total=total+(mward[i].name*mward[i].val);
                }
                else if(mward[i].val<=1012){
                    total=total+(mward[i].name*(mward[i].val-506)*0.5)+(506*mward[i].name);
          
                }else{
                    total=total+(mward[i].name*(mward[i].val-1012)*0.25)+(506*mward[i].name*0.5)+(506*mward[i].name);
          
                }
            }
        }
    }

    else if(sak=="pandPan"){
        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1.length;j++){
                    if(bhumi[i]==obj1[j].name){
                       warr.push(obj1[j].price);
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
                if(ty[i]=="pa"){

                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120)*2.5;
                            tt=tt+to;
                        }
                    }

                }
                else{
                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                }
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].per*to)/100;
                        }
                    }
        
                    for(let j=0;j<robj.length;j++){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].per*to)/100;
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
                        if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
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
            if(mward[i].type=="k"){
                total=total+(mward[i].name*mward[i].val);                 
            }else{
                total=total+(mward[i].name*mward[i].val);                 
            }
        }
    }

    else if(sak=="JangPan"){
        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1.length;j++){
                    if(bhumi[i]==obj1[j].name){
                       warr.push(obj1[j].price);
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
                if(ty[i]=="pa"){

                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120)*2.5;
                            tt=tt+to;
                        }
                    }

                }
                else{
                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                }
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].per*to)/100;
                        }
                    }
        
                    for(let j=0;j<robj.length;j++){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].per*to)/100;
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
                        if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
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
            if(mward[i].type=="k"){
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

    else if(sak=="dantPal"){
        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1.length;j++){
                    if(bhumi[i]==obj1[j].name){
                       warr.push(obj1[j].price);
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
                if(ty[i]=="pa"){

                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120)*2.5;
                            tt=tt+to;
                        }
                    }

                }
                else{
                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                }
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].per*to)/100;
                        }
                    }
        
                    for(let j=0;j<robj.length;j++){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].per*to)/100;
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
                        if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
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
            if(mward[i].type=="k"){
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

    else if(sak=="dantPan"){
        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1.length;j++){
                    if(bhumi[i]==obj1[j].name){
                       warr.push(obj1[j].price);
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
                if(ty[i]=="pa"){

                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120)*2.5;
                            tt=tt+to;
                        }
                    }

                }
                else{
                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                }
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].per*to)/100;
                        }
                    }
        
                    for(let j=0;j<robj.length;j++){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].per*to)/100;
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
                        if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
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
            if(mward[i].type=="k"){
                if(mward[i].val<=506){
                    total=total+(mward[i].name*mward[i].val);
                }
                else{
                    total=total+(mward[i].name*(mward[i].val-1012)*0.25)+(506*mward[i].name);
          
                }
            }else{
                total=total+(mward[i].name*mward[i].val);                 
            }
        }
    }
    
    else if(sak=="Balod"){
        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1.length;j++){
                    if(bhumi[i]==obj1[j].name){
                       warr.push(obj1[j].price);
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
                if(ty[i]=="pa"){

                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120)*2.5;
                            tt=tt+to;
                        }
                    }

                }
                else{
                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                }
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].per*to)/100;
                        }
                    }
        
                    for(let j=0;j<robj.length;j++){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].per*to)/100;
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
                        if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
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
            if(mward[i].type=="k"){
                    total=total+(mward[i].name*mward[i].val);                   
            }else{
                total=total+(mward[i].name*mward[i].val);                 
            }
        }
    }
    else if(sak=="Gudar"){
        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1.length;j++){
                    if(bhumi[i]==obj1[j].name){
                       warr.push(obj1[j].price);
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
                if(ty[i]=="pa"){

                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120)*2.5;
                            tt=tt+to;
                        }
                    }

                }
                else{
                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                }
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].per*to)/100;
                        }
                    }
        
                    for(let j=0;j<robj.length;j++){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].per*to)/100;
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
                        if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
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
            if(mward[i].type=="k"){
                if(mward[i].val<=506){
                    total=total+(mward[i].name*mward[i].val);
                }
                else{
                    total=total+(mward[i].name*(mward[i].val-506)*0.25)+(506*mward[i].name);
          
                }
            }else{
                if(mward[i].val<=4048){
                    total=total+(mward[i].name*mward[i].val*0.9);
                }
                else{
                    total=total+(mward[i].name*(mward[i].val-506)*0.7)+(506*mward[i].name*0.9);
          
                }                }
        }
    }
    else if(sak=="Balesh"){
        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1.length;j++){
                    if(bhumi[i]==obj1[j].name){
                       warr.push(obj1[j].price);
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
                            to=objH[j].price*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].per*to)/100;
                        }
                    }
        
                    for(let j=0;j<robj.length;j++){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].per*to)/100;
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
                        if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
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
            if(mward[i].type=="k"){
                if(mward[i].val<=506){
                    total=total+(mward[i].name*mward[i].val);
                }
                else{
                    total=total+(mward[i].name*(mward[i].val-506)*0.20)+(506*mward[i].name);
          
                }
            }else{
                if(mward[i].val<=506){
                    total=total+(mward[i].name*mward[i].val);
                }
                else{
                    total=total+(mward[i].name*(mward[i].val-506)*0.40)+(506*mward[i].name);
          
                }                }
        }
    }
    else if(sak=="Beja"){
        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1.length;j++){
                    if(bhumi[i]==obj1[j].name){
                       warr.push(obj1[j].price);
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
                if(ty[i]=="pa"){

                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120)*2.5;
                            tt=tt+to;
                        }
                    }

                }
                else{
                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                }
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].per*to)/100;
                        }
                    }
        
                    for(let j=0;j<robj.length;j++){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].per*to)/100;
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
                        if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
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
            if(mward[i].type=="k"){
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
    else if(sak=="Bemeter1"){
        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1.length;j++){
                    if(bhumi[i]==obj1[j].name){
                       warr.push(obj1[j].price);
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
                if(ty[i]=="pa"){

                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120)*2.5;
                            tt=tt+to;
                        }
                    }

                }
                else{
                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                }
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].per*to)/100;
                        }
                    }
        
                    for(let j=0;j<robj.length;j++){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].per*to)/100;
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
                        if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
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
            if(mward[i].type=="k"){
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
    else if(sak=="Bemeter2"){
        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1.length;j++){
                    if(bhumi[i]==obj1[j].name){
                       warr.push(obj1[j].price);
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
                if(ty[i]=="pa"){

                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120)*2.5;
                            tt=tt+to;
                        }
                    }

                }
                else{
                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                }
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].per*to)/100;
                        }
                    }
        
                    for(let j=0;j<robj.length;j++){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].per*to)/100;
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
                        if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
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
            if(mward[i].type=="k"){
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
    else if(sak=="Mandrapal"){
        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1.length;j++){
                    if(bhumi[i]==obj1[j].name){
                       warr.push(obj1[j].price);
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
                if(ty[i]=="pa"){

                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120)*2.5;
                            tt=tt+to;
                        }
                    }

                }
                else{
                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                }
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].per*to)/100;
                        }
                    }
        
                    for(let j=0;j<robj.length;j++){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].per*to)/100;
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
                        if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
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
            if(mward[i].type=="k"){
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
    else if(sak=="Mandrapan"){
        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1.length;j++){
                    if(bhumi[i]==obj1[j].name){
                       warr.push(obj1[j].price);
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
                if(ty[i]=="pa"){

                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120)*2.5;
                            tt=tt+to;
                        }
                    }

                }
                else{
                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                }
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].per*to)/100;
                        }
                    }
        
                    for(let j=0;j<robj.length;j++){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].per*to)/100;
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
                        if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
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
            if(mward[i].type=="k"){
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
    else if(sak=="mohal"){
        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1.length;j++){
                    if(bhumi[i]==obj1[j].name){
                       warr.push(obj1[j].price);
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
                if(ty[i]=="pa"){

                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120)*2.5;
                            tt=tt+to;
                        }
                    }

                }
                else{
                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                }
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].per*to)/100;
                        }
                    }
        
                    for(let j=0;j<robj.length;j++){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].per*to)/100;
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
                        if(mward[j].type==ty[i]){
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
            if(mward[i].type=="k" || mward[i].type=="p"){
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
    else if(sak=="ranjar"){
        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1.length;j++){
                    if(bhumi[i]==obj1[j].name){
                       warr.push(obj1[j].price);
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
                if(ty[i]=="pa"){

                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120)*2.5;
                            tt=tt+to;
                        }
                    }

                }
                else{
                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                }
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].per*to)/100;
                        }
                    }
        
                    for(let j=0;j<robj.length;j++){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].per*to)/100;
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
                        if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
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
                if(mward[i].val<=506){
                    total=total+(mward[i].name*mward[i].val);
                }
                else{
                    total=total+(mward[i].name*(mward[i].val-506)*0.4)+(506*mward[i].name);
          
                }
        }
    }
    else if(sak=="ambika1"){
        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1.length;j++){
                    if(bhumi[i]==obj1[j].name){
                       warr.push(obj1[j].price);
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
                if(ty[i]=="pa"){

                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120)*2.5;
                            tt=tt+to;
                        }
                    }

                }
                else{
                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                }
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].per*to)/100;
                        }
                    }
        
                    for(let j=0;j<robj.length;j++){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].per*to)/100;
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
                        if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
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
            if(mward[i].type=="k"){
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
    else if(sak=="ambika2"){
        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1.length;j++){
                    if(bhumi[i]==obj1[j].name){
                       warr.push(obj1[j].price);
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
                if(ty[i]=="pa"){

                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120)*2.5;
                            tt=tt+to;
                        }
                    }

                }
                else{
                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                }
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].per*to)/100;
                        }
                    }
        
                    for(let j=0;j<robj.length;j++){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].per*to)/100;
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
                        if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
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
            if(mward[i].type=="k"){
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
    else if(sak=="raygarh1"){
        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1.length;j++){
                    if(bhumi[i]==obj1[j].name){
                       warr.push(obj1[j].price);
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
                if(ty[i]!="k"){

                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120)*2.5;
                            tt=tt+to;
                        }
                    }

                }
                else{
                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                }
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].per*to)/100;
                        }
                    }
        
                    for(let j=0;j<robj.length;j++){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].per*to)/100;
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
                        if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
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
            if(mward[i].type=="k"){
                if(mward[i].val<=506){
                    total=total+(mward[i].name*mward[i].val);
                }
                else{
                    total=total+(mward[i].name*(mward[i].val-506)*0.25)+(506*mward[i].name);
          
                }
            }else{
                if(mward[i].val<=1014){
                    total=total+(mward[i].name*mward[i].val);
                }
                else{
                    total=total+(mward[i].name*(mward[i].val-1014)*0.60)+(1014*mward[i].name);
          
                }                }
        }
    }
    else if(sak=="raygarh2"){
        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1.length;j++){
                    if(bhumi[i]==obj1[j].name){
                       warr.push(obj1[j].price);
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
                if(ty[i]!="k"){

                    for(let j=0;j<objH1.length;j++){
                        if(hbumi[i]==objH1[j].name){
                            to=objH1[j].price*(rakba[i]/10120)*2.5;
                            tt=tt+to;
                        }
                    }

                }
                else{
                    for(let j=0;j<objH1.length;j++){
                        if(hbumi[i]==objH1[j].name){
                            to=objH1[j].price*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                }
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].per*to)/100;
                        }
                    }
        
                    for(let j=0;j<robj.length;j++){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].per*to)/100;
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
                        if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
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
            if(mward[i].type=="k"){
                if(mward[i].val<=506){
                    total=total+(mward[i].name*mward[i].val);
                }
                else{
                    total=total+(mward[i].name*(mward[i].val-506)*0.25)+(506*mward[i].name);
          
                }
            }else{
                if(mward[i].val<=1014){
                    total=total+(mward[i].name*mward[i].val);
                }
                else{
                    total=total+(mward[i].name*(mward[i].val-1014)*0.60)+(1014*mward[i].name);
          
                }                }
        }
    }
    else if(sak=="raygarh3"){
        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1.length;j++){
                    if(bhumi[i]==obj1[j].name){
                       warr.push(obj1[j].price);
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
                if(ty[i]=="pa"){

                    for(let j=0;j<objH1.length;j++){
                        if(hbumi[i]==objH1[j].name){
                            to=objH1[j].price*(rakba[i]/10120)*2.5;
                            tt=tt+to;
                        }
                    }

                }
                else{
                    for(let j=0;j<objH1.length;j++){
                        if(hbumi[i]==objH1[j].name){
                            to=objH1[j].price*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                }
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].per*to)/100;
                        }
                    }
        
                    for(let j=0;j<robj.length;j++){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].per*to)/100;
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
                        if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
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
            if(mward[i].type=="k"){
                if(mward[i].val<=506){
                    total=total+(mward[i].name*mward[i].val);
                }
                else if(mward[i].val<=1012){
                    total=total+(mward[i].name*(mward[i].val-506)*0.8)+(506*mward[i].name);
          
                }else{
                    total=total+(mward[i].name*(mward[i].val-1012)*0.5)+(506*mward[i].name*0.8)+(506*mward[i].name);
          
                }
            }else{
                if(mward[i].val<=1014){
                    total=total+(mward[i].name*mward[i].val);
                }
                else{
                    total=total+(mward[i].name*(mward[i].val-1014)*0.60)+(1014*mward[i].name);
          
                }   
            }
        }
    }
    else if(sak=="mahasam"){
        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1.length;j++){
                    if(bhumi[i]==obj1[j].name){
                       warr.push(obj1[j].price);
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
                if(ty[i]=="pa"){

                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120)*2.5;
                            tt=tt+to;
                        }
                    }

                }
                else{
                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                }
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].per*to)/100;
                        }
                    }
        
                    for(let j=0;j<robj.length;j++){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].per*to)/100;
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
                        if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
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
            total=total+(mward[i].name*mward[i].val);                 
        }
    }
    else if(sak=="sitapur"){
        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1.length;j++){
                    if(bhumi[i]==obj1[j].name){
                       warr.push(obj1[j].price);
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
                if(ty[i]=="pa"){

                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120)*2.5;
                            tt=tt+to;
                        }
                    }

                }
                else{
                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                }
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].per*to)/100;
                        }
                    }
        
                    for(let j=0;j<robj.length;j++){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].per*to)/100;
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
                        if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
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
            total=total+(mward[i].name*mward[i].val);                 
        }
    }
    else if(sak=="surajpur"){
        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1.length;j++){
                    if(bhumi[i]==obj1[j].name){
                       warr.push(obj1[j].price);
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
                if(ty[i]=="pa"){

                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120)*2.5;
                            tt=tt+to;
                        }
                    }

                }
                else{
                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                }
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].per*to)/100;
                        }
                    }
        
                    for(let j=0;j<robj.length;j++){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].per*to)/100;
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
                        if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
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
            total=total+(mward[i].name*mward[i].val);                 
        }
    }
    else if(sak=="patna"){
        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1.length;j++){
                    if(bhumi[i]==obj1[j].name){
                       warr.push(obj1[j].price);
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
                if(ty[i]=="pa"){

                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120)*2.5;
                            tt=tt+to;
                        }
                    }

                }
                else{
                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                }
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].per*to)/100;
                        }
                    }
        
                    for(let j=0;j<robj.length;j++){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].per*to)/100;
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
                        if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
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
            total=total+(mward[i].name*mward[i].val);                 
        }
    }
    else if(sak=="baloda"){
        for(let i=0;i<ward.length;i++){
            if(bhumi[i]=="N"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj1.length;j++){
                    if(bhumi[i]==obj1[j].name){
                       warr.push(obj1[j].price);
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
                if(ty[i]=="pa"){

                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120)*2.5;
                            tt=tt+to;
                        }
                    }

                }
                else{
                    for(let j=0;j<objH.length;j++){
                        if(hbumi[i]==objH[j].name){
                            to=objH[j].price*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                }
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].per*to)/100;
                        }
                    }
        
                    for(let j=0;j<robj.length;j++){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].per*to)/100;
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
                        if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
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
            total=total+(mward[i].name*mward[i].val);                 
        }
    }

    else{
        if(sak=="J"){
            for(let i=0;i<ward.length;i++){
                if(bhumi[i]=="N"){
                    warr.push(0);
                }
                else{
                    for(let j=0;j<obj1.length;j++){
                        if(bhumi[i]==obj1[j].name){
                           warr.push(obj1[j].price);
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
                    if(ty[i]=="pa"){
    
                        for(let j=0;j<objH.length;j++){
                            if(hbumi[i]==objH[j].name){
                                to=objH[j].price*(rakba[i]/10120)*2.5;
                                tt=tt+to;
                            }
                        }
    
                    }
                    else{
                        for(let j=0;j<objH.length;j++){
                            if(hbumi[i]==objH[j].name){
                                to=objH[j].price*(rakba[i]/10120);
                                tt=tt+to;
                            }
                        }
                    }
                        for(let j=0;j<fobj.length;j++){
                            if(fasl[i]==fobj[j].name){
                                tt=tt+(fobj[j].per*to)/100;
                            }
                        }
            
                        for(let j=0;j<robj.length;j++){
                            if(road[i]==robj[j].name){
                                tt=tt+(robj[j].per*to)/100;
                            }
                        }
                    
        
                    Hector.push(tt);
                }
            }
        }



        for(let i=0;i<ward.length;i++){
                if(ward[i]=="N"){
                    warr.push(0);
                }
                else{
                    for(let j=0;j<obj.length;j++){
                        if(ward[i]==obj[j].name){
                            for(let k=0;k<obj[j].mohalla.length;k++){
                                if(mohalla[i]==obj[j].mohalla[k].name){
                                    for(let m=0;m<obj[j].mohalla[k].society.length;m++){
                                        if(society[i]==obj[j].mohalla[k].society[m].name){
                                            for(let km=0;km<obj[j].mohalla[k].society[m].bhumi.length;km++){
                                                if(bhumi[i]==obj[j].mohalla[k].society[m].bhumi[km].name)
                                                {
                                                    warr.push(obj[j].mohalla[k].society[m].bhumi[km].price);
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
                            to=objH[j].price*(rakba[i]/10120);
                            tt=tt+to;
                        }
                    }
                    for(let j=0;j<fobj.length;j++){
                        if(fasl[i]==fobj[j].name){
                            tt=tt+(fobj[j].per*to)/100;
                        }
                    }
        
                    for(let j=0;j<robj.length;j++){
                        if(road[i]==robj[j].name){
                            tt=tt+(robj[j].per*to)/100;
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
                        mward[j].val=mward[j].val+Number(rakba[i]);
                        if(mward[j].type!='k' && ty[i]=='k'){
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

        if(sak=="kn"){
            for(let i=0;i<hbumi.length;i++){
                if(hbumi[i]=="N"){
                    Hector.push(0);
                }
                else{
                    let to;
                    let tt=0;
                        for(let j=0;j<objH1.length;j++){
                            if(hbumi[i]==objH1[j].name){
                                to=objH1[j].price*(rakba[i]/10120);
                                tt=tt+to;
                            }
                        }
                        // for(let j=0;j<fobj.length;j++){
                        //     if(fasl[i]==fobj[j].name){
                        //         tt=tt+(fobj[j].per*to)/100;
                        //     }
                        // }
            
                        // for(let j=0;j<robj.length;j++){
                        //     if(road[i]==robj[j].name){
                        //         tt=tt+(robj[j].per*to)/100;
                        //     }
                        // }
                    
        
                    Hector.push(tt);
                }
            }
            for(let i=0;i<warr.length;i++){
                if(warr[i]!=0){
                    let flag=0;
                    for(let j=0;j<mward.length;j++){
                        if(mward[j].name==warr[i]){
                            if((mward[j].type=="k" && ty[i]=="k") || (mward[j].type!="k" && ty[i]!="k")){
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
    
        for(let i=0;i<Hector.length;i++){
            total=total+Hector[i];
        }
    
    
      if(sak=="P" || sak=="kn"){
        console.log(sak);
            for(let i=0;i<mward.length;i++){
                if(mward[i].type=="k"){
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
    
      else if(sak=="N"){
                for(let i=0;i<mward.length;i++){
                if(mward[i].type=="k"){
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
      else if(sak=="J"){
                for(let i=0;i<mward.length;i++){
                        total=total+(mward[i].name*mward[i].val);                    
                 }
        }
      else{
            for(let i=0;i<mward.length;i++){
                if(mward[i].type=="k"){
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

    console.log(mward);
    console.log(Hector);
    console.log(total);
    res.send("Succ");

    for(let i=0;i<vishesh.length;i++){
        if(vishesh[i]=="Yes"){
            if(vishName[i]=="Machine"){
                Famous.findOne({name:vishType[i]}).then((found)=>{
                    vish_total=vish_total+(found.price*vishQuantity[i])
                })
            }
            else{
                vish_total=vish_total+(vishPrice[i]*vishQuantity[i])
            }
        }
    }

    for(let i=0;i<tree.length;i++){
        if(tree[i]=="Yes"){
            if(treeType=="Timber"){
                Tree.findOne({name:treeName[i],quality:treeQuality[i],size:treeSize[i]}).then((found)=>{
                    tree_total=tree_total+(found.price*treeQuantity[i]);
                })
            }
            else{
                Fruit.findOne({name: treeName[i]}).then((found)=>{
                    tree_total=tree_total+(found.price*treeQuantity[i]);
                })
            }
        }
    }

 

})

// Stamp

app.get("/:vname/:dname/stamp",(req,res)=>{
    Doc.findOne({name:req.params.vname}).then((found)=>{
        for(let i=0;i<found.sub.length;i++){
            res.render("stamp",{docum:found.sub[i]})
        }
    })
})

app.post("/:vname/:dname/stamp",(req,res)=>{
    let upk
    let jan
    let sta
    let panji
    let total_st=0;
    const actual=req.body.actual
    const sell=req.body.sell
    const sdi=req.body.sdi;
    const pid=req.body.pid;
    const sd=req.body.sd;
    const pd=req.body.pd;
    const ppt=req.body.ppt;
    const pst=req.body.pst;

    Doc.findOne({name:req.params.vname}).then((found)=>{
        for(let i=0;i<found.sub.length;i++){
            if(found.sub[i].name==req.params.dname){
                if(found.sub[i].Type=="Percentage"){
                    upk=(found.sub[i].Upkar*actual)/100;
                    jan=(found.sub[i].Janpad*actual)/100;
                    sta=(found.sub[i].Stamp*actual)/100;
                    panji=(found.sub[i].panjikar*actual)/100;
                    total_st=upk+jan+sta;
                }
                if(found.sub[i].Type=="Fixed"){
                    upk=found.sub[i].Upkar;
                    jan=found.sub[i].Janpad;
                    sta=found.sub[i].Stamp;
                    panji=found.sub[i].panjikar;
                    total_st=upk+jan+sta;
                }
            }
        }
        if(sdi=="Yes"){
            
            sta=sta-((sta*sd)/100)
            total_st=upk+jan+sta;

        }
        if(pid=="Yes"){
            panji=panji-((panji*pd)/100)
        }
        if(pid=="Yes"){
            sta=sta-pst
            total_st=upk+jan+sta;

            panji=panji-ppt
        }
        let obj={
           sta:sta,
           upk:upk,
           jan:jan,
           total:total_st,
           panji:panji
        }
        console.log(obj);
    })
 

})

// pakashkar

app.get("/:dname/pakashkar",(req,res)=>{

    Verify.find().then((found)=>{
        Doc.findOne({name:req.params.dname}).then((found1)=>{
            res.render("pakashkar",{parray:found,parray1:found1.people})
        })
    })
})

app.post("/pakashkar",(req,res)=>{
    console.log(req.body);
  
    res.redirect("/pakashkar")
})

// Template
app.get("/:vname/:dname/templete",(req,res)=>{

    Doc.findOne({name:req.params.vname}).then( (found)=>{
        for(let i=0;i<found.sub.length;i++){
            if(found.sub[i].name==req.params.dname){
                res.render("templete",{unit1:found.sub[i].templete})
            }
        }

    })
})

app.post("/templete",(req,res)=>{
    console.log(req.body);
  
    res.redirect("/templete")
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
    app.get("/admin/:name/DastvajJilla/delete",(req,res)=>{
        DastvajJila.deleteOne({name:req.params.name}).then((found)=>{
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
                    res.render("admin_sub_update",{name:req.params.name,description:found.sub[i].description,parray:parray,Type:found.sub[i].Type,Stamp:found.sub[i].Stamp,Upkar:found.sub[i].Upkar,Janpad:found.sub[i].Janpad,panjikar:found.sub[i].panjikar,dname:req.params.dname,PanType:found.sub[i].PanType,Partiton:found.sub[i].Partiton,Paksh:found.sub[i].Paksh,SamptiRequi:found.sub[i].SamptiRequi,SamptiMauk:found.sub[i].SamptiMauk})
                    
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
        const Janpad=req.body.Janpad
        const panjikar=req.body.panjikar
        const PanType=req.body.PanType
        const Partiton=req.body.Partiton
        const Paksh=req.body.Paksh
        const SamptiRequi=req.body.SamptiRequi
        const SamptiMauk=req.body.SamptiMauk
        console.log(विलेख)
        Doc.updateOne({name:विलेख},{$set:{"sub.$[elem].description":description, "sub.$[elem].Type":Type, "sub.$[elem].Stamp":Stamp,"sub.$[elem].Upkar":Upkar,"sub.$[elem].Janpad":Janpad,"sub.$[elem].panjikar":panjikar,"sub.$[elem].PanType":PanType,"sub.$[elem].Partiton":Partiton,"sub.$[elem].Paksh":Paksh,"sub.$[elem].SamptiRequi":SamptiRequi,"sub.$[elem].SamptiMauk":SamptiMauk}},{arrayFilters:[{"elem.name":name}]}).then(()=>{
            res.redirect("/admin/sub/list")
        }).catch((e)=>{
            console.log(e)
        })
    })

    // Parsakh
    var parskh_valid=0;

    app.get("/admin/par",(req,res)=>{
        res.render("admin_par",{parskh_valid:parskh_valid})
        parskh_valid=0;
    })

    app.get("/admin/par/list",(req,res)=>{
        Parskh.find().then((found)=>{
            res.render("admin_par_list",{parray:found})
        })
    })

    app.get("/admin/:name/par/delete",(req,res)=>{
        Parskh.deleteOne({name:req.params.name}).then((found)=>{
            res.redirect("/admin/par/list")
        })
    })

    app.post("/admin/par",(req,res)=>{
        const name=req.body.name
        Parskh.findOne({name:name}).then(async(found)=>{
            if(found){
                parskh_valid=1;
            }else{
                const parskh=new Parskh({
                    name:name,
                })
                await parskh.save();
            }
            res.redirect("/admin/par")
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
  
      app.get("/admin/:name/tree/delete",(req,res)=>{
        Tree.deleteOne({name:req.params.name}).then((found)=>{
            res.redirect("/admin/tree/list")
        })
      })
  
      app.post("/admin/tree",async(req,res)=>{
          const name=req.body.name
          const quality=req.body.quality
          const size=req.body.size
          const price=req.body.price
          Tree.findOne({name:name}).then(async(found)=>{
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

      app.get("/admin/:name/tree/update",(req,res)=>{
        Tree.findOne({name:req.params.name}).then((found)=>{
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
 
  app.get("/admin/:city/:sampati/:sagrachna/makan/delete",(req,res)=>{
    Makan.deleteOne({city:req.params.city,sampati:req.params.sampati,sagrachna:req.params.sagrachna}).then((found)=>{
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
 
  app.get("/admin/:city/:sampati/:sagrachna/makan/update",(req,res)=>{
    Makan.findOne({city:req.params.city,sampati:req.params.sampati,sagrachna:req.params.sagrachna}).then((found)=>{
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
    async function processUploadedFileJila(uploadedFile) {
        try {
            // Load the Excel file
            const workbook = xlsx.readFile(`uploads/conditions/${uploadedFile.originalname}`);
    
            // Assuming your Excel file has a single sheet named 'Sheet1'
            const sheetName = 'Sheet1';
            const sheet = workbook.Sheets[sheetName];
    
            // Convert Excel data to an array of objects
            const excelData = xlsx.utils.sheet_to_json(sheet);
    
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
                const Wardprice = item['Ward price'];
                const HectorBhumi = item['Hector Bhumi'];
                const HectorPrice = item['Hector Price'];
    
                // Find or create a Condition1 document by the country name
                let jila = await JilaModel.findOne({ name: Jila });
    
                if (!jila) {
                    // Create a new Condition1 document if it doesn't exist
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
                                                Gao:[
                                                    {
                                                        name:Gao,
                                                        city:[
                                                            {
                                                                name:CityName,
                                                                cityType:CityType,
                                                                ward:[
                                                                    {
                                                                        name:Ward,
                                                                        mohalla:[
                                                                            {
                                                                                name:Mohalla,
                                                                                Society:[
                                                                                    {
                                                                                        name:Society,
                                                                                        Bhumi:[
                                                                                            {
                                                                                                name: WardBhumi,
                                                                                                Price: Wardprice
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                ]
                                                                            }
                                                                        ]
                                                                    }
                                                                ],
                                                                hector:[
                                                                    {
                                                                        name:HectorBhumi,
                                                                        price:HectorPrice
                                                                    }
                                                                ]
                                                            }
                                                        ]

                                                    }
                                                ]
                                            }
                                        ],
                                    },
                                ],
                            },
                        ],
                    });
                    await jila.save();
                }
                 else {
                    // Check if Condition2 already exists within the existing Condition1
                    let thensil = jila.Thesil.find(cond2 => cond2.name === Thensil);
    
                    if (!thensil) {
                        // Create a new Condition2 and Condition3 within the existing Condition1
                        jila.Thesil.push({
                                name: Thensil,
                                Rajiv: [
                                    {
                                        name: Rajiv,
                                        Patwari: [
                                            {
                                                name: Patwari,
                                                Gao:[
                                                    {
                                                        name:Gao,
                                                        city:[
                                                            {
                                                                name:CityName,
                                                                cityType:CityType,
                                                                ward:[
                                                                    {
                                                                        name:Ward,
                                                                        mohalla:[
                                                                            {
                                                                                name:Mohalla,
                                                                                Society:[
                                                                                    {
                                                                                        name:Society,
                                                                                        Bhumi:[
                                                                                            {
                                                                                                name: WardBhumi,
                                                                                                Price: Wardprice
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                ]
                                                                            }
                                                                        ]
                                                                    }
                                                                ],
                                                                hector:[
                                                                    {
                                                                        name:HectorBhumi,
                                                                        price:HectorPrice
                                                                    }
                                                                ]
                                                            }
                                                        ]

                                                    }
                                                ]
                                            }
                                        ],
                                    },
                                ],
                        });
                    }
                    else {
                        // Check if Condition3 already exists within the existing Condition2
                        let rajiv = thensil.Rajiv.find(cond3 => cond3.name === Rajiv);
                        if (!rajiv) {
                            // Create a new Condition3 within the existing Condition2
                            thensil.Rajiv.push(
                                {
                                    name: Rajiv,
                                    Patwari: [
                                        {
                                            name: Patwari,
                                            Gao:[
                                                {
                                                    name:Gao,
                                                    city:[
                                                        {
                                                            name:CityName,
                                                            cityType:CityType,
                                                            ward:[
                                                                {
                                                                    name:Ward,
                                                                    mohalla:[
                                                                        {
                                                                            name:Mohalla,
                                                                            Society:[
                                                                                {
                                                                                    name:Society,
                                                                                    Bhumi:[
                                                                                        {
                                                                                            name: WardBhumi,
                                                                                            Price: Wardprice
                                                                                        }
                                                                                    ]
                                                                                }
                                                                            ]
                                                                        }
                                                                    ]
                                                                }
                                                            ],
                                                            hector:[
                                                                {
                                                                    name:HectorBhumi,
                                                                    price:HectorPrice
                                                                }
                                                            ]
                                                        }
                                                    ]

                                                }
                                            ]
                                        }
                                    ],
                                },
                            );
                        } 
                        else {
                            let patwari = rajiv.Patwari.find(cond4 => cond4.name == Patwari);
                            if (!patwari) {
                                // Create a new Condition3 within the existing Condition2
                                rajiv.Patwari.push(
                                    {
                                        name: Patwari,
                                        Gao:[
                                            {
                                                name:Gao,
                                                city:[
                                                    {
                                                        name:CityName,
                                                        cityType:CityType,
                                                        ward:[
                                                            {
                                                                name:Ward,
                                                                mohalla:[
                                                                    {
                                                                        name:Mohalla,
                                                                        Society:[
                                                                            {
                                                                                name:Society,
                                                                                Bhumi:[
                                                                                    {
                                                                                        name: WardBhumi,
                                                                                        Price: Wardprice
                                                                                    }
                                                                                ]
                                                                            }
                                                                        ]
                                                                    }
                                                                ]
                                                            }
                                                        ],
                                                        hector:[
                                                            {
                                                                name:HectorBhumi,
                                                                price:HectorPrice
                                                            }
                                                        ]
                                                    }
                                                ]

                                            }
                                        ]
                                    }
                                );
                            }
                            else{
                                let gao = patwari.Gao.find(cond4 => cond4.name === Gao);
                                if (!gao) {
                                    // Create a new Condition3 within the existing Condition2
                                    patwari.Gao.push(
                                        {
                                            name:Gao,
                                            city:[
                                                {
                                                    name:CityName,
                                                    cityType:CityType,
                                                    ward:[
                                                        {
                                                            name:Ward,
                                                            mohalla:[
                                                                {
                                                                    name:Mohalla,
                                                                    Society:[
                                                                        {
                                                                            name:Society,
                                                                            Bhumi:[
                                                                                {
                                                                                    name: WardBhumi,
                                                                                    Price: Wardprice
                                                                                }
                                                                            ]
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    ],
                                                    hector:[
                                                        {
                                                            name:HectorBhumi,
                                                            price:HectorPrice
                                                        }
                                                    ]
                                                }
                                            ]

                                        }
                                    );
                                }

                                else{
                                    let City = gao.city.find(cond5 => cond5.name === CityName);
                                    if (!City) {
                                        // Create a new Condition3 within the existing Condition2
                                        gao.city.push(
                                            {
                                                name:CityName,
                                                cityType:CityType,
                                                ward:[
                                                    {
                                                        name:Ward,
                                                        mohalla:[
                                                            {
                                                                name:Mohalla,
                                                                Society:[
                                                                    {
                                                                        name:Society,
                                                                        Bhumi:[
                                                                            {
                                                                                name: WardBhumi,
                                                                                Price: Wardprice
                                                                            }
                                                                        ]
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                ],
                                                hector:[
                                                    {
                                                        name:HectorBhumi,
                                                        price:HectorPrice
                                                    }
                                                ]
                                            }
                                        );
                                    }
                                    else{
                                        if(CityType!==City.cityType){
                                            City.cityType=CityType;
                                        }
                                        if(HectorPrice!=-1){
                                            let hectorBhumi = City.hector.find(cond6 => cond6.name === HectorBhumi);
                                            if (!hectorBhumi) {
                                                // Create a new Condition3 within the existing Condition2
                                                City.hector.push(
                                                    {
                                                        name:HectorBhumi,
                                                        price:HectorPrice
                                                    }
                                                );
                                            }
                                            else{
                                                hectorBhumi.price=HectorPrice
                                            }
                                        }
                                        if(Wardprice!=-1){
                                            let ward1 = City.ward.find(cond7 => cond7.name === Ward);
                                            if (!ward1) {
                                                // Create a new Condition3 within the existing Condition2
                                                City.ward.push(
                                                    {
                                                        name:Ward,
                                                        mohalla:[
                                                            {
                                                                name:Mohalla,
                                                                Society:[
                                                                    {
                                                                        name:Society,
                                                                        Bhumi:[
                                                                            {
                                                                                name: WardBhumi,
                                                                                Price: Wardprice
                                                                            }
                                                                        ]
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                );
                                            }
                                            else{
                                                let mohalla1 = ward1.mohalla.find(cond8 => cond8.name === Mohalla);
                                                if (!mohalla1) {
                                                    // Create a new Condition3 within the existing Condition2
                                                    ward1.mohalla.push(
                                                        {
                                                            name:Mohalla,
                                                            Society:[
                                                                {
                                                                    name:Society,
                                                                    Bhumi:[
                                                                        {
                                                                            name: WardBhumi,
                                                                            Price: Wardprice
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    );
                                                }
                                                else{
                                                    let society = mohalla1.Society.find(cond9 => cond9.name === Society);
                                                    if (!society) {
                                                        // Create a new Condition3 within the existing Condition2
                                                        mohalla1.Society.push(
                                                            {
                                                                name:Society,
                                                                Bhumi:[
                                                                    {
                                                                        name: WardBhumi,
                                                                        Price: Wardprice
                                                                    }
                                                                ]
                                                            }
                                                        );
                                                    }
                                                    else{
                                                        let wardBhumi = society.Bhumi.find(cond10 => cond10.name === WardBhumi);
                                                        if (!wardBhumi) {
                                                            // Create a new Condition3 within the existing Condition2
                                                            society.Bhumi.push(
                                                                {
                                                                    name: WardBhumi,
                                                                    Price: Wardprice
                                                                }
                                                            );
                                                        }
                                                        else{
                                                            wardBhumi.Price=Wardprice
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
                    await jila.save();
                }
            }
            fs.unlinkSync(`uploads/conditions/${uploadedFile.originalname}`);
            return 'Data uploaded to the database.'
        } catch (error) {
            console.error('Error uploading data:', error);
            return 'Internal Server Error'
        }
    
    }

    app.get("/admin/jila",(req,res)=>{
        res.render("admin_jila");
    })

    app.post("/admin/jila", uploadCondition.single('ConditionFile'),async(req,res)=>{
        try {
            if (!req.file) {
                throw new Error('No file uploaded');
            }
    
            const resp = await processUploadedFileJila(req.file);
    
            if (resp === 'Internal Server Error') {
                res.status(500).json({ error: 'Internal Server Error' });
                return
            }
            JilaModel.find().then((found)=>{
                console.log(found[0].Thesil);
            })
            res.status(200).redirect("/admin/jila")
            return
        } catch (error) {
            console.error('Error processing file:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    })

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
        let arr;
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
        let arr;
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

    // Reason

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
        const discount=req.body.rdiscount
        const Type=req.body.Type
        const विलेख=req.body.विलेख
        const दस्तावेज=req.body.दस्तावेज
        const Applicable=req.body.Applicable
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
                                discount:discount,
                                Type:Type,
                                Applicable:Applicable
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

app.listen(3002,(req,res)=>{
    console.log("Server started at port 3000")
})
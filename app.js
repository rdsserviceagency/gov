const express=require("express") 
const app = express();
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const nodemailer=require("nodemailer");
const { name } = require("ejs");
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

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


const docSchema= new mongoose.Schema({
    name: String,
    description: String,
    par: String,
    adi: String,
    PRATIFAL:String,
    Sampati:String,
    sub: [
        {
            name: String,
            description: String,
        }   
    ],
  });

const Doc= mongoose.model("Doc",docSchema);

const parSchema= new mongoose.Schema({
    name: String,   
  });

const Parskh= mongoose.model("Parskh",parSchema);

const SampatiSchema= new mongoose.Schema({
    name: String,
    other: String,
  });

const Sampati= mongoose.model("Sampati",SampatiSchema);


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
                                to:email,
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
                                to:email,
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
app.get("/home",(req,res)=>{
    res.render("home");
})

// New Application
app.get("/new",(req,res)=>{
    Doc.find().then( (found)=>{
         Parskh.find().then((parskh)=>{
            Sampati.find().then((samp)=>{
                res.render("new",{unit1:found,parskh:parskh,samp:samp})

            })
         })
    })
})

app.post("/new",(req,res)=>{
    console.log(req.body);
    res.redirect("/new")
})

// admin

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
                    Sampati:Sampati,
                    sub: [],
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
       const Sampati=req.body.Sampati
       const found=await Doc.findOne({name:name})
       found.description=description
       found.par=par
       found.adi=adi
       found.PRATIFAL=PRATIFAL
       found.Sampati=Sampati
       await found.save().then(()=>{
        res.redirect("/admin/document/list")
       })
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
                    res.render("admin_sub_update",{name:req.params.name,description:found.sub[i].description,parray:parray,dname:req.params.dname})
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
                description:description
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
        console.log(विलेख)
        Doc.updateOne({name:विलेख},{$set:{"sub.$[elem].description":description}},{arrayFilters:[{"elem.name":name}]}).then(()=>{
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
app.listen(3002,(req,res)=>{
    console.log("Server started at port 3000")
})
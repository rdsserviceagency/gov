const express=require("express") 
const app = express();
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const nodemailer=require("nodemailer");
const multer=require("multer");
const path = require("path")
const { name } = require("ejs");
const e = require("express");
app.set("views",path.join(__dirname,"views"))
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
            Stamp:Number,
            Upkar:Number,
            Janpad:Number,
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

const impSchema= new mongoose.Schema({
    name: String,   
    path: String,   
  });

const Imp= mongoose.model("Imp",impSchema);

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


// Important
app.get("/important",(req,res)=>{
    res.render("important");
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
                    res.render("admin_sub_update",{name:req.params.name,description:found.sub[i].description,parray:parray,Type:found.sub[i].Type,Stamp:found.sub[i].Stamp,Upkar:found.sub[i].Upkar,Janpad:found.sub[i].Janpad,panjikar:found.sub[i].panjikar,dname:req.params.dname})
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
        console.log(विलेख)
        Doc.updateOne({name:विलेख},{$set:{"sub.$[elem].description":description, "sub.$[elem].Type":Type, "sub.$[elem].Stamp":Stamp,"sub.$[elem].Upkar":Upkar,"sub.$[elem].Janpad":Janpad,"sub.$[elem].panjikar":panjikar}},{arrayFilters:[{"elem.name":name}]}).then(()=>{
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

    let obj=[
        {
          name: "A",
          Mohalla:[
            {
                name:"B",
                Society:[
                    {
                        name:"C",
                        Bhumi:[{
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
                        Bhumi:[{
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
            name:"H",
            price:1500000
        }
    ]

    let fas=[
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

    let Roa=[
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

    // Sampti
    app.post("/sampti",(req,res)=>{
        // const sak=req.body.sak;
        const rakba=req.body.rakba;
        const ward=req.body.ward;
        const Mohala=req.body.Mohala;
        const Society=req.body.Society;
        const Bhumi=req.body.Bhumi;
        const HBhumi=req.body.HBhumi;
        const Fasal=req.body.Fasal;
        const Road=req.body.Road;
        let warr=[];
        let Harr=[];
        for(let i=0;i<ward.length;i++){
            if(ward[i]=="Nan"){
                warr.push(0);
            }
            else{
                for(let j=0;j<obj.length;j++){
                    if(ward[i]==obj[j].name){
                        for(let k=0;k<obj[j].Mohalla.length;k++){
                            if(Mohala[i]==obj[j].Mohalla[k].name){
                                for(let m=0;m<obj[j].Mohalla[k].Society.length;m++){
                                    if(Society[i]==obj[j].Mohalla[k].Society[m].name){
                                        for(let k1=0;k1<obj[j].Mohalla[k].Society[m].Bhumi.length;k1++){
                                            if(Bhumi[i]==obj[j].Mohalla[k].Society[m].Bhumi[k1].name){
                                                 warr.push(obj[j].Mohalla[k].Society[m].Bhumi[k1].price);
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
        for(let i=0;i<HBhumi.length;i++){
            if(HBhumi[i]=="Nan"){
                Harr.push(0);
            }
            else{
                let to=0;
                let t=0;
                for(let j=0;j<obj1.length;j++){
                    if(HBhumi[i]==obj1[j].name){
                        t=obj1[j].price*(rakba[i]/10120);
                        to=obj1[j].price*(rakba[i]/10120);
                    }
                }
                for(let j=0;j<fas.length;j++){
                    if(Fasal[i]==fas[j].name){
                        to=to+(t*fas[j].per)/100;
                    }
                }
                for(let j=0;j<Roa.length;j++){
                    if(Road[i]==Roa[j].name){
                        to=to+(t*Roa[j].per)/100;
                    }
                }
                Harr.push(to);
            }
        }

        let div=[];
        for(let i=0;i<warr.length;i++){
            if(warr[i]!=0){
                let fl=0;
                for(let j=0;j<div.length;j++){
                    if(div[j].val==warr[i]){
                        fl=1;
                        div[j].mul=Number(div[j].mul)+Number(rakba[i]);
                        break;
                    }
                }
                if(fl==0){
                    div.push({
                        val:warr[i],
                        mul:Number(rakba[i])
                    })
                }
            }
        }
        let Total_amount=0;
        for(let i=0;i<Harr.length;i++){
            Total_amount=Total_amount+Harr[i];
        }
        for(let i=0;i<div.length;i++){
            if(div[i].mul<=506){
                Total_amount=Total_amount+(div[i].val*div[i].mul);
            }
            else if(div[i].mul<=1012){
                Total_amount=Total_amount+(div[i].val*(div[i].mul-506)*0.8)+(div[i].val*506);
            }
            else{
                Total_amount=Total_amount+(div[i].val*506*1.8)+(div[i].val*(div[i].mul-1012)*0.5);
            }
        }
        console.log(warr)
        console.log(Harr)
        console.log(div)
        console.log(Total_amount)

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

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
      
            // Uploads is the Upload_folder_name
            cb(null, "uploads")
        },
        filename: function (req, file, cb) {
          cb(null, file.fieldname + "-" + Date.now()+".pdf")
        }
      })
      const maxSize = 1 * 10000 * 10000;

      var upload = multer({ 
        storage: storage,
        limits: { fileSize: maxSize },
        fileFilter: function (req, file, cb){
        
            // Set the filetypes, it is optional
            var filetypes = /pdf/;
            var mimetype = filetypes.test(file.mimetype);
      
            var extname = filetypes.test(path.extname(
                        file.originalname).toLowerCase());
            
            if (mimetype && extname) {
                return cb(null, true);
            }
          
            cb("Error: File upload only supports the "
                    + "following filetypes - " + filetypes);
          } 
      
    // mypic is the name of file attribute
    }).single("file");    
    

    app.post("/admin/important",(req,res)=>{
        const name=req.body.name;
        Imp.findOne({name:name}).then(async(found)=>{
            if(found){
                Important_valid=1
                res.redirect("/admin/important")
            }
            else{
                upload(req,res, async(err)=>{
                    if(err){
                        console.log(err);
                    }
                    else{
                        const imp=new Imp({
                            name:name,
                            path:req.body.file
                        })
                        await imp.save().then(()=>{
                            res.redirect("/admin/important")
                        })
                    }
                })
            }
        })
    })

    app.get("/admin/important/list",(req,res)=>{
        Imp.find().then((found)=>{
            res.render("admin_important_list",{parray:found})
        })
    })

    app.get("/admin/:name/imp/delete",(req,res)=>{
        Imp.deleteOne({name:req.params.name}).then(()=>{
            res.redirect("/admin/important/list")
        })
    })

app.listen(3002,(req,res)=>{
    console.log("Server started at port 3000")
})
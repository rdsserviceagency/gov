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
                let jila = await EJilaModel.findOne({ name: Jila });
    
                if (!jila) {
                    // Create a new Condition1 document if it doesn't exist
                    jila = new EJilaModel({
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
                                                                        Price:HectorPrice
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
                                                                        Price:HectorPrice
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
                                                                    Price:HectorPrice
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
                                                                Price:HectorPrice
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
                                                            Price:HectorPrice
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
                                                        Price:HectorPrice
                                                    }
                                                ]
                                            }
                                        );
                                    }
                                    else{
                                        if(CityType!==City.cityType){
                                            City.cityType=CityType;
                                        }
                                        console.log(HectorPrice)
                                        if(HectorPrice!="-1"){
                                            console.log(HectorPrice)
                                            let hectorBhumi = City.hector.find(cond6 => cond6.name === HectorBhumi);
                                            if (!hectorBhumi) {
                                                // Create a new Condition3 within the existing Condition2
                                                City.hector.push(
                                                    {
                                                        name:HectorBhumi,
                                                        Price:HectorPrice
                                                    }
                                                );
                                            }
                                            else{
                                                hectorBhumi.Price=HectorPrice
                                            }
                                        }
                                        if(Wardprice!="-1"){
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
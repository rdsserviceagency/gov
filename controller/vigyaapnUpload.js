const VigyaapnSchema = require("../models/Vigyaapn");

async function vigyaapnUpload(req, res) {
    const { deed, type, villageName, price, landType, description,address } = req.body;
    let bhk = "";
    let houseType = "N/A";
    let area = "";

    if (landType === "House") {
        bhk = req.body.bhk;
        houseType = req.body.houseType;
    } else if (landType === "Plot") {
        area = req.body.area;
    }

    // Add document to database and return success or error message
    const newVigyaapn = new VigyaapnSchema({
        deed,
        type,
        villageName,
        price,
        landType,
        description,
        address,
        bhk,
        houseType,
        area
    });

    // Now when adding, if added successfully, return success message, else return error message using promises
    newVigyaapn
        .save()
        .then(() => {
            res.status(201).json({ success: "Registration successful" });
        })
        .catch((err) => {
            console.log(err)
            res.status(400).json({ error: "User already exists" });
        });
}

module.exports = vigyaapnUpload;

const DastavejUser = require("../models/DastavejUser");

async function dastavejUpdate(req, res){
    const { id, phone, upi, mapLink, address } = req.body;
    console.log({id, phone, upi, address, mapLink});
    //first find user by id and then update
    const user = await DastavejUser.findOne({ _id: id }).exec();
    if(!user){
        res.status(400).json({error: "User does not exist"});
        return;
    }
    user.phone = phone;
    user.upi = upi;
    user.mapLink = mapLink;
    user.address = address;
    await user.save();
    
    res.status(200).json({message: "User updated successfully"});
}

module.exports = dastavejUpdate;
const jilaModel = require('../models/JilaModel');

async function sampatiVivran(req, res){
    const jilaData = await jilaModel.find();
    res.render('sampatiVivran', {jilaData});
}

module.exports = sampatiVivran;

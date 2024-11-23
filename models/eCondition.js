const mongoose = require('mongoose');


const ECondition3Schema = new mongoose.Schema({
    name: String,
    output: String,
    remark: String,
});

const ECondition2Schema = new mongoose.Schema({
    name: String,
    condition3: [ECondition3Schema],
});

const EConditionSchema = new mongoose.Schema({
    name: String,
    condition2: [ECondition2Schema],
});


const ECondition1Model = mongoose.model('ECondition', EConditionSchema);

module.exports = ECondition1Model;
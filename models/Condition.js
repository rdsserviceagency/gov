const mongoose = require('mongoose');


const Condition3Schema = new mongoose.Schema({
    name: String,
    output: String,
    remark: String,
});

const Condition2Schema = new mongoose.Schema({
    name: String,
    condition3: [Condition3Schema],
});

const ConditionSchema = new mongoose.Schema({
    name: String,
    condition2: [Condition2Schema],
});


const Condition1Model = mongoose.model('Condition', ConditionSchema);

module.exports = Condition1Model;
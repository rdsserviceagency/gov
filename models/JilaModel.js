const mongoose = require('mongoose');


const bhumiSchema = new mongoose.Schema({
    name: String,
    Price: {
        type: Number,
        default: -1
    }
});


const societySchema = new mongoose.Schema({
    name: {
        type: String,
        default:"n"
    },
    Bhumi: [bhumiSchema],
});

const mohallaSchema = new mongoose.Schema({
    name: {
        type: String,
        default:"n"
    },
    Society: [societySchema],
});

const wardSchema = new mongoose.Schema({
    name: {
        type: String,
        default:"n"
    },
    mohalla: [mohallaSchema],
});






const hectorSchema = new mongoose.Schema({
    name: String,
    Price: {
        type: Number,
        default: -1
    }
});


const citySchema = new mongoose.Schema({
    name: String,
    cityType: String,
    ward:[wardSchema],
    hector:[hectorSchema]
});

const gaoSchema = new mongoose.Schema({
    name: String,
    city: [citySchema],
});

const patwariSchema = new mongoose.Schema({
    name: String,
    Gao: [gaoSchema],
});

const rajivSchema = new mongoose.Schema({
    name: String,
    Patwari: [patwariSchema],
});

const thesilSchema = new mongoose.Schema({
    name: String,
    Rajiv: [rajivSchema],
});

const jilaSchema = new mongoose.Schema({
    name: String,
    Thesil: [thesilSchema],
});

const JilaModel = mongoose.model('Jila', jilaSchema);

module.exports = JilaModel;

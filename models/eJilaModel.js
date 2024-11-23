const mongoose = require('mongoose');


const EbhumiSchema = new mongoose.Schema({
    name: String,
    Price: {
        type: Number,
        default: -1
    }
});


const EsocietySchema = new mongoose.Schema({
    name: {
        type: String,
        default:"n"
    },
    Bhumi: [EbhumiSchema],
});

const EmohallaSchema = new mongoose.Schema({
    name: {
        type: String,
        default:"n"
    },
    Society: [EsocietySchema],
});

const EwardSchema = new mongoose.Schema({
    name: {
        type: String,
        default:"n"
    },
    mohalla: [EmohallaSchema],
});






const EhectorSchema = new mongoose.Schema({
    name: String,
    Price: {
        type: String,
    }
});


const EcitySchema = new mongoose.Schema({
    name: String,
    cityType: String,
    ward:[EwardSchema],
    hector:[EhectorSchema]
});

const EgaoSchema = new mongoose.Schema({
    name: String,
    city: [EcitySchema],
});

const EpatwariSchema = new mongoose.Schema({
    name: String,
    Gao: [EgaoSchema],
});

const ErajivSchema = new mongoose.Schema({
    name: String,
    Patwari: [EpatwariSchema],
});

const EthesilSchema = new mongoose.Schema({
    name: String,
    Rajiv: [ErajivSchema],
});

const EjilaSchema = new mongoose.Schema({
    name: String,
    Thesil: [EthesilSchema],
});

const EJilaModel = mongoose.model('EJila', EjilaSchema);

module.exports = EJilaModel;

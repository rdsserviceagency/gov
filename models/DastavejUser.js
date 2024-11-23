const mongoose = require("mongoose");

const DastavejUser = new mongoose.Schema({
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    profession: {
        type: String,
        enum: ["दस्तावेज लेखक", "स्टाम्प वेंडर", "अधिवक्ता", "जमीन पर्च"],
        required: true,
    },
    upi: {
        type: String,
        default: "",
    },
    panjayan: {
        type: String,
        default: "",
    },
    lincense: {
        type: String,
        default: "",
    },
    Jila: {
        type: String,
        default: "",
    },
    Office: {
        type: String,
        default: "",
    },
    mapLink: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
});

const Registration = mongoose.model("DatstavejUser", DastavejUser);

module.exports = Registration;

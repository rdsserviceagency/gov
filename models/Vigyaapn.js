const mongoose = require('mongoose');

// Create a Mongoose schema for the property
const vigyapnSchema = new mongoose.Schema({
    deed: { type: String, required: true, enum: ['Buy', 'Sell'] },
    type: { type: String, required: true, enum: ['Rent', 'Purchase'] },
    villageName: { type: String, required: true },
    landType: { type: String, required: true, enum: ['Plot', 'House'] },
    price: { type: Number, required: true },
    area: {
        type: Number,
        required: function () {
            return this.landType === 'Plot'; // Required only for landType 'Plot'
        }
    },
    bhk: {
        type: Number,
        required: function () {
            return this.landType === 'House'; // Required only for landType 'House'
        }
    },
    houseType: {
        type: String,
        enum: ['Fully furnished', 'Semi furnished', 'Unfurnished', 'N/A'],
        required: function () {
            return this.landType === 'House'; // Required only for landType 'House'
        }
    },
    address: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
});

// Create a Mongoose model for the property schema
const Vigyapn = mongoose.model('vigyaapn', vigyapnSchema);

module.exports = Vigyapn;
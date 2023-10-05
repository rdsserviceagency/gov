const mongoose = require('mongoose');

// Create a Mongoose schema for the property
const DocumentSchema = new mongoose.Schema({
    adhaar: {
        type: String,
        required: true,
    },
    adhaarImage: {
        type: String,
        required: true,
    },
    pan: {
        type: String,
        required: true,
    },
    panImage: { 
        type: String,
        required: true,
    },
});

// Create a Mongoose model for the property schema
const Document = mongoose.model('document', DocumentSchema);

module.exports = Document;
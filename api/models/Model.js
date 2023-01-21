const mongoose = require('mongoose')

const ModelSchema = new mongoose.Schema({
    model: {
        type: String,
    }
})

module.exports = mongoose.model("Model", ModelSchema)
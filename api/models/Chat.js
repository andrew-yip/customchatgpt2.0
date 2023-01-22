const mongoose = require('mongoose')

const ChatSchema = new mongoose.Schema({
    messages: {
        type: Array
    },
    model: {
        type: String,
    },
    id: {
        type: String,
    }
})

module.exports = mongoose.model("Chat", ChatSchema)
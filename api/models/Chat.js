const mongoose = require('mongoose')

const ChatSchema = new mongoose.Schema({
    messages: {
        type: Array
    },
    model: {
        type: String,
    },

    // need to configure unique id
    id: {
        type: String,
    }
})

module.exports = mongoose.model("Chat", ChatSchema)
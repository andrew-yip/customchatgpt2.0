const { Configuration, OpenAIApi } = require("openai");

//const dotenv = require('dotenv')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

require('dotenv').config()

// mongodb
const mongoose = require('mongoose');
const moment = require('moment');
mongoose.connect(process.env.MONGO_URL, () => console.log('Database is successfully connected.'))

// Chat schema
const Chat = require('./models/Chat')

// create a simple express api that calls the function above
const app = express()
const PORT = 3080 // server port - 3000 is typically used for react

// use body parser and cors
app.use(bodyParser.json())
app.use(cors())

const configuration = new Configuration({
    organization: process.env.OPENAI_ORGANIZATION,
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// whenever you send a message
app.post('/', async (req, res) => {
    const { message, users, currentModel } = req.body;
    try {
        const response = await openai.createCompletion({
            model: `${currentModel}`,
            prompt: `${message}`,
            max_tokens: 100,
            temperature: 0.5,
        })

        // return to client
        res.json({
            message: response.data.choices[0].text,
        })

        // Pass messages and currentModel to MongoDB
        let messageToDatabase = message.split("\n")
        let userToDatabase = users.split("\n")
        let combinedArray = messageToDatabase.map((elem, index) => userToDatabase[index] + ": " + elem)


        console.log("Users array: ", users)
        console.log("combined array: ", combinedArray)

        let fromOpenAi = response.data.choices[0].text.replace('\n', '')
        console.log("from open ai: ", fromOpenAi)


        combinedArray.forEach(async (item) => {
            let message = item.split(':')
            let user = message[0]
            let messageText = message[1]
            let timestamp = moment().format();

            // STORE IN MONGO DB
            try {
                const chat = await Chat.create({ user: user || "gpt", message: messageText, response: fromOpenAi, timestamp: timestamp, model: currentModel });
                console.log("Chat message put into MongoDB: ", chat);
            } catch (error) {
                if (error.code === 11000) {
                    console.log("Duplicate key error, chat already exists in the collection");
                } else if (error.name === 'MongoError' && error.code === 16755) {
                    console.log("Operation timed out, try increasing the timeout limit");
                } else {
                    console.log("Error: ", error.message);
                }
            }
        })
    } catch (error) {
        console.log(error)
        throw error
    }

})

app.get('/models', async (req, res) => {
    const response = await openai.listEngines();
    console.log("response data: ", response.data.data)
    res.json({
        models: response.data.data
    })
});

// GET
app.get('/chats/:id', async (req, res) => {
    try {

        // get the id from params then from mongoDB and tries to find it in the collection
        const chat = await Chat.findById(req.params.id);

        // if no chat is found
        if (!chat) return res.status(404).json({ message: 'Chat not found' });
        return res.json(chat);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// PUT
app.put('/chats/:id', async (req, res) => {
    try {
        const { message, response, model } = req.body;

        // get the id from params then from mongoDB and tries to find it in the collection
        const chat = await Chat.findByIdAndUpdate(req.params.id, { $set: { message, response, model } }, { new: true });

        // if no chat is found
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }
        res.json(chat);
    } catch (error) {
        res.status(500).json(error.message);
    }
});

// DELETE
app.delete('/chats/:id', async (req, res) => {
    try {
        const id = req.params.id;

        // get the id from params then from mongoDB and tries to find it in the collection
        const result = await Chat.deleteOne({ _id: id });

        // if there is no chats to delete
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Chat not found' });
        }
        res.json({ message: 'Chat deleted successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error deleting chat' });
    }
});


app.listen(PORT, () => {
    console.log(`App is listening at http://localhost:${PORT}`)
})

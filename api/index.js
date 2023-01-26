const { Configuration, OpenAIApi } = require("openai");
import { v4 as uuid } from 'uuid';

//const dotenv = require('dotenv')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

require('dotenv').config()

// mongodb
const mongoose = require('mongoose');
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
            model: `${currentModel}`, // "text-davinci-003",
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

        let fromOpenAi = response.data.choices[0].text.replace('\n', '')
        console.log("from open ai: ", fromOpenAi)

        combinedArray.push("gpt: ", fromOpenAi)
        console.log("combined array: ", combinedArray)

        // STORE IN MONGO DB
        try {
            const chat = await Chat.create({ messages: combinedArray, model: currentModel })
            return res.status(201).json(chat)
        } catch (error) {
            console.log("ERROR: ", error.message)
            //return res.status(500).json(error.message)
        }
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

// see if user id exists and add to existing array
app.get('/:id', async (req, res) => {
    const { id } = req.params.id;

})

app.put('/:id', async (req, res) => {
    const { id } = req.params.id;
})

app.delete('/:id', async (req, res) => {
    const { id } = req.params.id;

})

app.listen(PORT, () => {
    console.log(`App is listening at http://localhost:${PORT}`)
})

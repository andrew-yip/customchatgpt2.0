const { Configuration, OpenAIApi } = require("openai");

//const dotenv = require('dotenv')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

require('dotenv').config()

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

app.post('/', async (req, res) => {
    const { message } = req.body;
    console.log("message: ", message)
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `${message}`,
        max_tokens: 100,
        temperature: 0.5,
    });
    res.json({
        message: response.data.choices[0].text,
    })
})

app.listen(PORT, () => {
    console.log(`App is listening at http://localhost:${PORT}`)
})

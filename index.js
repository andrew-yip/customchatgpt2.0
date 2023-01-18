const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    organization: process.env.OPENAI_ORGANIZATION,
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const dotenv = require('dotenv')
const express = require('express')

dotenv.config()

// create a simple express api that calls the function above
const app = express()
const PORT = 3000 // server port - 3000 is typically used for react

app.post('/', async (req, res) => {
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: "Say this is a test",
        max_tokens: 7,
        temperature: 0,
    });
    console.log(response.data.choices[0].text)
    res.json({
        data: response.data
    })
})

app.listen(PORT, () => {
    console.log(`App is listening at http://localhost:${PORT}`)
})

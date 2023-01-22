import './App.css';
import './normal.css'
// import setState
import { useState, useEffect } from 'react'
import ChatMessage from './components/ChatMessage';

function App() {

  // use effect run once when app loads
  useEffect(() => {
    getEngines()
  }, [])


  // add state for input and chat log
  const [input, setInput] = useState("")
  const [models, setModels] = useState([])
  const [currentModel, setCurrentModel] = useState("babbage")
  const [chatLog, setChatLog] = useState([{ user: "gpt", message: "How can I help you today? " }, { user: "Me", message: "I want to use chatgpt today." }])

  // clear chats
  function clearChat() {
    setChatLog([])
  }

  function getEngines() {
    fetch("http://localhost:3080/models")
      .then(res => res.json())
      .then(data => {
        console.log(data.models)
        setModels(data.models)
      })
  }

  async function handleSubmit(e) {
    e.preventDefault();
    let chatLogNew = [...chatLog, { user: "Me", message: `${input}` }]// spread operator and adding input to chat log
    setInput("") // setting input to blank
    setChatLog(chatLogNew)

    // fetch response to the api combining the chat log
    // array of messages and sending it as a message to localhost:3000 as a POST
    // LISTENING ON PORT 3080

    const messages = chatLogNew.map((message) => message.message).join("\n") // looping through messages after setting and joining together
    const users = chatLogNew.map((user) => user.user).join("\n")
    //console.log(users)

    const response = await fetch("http://localhost:3080/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: messages,
        users: users,
        currentModel,
      })
    });

    const data = await response.json();
    setChatLog([...chatLogNew, { user: "gpt", message: `${data.message}` }])
    // console.log(data.message);

  }

  return (
    <div className="App">

      {/* sidemenu */}
      <aside className="sidemenu">
        <div className="side-menu-button" onClick={clearChat}>
          <span>+</span>
          New Chat
        </div>

        {/* models */}
        <div className="models">
          <select className="models-dropdown" onChange={(e) => {
            setCurrentModel(e.target.value)
          }}>
            {models.map((model, index) => (
              <option key={model.id} value={model.id}>
                {model.id}
              </option>
            ))}
          </select>
        </div>

      </aside>

      {/* chatbox */}
      <section className="chatbox">
        <div className="chat-log">
          {chatLog.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
        </div>
        {/* chat input box */}
        <div className="chat-input-holder">
          <form onSubmit={handleSubmit}>
            <input className="chat-input-textarea" rows="1" value={input} onChange={(e) => setInput(e.target.value)}>
            </input>
          </form>
        </div>
      </section>

    </div>
  );
}

export default App;

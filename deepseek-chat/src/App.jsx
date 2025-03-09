import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiMenu } from "react-icons/fi";
import Ram2 from "./assets/ram2.webp";
import "./App.css";

function App() {
  const [userInput, setUserInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [isThrown, setIsThrown] = useState(false);
  const [history, setHistory] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("english");

  const sendToGroq = async () => {
    if (!userInput) {
      alert("Please enter some text!");
      return;
    }

    setIsLoading(true);
    setShowResponse(true);
    setIsThrown(true);
    setHistory((prevHistory) => [userInput, ...prevHistory]); // Store query in history
    setUserInput(""); // Clear input immediately after sending

    setTimeout(() => setIsThrown(false), 1000); // Reset arrow animation

    try {
      const apiUrl = "https://api.groq.com/openai/v1/chat/completions";
      const apiKey = "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";

      if (!apiKey) {
        throw new Error("API key not configured. Please set REACT_APP_GROQ_API_KEY in your environment.");
      }

      const languageInstruction = selectedLanguage === "english" 
        ? "Respond in English." 
        : selectedLanguage === "hindi" 
        ? "Respond in Hindi." 
        : "Respond in Marathi.";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            { role: "system", content: `You are a helpful AI assistant that provides accurate and concise information. ${languageInstruction}` },
            { role: "user", content: userInput }
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      setResponse(data.choices[0].message.content);
    } catch (error) {
      console.error("Error calling Groq API:", error);
      setResponse(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendToGroq();
    }
  };

  const changeLanguage = (language) => {
    setSelectedLanguage(language);
  };

  return (
    <div
      className="bodydiv"
      style={{
        backgroundImage: `url(${Ram2})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
      }}
    >
      <div className="hamburger-menu">
        <FiMenu className="menu-icon" onClick={() => setIsMenuOpen(!isMenuOpen)} />
        {isMenuOpen && (
          <div className="sidebar">
            <h2>Search History</h2>
            <ul>
              {history.map((query, index) => (
                <li key={index} onClick={() => setUserInput(query)}>
                  {query}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="App">
        <h1>India's AI</h1>
        
        <details className="language-selector">
          <summary>Select Language: {selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)}</summary>
          <div className="language-options">
            <div 
              className={`language-option ${selectedLanguage === "english" ? "selected" : ""}`} 
              onClick={() => changeLanguage("english")}
            >
              English
            </div>
            <div 
              className={`language-option ${selectedLanguage === "hindi" ? "selected" : ""}`} 
              onClick={() => changeLanguage("hindi")}
            >
              Hindi
            </div>
            <div 
              className={`language-option ${selectedLanguage === "marathi" ? "selected" : ""}`} 
              onClick={() => changeLanguage("marathi")}
            >
              Marathi
            </div>
          </div>
        </details>
        
        <div className="input-container">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            disabled={isLoading}
          />
          <button onClick={sendToGroq} disabled={isLoading}>
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>

        {isThrown && (
          <motion.div
            initial={{ x: -3, y: -80, opacity: 1 }}
            animate={{ x: 400, y: -700, opacity: 0.4 }}
            transition={{ duration: 3, ease: "easeOut" }}
            className="arrow"
          >
            <div id="arrrow">➜</div>
          </motion.div>
        )}

        {showResponse && (
          <div className="response">
            <p>
              <strong>Response:</strong>
            </p>
            {isLoading ? <p>Loading response...</p> : <p className="response-content">{response}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
// Predefined files and codes for the college submission Python/Flask portfolio project

export interface ProjectFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export const PROJECT_FILES: ProjectFile[] = [
  {
    name: "chatbot.py",
    path: "chatbot.py",
    language: "python",
    description: "Core NLP processing file containing string normalizing and keyword/regex intent detection.",
    content: `import re
import json
import random
from datetime import datetime

# Rule-based intent patterns and keywords
INTENT_PATTERNS = {
    "greeting": {
        "keywords": ["hi", "hello", "hey", "greetings", "wassup", "sup"],
        "regex": r"\\b(hi|hello|hey|greetings|yoo?|sup|wassup|hola)\\b"
    },
    "goodbye": {
        "keywords": ["bye", "goodbye", "see you", "farewell", "quit", "exit"],
        "regex": r"\\b(bye|goodbye|see you|farewell|gtg|tc|leave|exit|quit)\\b"
    },
    "thanks": {
        "keywords": ["thanks", "thank you", "ty", "appreciate it", "thankful"],
        "regex": r"\\b(thanks?|thank you|ty|appreciated)\\b"
    },
    "time": {
        "keywords": ["time", "current clock", "what hour", "time please"],
        "regex": r"\\b(time|clock|hour|minutes)\\b"
    },
    "date": {
        "keywords": ["date", "today", "day", "month", "year"],
        "regex": r"\\b(date|today|day|month|year)\\b"
    },
    "name": {
        "keywords": ["name", "who are you", "your identity", "call you"],
        "regex": r"\\b(name|who are you|who you are|identity|call you)\\b"
    },
    "help": {
        "keywords": ["help", "commands", "options", "support", "what can you do"],
        "regex": r"\\b(help|commands?|options|support|can you do|features)\\b"
    },
    "weather": {
        "keywords": ["weather", "temp", "temperature", "forecast", "rain", "sunny", "climate"],
        "regex": r"\\b(weather|temp(erature)?|forecast|rain|sunny|cloudy|climate)\\b"
    },
    "education": {
        "keywords": ["btech", "engineering", "college", "study", "degree", "computer science"],
        "regex": r"\\b(btech|engineering|college|study|degree|cse|science|undergrad)\\b"
    },
    "motivation": {
        "keywords": ["motivate", "motivation", "tired", "sad", "depressed", "inspire", "inspiration", "low"],
        "regex": r"\\b(motivate|motivation|tired|sad|depressed|inspire|inspiration|low|exhausted|unmotivated)\\b"
    },
    "joke": {
        "keywords": ["joke", "funny", "laugh", "tell me a joke"],
        "regex": r"\\b(joke|funny|laugh|humor|comedy)\\b"
    }
}

def preprocess_text(text):
    """
    NLP Preprocessing:
    - Lowercase matching
    - Removes punctuation
    - Removes extra spaces/whitespaces
    """
    if not text:
        return ""
    # Convert to lowercase
    text = text.lower()
    # Remove punctuation using clean regex representation
    text = re.sub(r'[^\\w\\s]', '', text)
    # Remove extra spaces/tabs
    text = re.sub(r'\\s+', ' ', text).strip()
    return text

def detect_intent(text):
    """
    Detects intent of user input using keyword matching or regular expressions.
    """
    processed = preprocess_text(text)
    if not processed:
        return "unknown"
    
    # Priority 1: Match regular expressions for specific exact word groups
    for intent, patterns in INTENT_PATTERNS.items():
        if re.search(patterns["regex"], processed):
            return intent
            
    # Priority 2: Fall back to keyword inclusion within the preprocessed input
    for intent, patterns in INTENT_PATTERNS.items():
        for keyword in patterns["keywords"]:
            if keyword in processed:
                return intent
                
    return "unknown"

def generate_response(intent, intents_file_path="intents.json"):
    """
    Generates a response corresponding to the detected intent.
    - Resolves dates/time inquiries dynamically.
    - Pulls responses randomly from intents.json file.
    """
    # Dynamic logic for time & date queries
    if intent == "time":
        now = datetime.now()
        return f"The current system time is: {now.strftime('%I:%M %p')}."
    elif intent == "date":
        now = datetime.now()
        return f"Today is {now.strftime('%A, %B %d, %Y')}."

    # Load predefined json rules file
    try:
        with open(intents_file_path, "r") as f:
            intents_data = json.load(f)
    except Exception:
        # Fallback values if intents.json is not found
        intents_data = {
            "greeting": {"responses": ["Hello! How can I help you today?"]},
            "goodbye": {"responses": ["Goodbye! Have a great day."]},
            "thanks": {"responses": ["You're welcome!"]},
            "name": {"responses": ["I am SmartRuleBot."]},
            "help": {"responses": ["Type greetings, jokes, dates, times or educational queries."]},
            "weather": {"responses": ["Weather API is not connected yet."]},
            "education": {"responses": ["BTech is a professional engineering degree."]},
            "motivation": {"responses": ["Keep on going, you are doing awesome!"]},
            "joke": {"responses": ["Why did the database go on a diet? It had too many bytes!"]}
        }
    
    responses = intents_data.get(intent, {}).get("responses", [])
    if responses:
        return random.choice(responses)
        
    # Default fallback response
    fallback_responses = intents_data.get("unknown", {}).get(
        "responses", 
        ["Sorry, I didn't understand that. Can you rephrase?"]
    )
    return random.choice(fallback_responses)

def save_history(history_data, filename="chat_history.json"):
    """
    Saves the chat log array to a local storage JSON file for auditing.
    """
    try:
        with open(filename, "w") as f:
            json.dump(history_data, f, indent=4)
        return True
    except Exception:
        return False

def load_history(filename="chat_history.json"):
    """
    Loads historic chat conversation transcripts safely.
    """
    try:
        with open(filename, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []
    except Exception:
        return []
`
  },
  {
    name: "app.py",
    path: "app.py",
    language: "python",
    description: "Main Flask backend pipeline mapping HTTP requests to backend operations.",
    content: `import os
from flask import Flask, render_template, request, jsonify
from chatbot import detect_intent, generate_response, load_history, save_history

app = Flask(__name__)

@app.route("/")
def home():
    """
    Renders the web client HTML interface.
    """
    return render_template("index.html")

@app.route("/api/chat", methods=["POST"])
@app.route("/chat", methods=["POST"])
def chat():
    """
    Endpoint for receiving conversational messages.
    Payload: { "message": "user speech" }
    Sends back JSON containing the chatbot's preprocessed logs and reply.
    """
    data = request.get_json() or {}
    user_message = data.get("message", "").strip()
    
    if not user_message:
        return jsonify({
            "response": "Please enter a valid message.",
            "intent": "unknown",
            "processed": ""
        }), 400

    # Execute NLP pipeline
    intent = detect_intent(user_message)
    response_text = generate_response(intent)

    # Record logs in history
    history = load_history()
    new_entry = {
        "timestamp": os.getenv("CURRENT_TIME", "2026-06-08 12:53:07"),
        "user": user_message,
        "bot": response_text,
        "intent_detected": intent
    }
    history.append(new_entry)
    save_history(history)

    # Return structured JSON to client
    return jsonify({
        "response": response_text,
        "intent": intent,
        "processed_message": user_message.lower() # basic preprocessing summary for debug
    })

@app.route("/api/history", methods=["GET"])
def history():
    """
    Returns stored chat sessions.
    """
    return jsonify(load_history())

@app.route("/api/clear", methods=["POST"])
def clear_history():
    """
    Wipes the saved conversations off the local disk.
    """
    save_history([])
    return jsonify({"success": True})

if __name__ == "__main__":
    # Start web server
    app.run(host="0.0.0.0", port=5000, debug=True)
`
  },
  {
    name: "intents.json",
    path: "intents.json",
    language: "json",
    description: "Declarative JSON database detailing response strings corresponding to triggers.",
    content: `{
  "greeting": {
    "responses": [
      "Hello! How can I help you today?",
      "Hi there! Nice to meet you.",
      "Greetings! What can I do for you today?"
    ]
  },
  "goodbye": {
    "responses": [
      "Goodbye! Have a great day.",
      "See you again. Take care!",
      "Farewell! Feel free to chat anytime."
    ]
  },
  "thanks": {
    "responses": [
      "You're welcome!",
      "Happy to help.",
      "Anytime! Let me know if you need anything else."
    ]
  },
  "time": {
    "responses": []
  },
  "date": {
    "responses": []
  },
  "name": {
    "responses": [
      "I am SmartRuleBot, your virtual educational assistant.",
      "You can call me SmartRuleBot. I process queries using rule-based NLP!"
    ]
  },
  "help": {
    "responses": [
      "I can help you with multiple queries! Try asking about: greeting, goodbye, thanks, time, date, name, help, weather, BTech / engineering, motivation, or jokes!"
    ]
  },
  "weather": {
    "responses": [
      "Weather API is not connected yet."
    ]
  },
  "education": {
    "responses": [
      "BTech (Bachelor of Technology) is a professional undergraduate engineering degree. Engineering is the dynamic application of science, mathematics, and logic to build creative solutions for real-world problems."
    ]
  },
  "motivation": {
    "responses": [
      "Believe you can and you're halfway there! - Theodore Roosevelt",
      "The only way to do great work is to love what you do. - Steve Jobs",
      "Don't worry if it doesn't work right. If everything did, you'd be out of a job. - Mosher's Law",
      "Focus on being productive instead of busy. Keep moving forward!"
    ]
  },
  "joke": {
    "responses": [
      "Why do programmers wear glasses? Because they don't C#!",
      "How many programmers does it take to change a lightbulb? None, that is a hardware issue!",
      "Why did the developer go broke? Because they cleaned out all their cache!"
    ]
  },
  "unknown": {
    "responses": [
      "Sorry, I didn't understand that.",
      "Can you rephrase your question?",
      "I couldn't match that to any of my predefined processing rules. Try typing 'help' to see what I can do!"
    ]
  }
}`
  },
  {
    name: "requirements.txt",
    path: "requirements.txt",
    language: "text",
    description: "Standard packages manifest loaded during pip installations.",
    content: `Flask==3.0.2
Werkzeug==3.0.1
jinja2==3.1.3
click==8.1.7
itsdangerous==2.1.2
MarkupSafe==2.1.5`
  },
  {
    name: "style.css",
    path: "static/style.css",
    language: "css",
    description: "Responsive styling file with dark/light variables configuration.",
    content: `/* SmartRuleBot Custom Stylesheet */
:root {
    --bg-primary: #f9fafb;
    --bg-secondary: #ffffff;
    --sidebar-bg: #111827;
    --sidebar-text: #f3f4f6;
    --text-primary: #111827;
    --text-secondary: #4b5563;
    --border-color: #e5e7eb;
    --accent-color: #2563eb;
    --accent-hover: #1d4ed8;
    --chat-bubble-user: #2563eb;
    --chat-bubble-user-text: #ffffff;
    --chat-bubble-bot: #f3f4f6;
    --chat-bubble-bot-text: #1f2937;
    --status-indicator: #10b981;
}

[data-theme="dark"] {
    --bg-primary: #1f2937;
    --bg-secondary: #111827;
    --sidebar-bg: #030712;
    --sidebar-text: #e5e7eb;
    --text-primary: #f9fafb;
    --text-secondary: #9ca3af;
    --border-color: #374151;
    --chat-bubble-user: #3b82f6;
    --chat-bubble-user-text: #ffffff;
    --chat-bubble-bot: #374151;
    --chat-bubble-bot-text: #f3f4f6;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    transition: background-color 0.3s ease, color 0.3s ease;
}

body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    height: 100vh;
    display: flex;
    overflow: hidden;
}

/* App Container Layout */
.app-container {
    display: flex;
    width: 100%;
    height: 100vh;
}

/* Sidebar Styling */
.sidebar {
    width: 300px;
    background-color: var(--sidebar-bg);
    color: var(--sidebar-text);
    display: flex;
    flex-direction: column;
    padding: 24px;
    border-right: 1px solid var(--border-color);
    z-index: 10;
}

.sidebar-title {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--sidebar-text);
}

.sidebar-subtitle {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
    margin-top: 16px;
    margin-bottom: 8px;
    font-weight: 600;
}

.stats-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
}

.stats-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
}

.stats-row:last-child {
    margin-bottom: 0;
}

.stats-val {
    font-weight: 600;
    color: var(--accent-color);
}

.sidebar-btn {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    border: none;
    background: rgba(255, 255, 255, 0.08);
    color: var(--sidebar-text);
    font-weight: 500;
    cursor: pointer;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    text-align: center;
}

.sidebar-btn:hover {
    background: rgba(255, 255, 255, 0.15);
}

.btn-danger {
    background: #ef4444 !important;
    color: white !important;
}

.btn-danger:hover {
    background: #dc2626 !important;
}

/* Theme Toggle Slider */
.theme-switch-container {
    margin-top: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 16px;
    border-top: 1px solid #374151;
}

/* Chat Screen Main Area */
.chat-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: var(--bg-primary);
    position: relative;
}

/* Header Styling */
.header {
    background-color: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
}

.bot-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.bot-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: var(--accent-color);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 18px;
}

.bot-text-details h1 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
}

.presence {
    font-size: 12px;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 5px;
}

.presence::before {
    content: "";
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--status-indicator);
}

/* Chat Dialog Window */
.chat-window {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
    scroll-behavior: smooth;
}

/* Chat Bubbles */
.message-wrapper {
    display: flex;
    width: 100%;
}

.user-message {
    justify-content: flex-end;
}

.bot-message {
    justify-content: flex-start;
}

.bubble {
    max-width: 70%;
    padding: 12px 18px;
    border-radius: 18px;
    font-size: 15px;
    line-height: 1.5;
    position: relative;
    word-break: break-word;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.user-message .bubble {
    background-color: var(--chat-bubble-user);
    color: var(--chat-bubble-user-text);
    border-bottom-right-radius: 4px;
}

.bot-message .bubble {
    background-color: var(--chat-bubble-bot);
    color: var(--chat-bubble-bot-text);
    border-bottom-left-radius: 4px;
}

.time-stamp {
    font-size: 10px;
    opacity: 0.6;
    margin-top: 4px;
    display: block;
    text-align: right;
}

/* Custom Telemetry Box under bot messages for Rule Inspection */
.telemetry {
    font-size: 11px;
    font-family: 'JetBrains Mono', Courier, monospace;
    background: rgba(0,0,0,0.07);
    color: var(--text-secondary);
    padding: 4px 8px;
    border-radius: 4px;
    margin-top: 6px;
    display: block;
}

[data-theme="dark"] .telemetry {
    background: rgba(255,255,255,0.08);
}

/* Typing Indicator Animation */
.typing-bubble {
    display: none;
    align-items: center;
    gap: 4px;
    padding: 12px 18px;
    border-radius: 18px;
    background-color: var(--chat-bubble-bot);
    color: var(--text-secondary);
    width: fit-content;
}

.dot {
    width: 6px;
    height: 6px;
    background: var(--text-secondary);
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1.0); }
}

/* Input Form Tray */
.input-tray {
    padding: 16px 24px;
    background-color: var(--bg-secondary);
    border-top: 1px solid var(--border-color);
    display: flex;
    gap: 12px;
}

.message-input {
    flex: 1;
    border-radius: 24px;
    border: 1px solid var(--border-color);
    background-color: var(--bg-primary);
    color: var(--text-primary);
    padding: 12px 20px;
    font-size: 15px;
    outline: none;
}

.message-input:focus {
    border-color: var(--accent-color);
}

.send-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: none;
    background-color: var(--accent-color);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 18px;
    outline: none;
}

.send-btn:hover {
    background-color: var(--accent-hover);
}

/* RESPONSIVE LAYOUT */
@media (max-width: 768px) {
    .sidebar {
        display: none; /* Hide sidebar on mobile */
    }
    
    body {
        flex-direction: column;
    }
}
`
  },
  {
    name: "script.js",
    path: "static/script.js",
    language: "javascript",
    description: "Core client interactions, UI renders, counters processing, and downloads script.",
    content: `// SmartRuleBot JavaScript Interface
document.addEventListener("DOMContentLoaded", () => {
    const chatWindow = document.getElementById("chat-window");
    const messageInput = document.getElementById("message-input");
    const sendBtn = document.getElementById("send-btn");
    const typingIndicator = document.getElementById("typing-indicator");
    const clearBtn = document.getElementById("clear-btn");
    const exportBtn = document.getElementById("export-btn");
    const themeToggle = document.getElementById("theme-toggle");
    const totalMessagesVal = document.getElementById("total-messages-val");
    const userMessagesVal = document.getElementById("user-messages-val");
    const botMessagesVal = document.getElementById("bot-messages-val");

    let totalCount = 0;
    let userCount = 0;
    let botCount = 0;
    let chatLog = [];

    // Auto scroll chat list
    function scrollToBottom() {
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // Format local time
    function getFormattedTime() {
        const d = new Date();
        let hours = d.getHours();
        const minutes = d.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; 
        return \`\${hours}:\${minutes} \${ampm}\`;
    }

    // Update Sidebar Analytics counters
    function updateCounterStyles() {
        totalMessagesVal.innerText = totalCount;
        userMessagesVal.innerText = userCount;
        botMessagesVal.innerText = botCount;
    }

    // Render new balloon message
    function appendMessage(sender, text, telemetry_info = null) {
        const wrapper = document.createElement("div");
        wrapper.className = \`message-wrapper \${sender === 'user' ? 'user-message' : 'bot-message'}\`;

        const bubble = document.createElement("div");
        bubble.className = "bubble";
        
        const textNode = document.createElement("span");
        textNode.innerText = text;
        bubble.appendChild(textNode);

        // Append timestamp
        const timeBox = document.createElement("span");
        timeBox.className = "time-stamp";
        timeBox.innerText = getFormattedTime();
        bubble.appendChild(timeBox);

        // Add telemetry debug stats if specified (helps showcase rules matching!)
        if (telemetry_info) {
            const tel = document.createElement("div");
            tel.className = "telemetry";
            tel.innerText = \`Matched: Rule[\${telemetry_info}]\`;
            bubble.appendChild(tel);
        }

        wrapper.appendChild(bubble);
        chatWindow.appendChild(wrapper);
        scrollToBottom();

        // Increment Statistics
        totalCount++;
        if (sender === 'user') {
            userCount++;
        } else {
            botCount++;
        }
        updateCounterStyles();

        // Record log
        chatLog.push({
            sender: sender,
            text: text,
            timestamp: new Date().toISOString(),
            rule_matched: telemetry_info || "N/A"
        });
    }

    // Call server API endpoints
    async function sendMessageToAPI(raw_message) {
        // Show Typing Indicator
        typingIndicator.style.display = "flex";
        scrollToBottom();

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: raw_message })
            });

            const data = await res.json();
            
            // Artificial delay to feel natural
            setTimeout(() => {
                typingIndicator.style.display = "none";
                if (res.ok) {
                    appendMessage("bot", data.response, data.intent);
                } else {
                    appendMessage("bot", "Oops, something went wrong.");
                }
            }, 750);

        } catch (err) {
            console.error("Fetch error:", err);
            setTimeout(() => {
                typingIndicator.style.display = "none";
                appendMessage("bot", "Communication failure with Flask Backend. Ensure app.py server is running!");
            }, 750);
        }
    }

    // Submit Action handlers
    function handleSend() {
        const val = messageInput.value.trim();
        if (!val) return;

        appendMessage("user", val);
        messageInput.value = "";
        sendMessageToAPI(val);
    }

    sendBtn.addEventListener("click", handleSend);
    messageInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            handleSend();
        }
    });

    // Sidebar clear operation
    clearBtn.addEventListener("click", async () => {
        if (confirm("Clear your conversation transcripts?")) {
            chatWindow.querySelectorAll(".message-wrapper").forEach(el => el.remove());
            totalCount = 0;
            userCount = 0;
            botCount = 0;
            updateCounterStyles();
            chatLog = [];
            
            try {
                await fetch("/api/clear", { method: "POST" });
            } catch (e) {
                console.warn(e);
            }
            
            appendMessage("bot", "Workspace state cleared. How can I assist you now?");
        }
    });

    // Sidebar text file downloading structure
    exportBtn.addEventListener("click", () => {
        if (chatLog.length === 0) {
            alert("Nothing to export! Send some messages first.");
            return;
        }

        let outputText = "=== SmartRuleBot Conversation Exports ===\\n";
        outputText += \`Date Raised: \${new Date().toLocaleString()}\\n\`;
        outputText += "=========================================\\n\\n";

        chatLog.forEach((item) => {
            outputText += \`[\${item.timestamp}] [\${item.sender.toUpperCase()}]: \${item.text}\\n\`;
            if (item.rule_matched && item.rule_matched !== "N/A") {
                outputText += \`  └─ (Developer Rule Info: Matched key '\${item.rule_matched}')\\n\`;
            }
            outputText += "\\n";
        });

        const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = \`SmartRuleBot_Session_\${Date.now()}.txt\`;
        link.click();
    });

    // Dark Mode Toggle
    themeToggle.addEventListener("click", () => {
        const cur = document.documentElement.getAttribute("data-theme");
        if (cur === "dark") {
            document.documentElement.removeAttribute("data-theme");
            themeToggle.innerText = "Dark Mode Toggle";
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
            themeToggle.innerText = "Light Mode Toggle";
        }
    });

    // On startup: load previous chat transcripts
    async function init() {
        try {
            const res = await fetch("/api/history");
            if (res.ok) {
                const logs = await res.json();
                if (logs && logs.length > 0) {
                    logs.forEach(log => {
                        appendMessage("user", log.user);
                        appendMessage("bot", log.bot, log.intent_detected);
                    });
                } else {
                    appendMessage("bot", "Hello! I am SmartRuleBot. Type 'help' to see my preprocessing configurations!");
                }
            } else {
                appendMessage("bot", "Hello! I am SmartRuleBot. Type 'help' to see my preprocessing configurations!");
            }
        } catch (e) {
            appendMessage("bot", "Welcome to SmartRuleBot! I am initialized and ready to demonstrate NLP rule matching.");
        }
    }

    init();
});`
  },
  {
    name: "index.html",
    path: "templates/index.html",
    language: "html",
    description: "Main Flask Jinja template setting up structure and binding dependencies.",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SmartRuleBot - Intelligent Rule-Based Chatbot</title>
    <!-- Inter Font and JetBrains Mono -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap">
    <link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
</head>
<body>
    <div class="app-container">
        <!-- Sidebar Navigation & Statistics Section -->
        <aside class="sidebar">
            <h2 class="sidebar-title">
                <span style="font-size: 24px;">🤖</span> SmartRuleBot
            </h2>
            
            <p style="font-size: 13px; color: #9ca3af; margin-bottom: 20px; line-height: 1.5;">
                An intelligent rule-based agent built using native python string matching, standard expressions (regex), and NLP preprocessing pipelines.
            </p>

            <div class="sidebar-subtitle">Analytics Statistics</div>
            <div class="stats-card">
                <div class="stats-row">
                    <span>Total Triggers</span>
                    <span id="total-messages-val" class="stats-val">0</span>
                </div>
                <div class="stats-row">
                    <span>User Entries</span>
                    <span id="user-messages-val" class="stats-val">0</span>
                </div>
                <div class="stats-row">
                    <span>Bot Queries</span>
                    <span id="bot-messages-val" class="stats-val">0</span>
                </div>
            </div>

            <div class="sidebar-subtitle">Control Panel</div>
            <button id="clear-btn" class="sidebar-btn btn-danger">🗑️ Clear Chat History</button>
            <button id="export-btn" class="sidebar-btn">💾 Export Chat Transcript</button>
            <button id="theme-toggle" class="sidebar-btn">🌓 Dark Mode Toggle</button>

            <!-- Copyright footer -->
            <div style="margin-top: auto; font-size: 11px; color: #4b5563; text-align: center;">
                Academic Mini-Project Submission
            </div>
        </aside>

        <!-- Main Chat Panel Section -->
        <main class="chat-area">
            <!-- App Header Title and Status Indicator -->
            <header class="header">
                <div class="bot-info">
                    <div class="bot-avatar">SR</div>
                    <div class="bot-text-details">
                        <h1>SmartRuleBot v1.0.0</h1>
                        <span class="presence">Active System</span>
                    </div>
                </div>
                <div style="font-size: 13px; color: var(--text-secondary); filter: grayscale(1);">
                    NLP Pattern Matching Enabled
                </div>
            </header>

            <!-- Chat Message log list -->
            <div id="chat-window" class="chat-window">
                <!-- Message structures are generated here programmatically -->
                
                <!-- Typing bubble model -->
                <div id="typing-indicator" class="typing-bubble">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span style="font-size: 12px; margin-left: 6px;">Bot is analyzing...</span>
                </div>
            </div>

            <!-- Chat Box Input Bar Container -->
            <div class="input-tray">
                <input type="text" id="message-input" class="message-input" placeholder="Type a message (e.g. 'What can you do?' 'BTech explained', etc.)" autofocus autocomplete="off">
                <button id="send-btn" class="send-btn">➔</button>
            </div>
        </main>
    </div>

    <!-- Main Controller Scripts -->
    <script src="{{ url_for('static', filename='script.js') }}"></script>
</body>
</html>`
  },
  {
    name: "README.md",
    path: "README.md",
    language: "markdown",
    description: "In-depth project documentation covering setup, structures, metrics, and architecture.",
    content: `# SmartRuleBot – Rule-Based Intelligent Chatbot

SmartRuleBot is an academic-ready, production-quality, lightweight intelligent chatbot that matches user input against predefined syntactic rules and pattern mapping pipelines. It processes natural language inputs without external AI dependencies or machine learning overhead, making it a perfect college project submission, portfolio demonstration, or technical resume showcase.

---

## 🎨 Visual Identity & Key Features

*   **ChatGPT-Inspired Layout**: Ultra-clean professional design centered around readability, visual rhythm, and generous negative space.
*   **Intuitive Sideline Controls**: Real-time message counters (Total triggers, Users queries, Bot processing rates), session exporters, memory-wipes, and seamless light/dark mode triggers.
*   **NLP Text Preprocessing Pipeline**: Live sanitization of punctuation, redundant spacing, and character capitalization before applying match algorithms.
*   **Dynamic Response Engines**: Seamless, real-time calculations of Dates & Times embedded dynamically in string reply patterns.
*   **Live Pattern Telemetry**: In-app indicator detailing exactly which intent keyword or regex mapped to the triggered response.
*   **Typing Animations**: Realistic pacing using staggered asynchronous typing indicators.

---

## 🏗️ Applied NLP Matching Architecture

\`\`\`
   [User Input] (e.g. "Hey, what is BTech?")
        │
        ▼ 
[Text Preprocessing]
  ├── Case folding (.lower())
  ├── Punctuation removal (Regex: [^\\w\\s])
  └── Whitespace stripping (\\s+ -> " ")
        │
        ▼
[Intent Analysis Engine]
  ├── Match Level 1: Regular Expressions (Regex Word-boundary mappings)
  └── Match Level 2: Word-Inclusion Keyword Scanners
        │
        ▼
[Dynamic Response Generation]
  ├── Dynamic variables (e.g., date/time evaluations)
  └── Standard selections (Random selections from rules/intents dictionary)
        │
        ▼
  [Bot Response]
\`\`\`

---

## 📂 Repository File Directory

\`\`\`
SmartRuleBot/
│
├── app.py                # Main Flask web server exposing /chat & /api/history
├── chatbot.py            # Preprocessing, intent matcher, and chat log persistence functions
├── intents.json          # Predefined JSON database containing intent groups & arrays of responses
├── requirements.txt      # Standard Python package dependencies list
│
├── static/
│   ├── style.css         # Responsive CSS stylesheet with dynamic variables (themes)
│   └── script.js         # Client communication hub, file exporter, and event triggers
│
├── templates/
│   └── index.html        # Clean structural web markup
│
└── README.md             # Detailed documentation walkthrough
\`\`\`

---

## 🚀 Quickstart and Setup Guide

### 1. Prerequisites
Make sure you have **Python 3.8+** installed locally on your system.

### 2. Dependency Sourcing
Clone or download the project files into a standalone directory, then run the terminal command:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

### 3. Running the Server
Execute the application runner:
\`\`\`bash
python app.py
\`\`\`

After startup, open [http://localhost:5000](http://localhost:5000) using your browser to interact with the system live!

---

## 🔮 Future Architecture Upgrades
1.  **Semantic Clustering (TF-IDF)**: Replace simple keyword inclusions with frequency vectors for higher tolerance on typographical errors.
2.  **External Integrations**: Connect weather dashboards to open weather service protocols instead of dummy placeholders.
3.  **Active SQL Backends**: Port JSON flat-file directories to sqlite3 databases for complex audit histories.
4.  **Sentiment Mapping**: Categorize responses dynamically corresponding to user voice indicators (sad/angry inputs trigger deeper empathetic phrasing).
`
  }
];

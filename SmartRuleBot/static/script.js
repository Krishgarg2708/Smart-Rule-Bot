// SmartRuleBot JavaScript Interface
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
        hours = hours ? hours : 12; // the hour '0' should be '12'
        return `${hours}:${minutes} ${ampm}`;
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
        wrapper.className = `message-wrapper ${sender === 'user' ? 'user-message' : 'bot-message'}`;

        const bubble = document.createElement("div");
        bubble.className = "bubble";
        
        // Handle newline matching
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
            tel.innerText = `Matched: Rule[${telemetry_info}]`;
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
            
            // Artificial delay to feel natural + showcase the typing loader
            setTimeout(() => {
                typingIndicator.style.display = "none";
                if (res.ok) {
                    appendMessage("bot", data.response, data.intent);
                } else {
                    appendMessage("bot", "Oops, something went wrong on our end.");
                }
            }, 750);

        } catch (err) {
            console.error("Fetch error:", err);
            setTimeout(() => {
                typingIndicator.style.display = "none";
                appendMessage("bot", "Communication failure with the Flask Backend. Ensure app.py server is configured and running!");
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
        if (confirm("Are you sure you want to clear your conversation transcript?")) {
            chatWindow.querySelectorAll(".message-wrapper").forEach(el => el.remove());
            totalCount = 0;
            userCount = 0;
            botCount = 0;
            updateCounterStyles();
            chatLog = [];
            
            // Call server wipe endpoints
            try {
                await fetch("/api/clear", { method: "POST" });
            } catch (e) {
                console.warn("Could not wipe server logs: ", e);
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

        let outputText = "=== SmartRuleBot Conversation Exports ===\n";
        outputText += `Date Raised: ${new Date().toLocaleString()}\n`;
        outputText += "=========================================\n\n";

        chatLog.forEach((item, index) => {
            outputText += `[${item.timestamp}] [${item.sender.toUpperCase()}]: ${item.text}\n`;
            if (item.rule_matched && item.rule_matched !== "N/A") {
                outputText += `  └─ (Developer Rule Info: Matched key '${item.rule_matched}')\n`;
            }
            outputText += "\n";
        });

        const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `SmartRuleBot_Session_${Date.now()}.txt`;
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

    // On startup: load previous chat transcripts from Flask server if available
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
                    // Send introductory message if timeline is fresh
                    appendMessage("bot", "Hello! I am SmartRuleBot. Type 'help' to see my preprocessing configurations!");
                }
            } else {
                appendMessage("bot", "Hello! I am SmartRuleBot. Type 'help' to see my preprocessing configurations!");
            }
        } catch (e) {
            // Frontend fallback greeting if backend is offline or during build sandbox initialization
            appendMessage("bot", "Welcome to SmartRuleBot! I am initialized and ready to demonstrate NLP rule matching.");
        }
    }

    init();
});

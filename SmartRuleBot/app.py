import os
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

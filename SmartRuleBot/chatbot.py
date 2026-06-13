import re
import json
import random
from datetime import datetime

# Rule-based intent patterns and keywords
INTENT_PATTERNS = {
    "greeting": {
        "keywords": ["hi", "hello", "hey", "greetings", "wassup", "sup"],
        "regex": r"\b(hi|hello|hey|greetings|yoo?|sup|wassup|hola)\b"
    },
    "goodbye": {
        "keywords": ["bye", "goodbye", "see you", "farewell", "quit", "exit"],
        "regex": r"\b(bye|goodbye|see you|farewell|gtg|tc|leave|exit|quit)\b"
    },
    "thanks": {
        "keywords": ["thanks", "thank you", "ty", "appreciate it", "thankful"],
        "regex": r"\b(thanks?|thank you|ty|appreciated)\b"
    },
    "time": {
        "keywords": ["time", "current clock", "what hour", "time please"],
        "regex": r"\b(time|clock|hour|minutes)\b"
    },
    "date": {
        "keywords": ["date", "today", "day", "month", "year"],
        "regex": r"\b(date|today|day|month|year)\b"
    },
    "name": {
        "keywords": ["name", "who are you", "your identity", "call you"],
        "regex": r"\b(name|who are you|who you are|identity|call you)\b"
    },
    "help": {
        "keywords": ["help", "commands", "options", "support", "what can you do"],
        "regex": r"\b(help|commands?|options|support|can you do|features)\b"
    },
    "weather": {
        "keywords": ["weather", "temp", "temperature", "forecast", "rain", "sunny", "climate"],
        "regex": r"\b(weather|temp(erature)?|forecast|rain|sunny|cloudy|climate)\b"
    },
    "education": {
        "keywords": ["btech", "engineering", "college", "study", "degree", "computer science"],
        "regex": r"\b(btech|engineering|college|study|degree|cse|science|undergrade)\b"
    },
    "motivation": {
        "keywords": ["motivate", "motivation", "tired", "sad", "depressed", "inspire", "inspiration", "low"],
        "regex": r"\b(motivate|motivation|tired|sad|depressed|inspire|inspiration|low|exhausted|unmotivated)\b"
    },
    "joke": {
        "keywords": ["joke", "funny", "laugh", "tell me a joke"],
        "regex": r"\b(joke|funny|laugh|humor|comedy)\b"
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
    text = re.sub(r'[^\w\s]', '', text)
    # Remove extra spaces/tabs
    text = re.sub(r'\s+', ' ', text).strip()
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
            "help": {"responses": ["Type greetings, joke, date, time or educational queries."]},
            "weather": {"responses": ["Weather API is not connected yet."]},
            "education": {"responses": ["BTech is a professional engineering degree."]},
            "motivation": {"responses": ["Keep on going, you are doing awesome!"]},
            "joke": {"responses": ["Why dot-nets eat bugs? (A old joke)"]}
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

# SmartRuleBot

A lightweight, rule-based intelligent chatbot built with Flask and vanilla JavaScript. Processes natural language through a deterministic two-pass NLP pipeline — no external AI dependencies, no machine learning overhead.

---

## What it does

SmartRuleBot accepts a user message, runs it through a preprocessing pipeline, then attempts to match it against a predefined intent corpus using two sequential strategies: regular expression boundary matching, then keyword inclusion scanning. Every response includes a telemetry trace indicating which pipeline stage fired and which pattern triggered the match.

---

## Project structure

```
SmartRuleBot/
│
├── app.py                 # Flask web server — exposes /chat and /api/history endpoints
├── chatbot.py             # Preprocessing, intent matcher, and session log persistence
├── intents.json           # Intent corpus — pattern arrays, keyword lists, response pools
├── requirements.txt       # Python dependencies
│
├── static/
│   ├── style.css          # Responsive stylesheet with CSS custom properties for theming
│   └── script.js          # Client-side message handler, pipeline animator, session exporter
│
├── templates/
│   └── index.html         # Base HTML markup
│
└── README.md
```

---

## Setup

**Requirements:** Python 3.8 or later.

**1. Install dependencies**

```bash
pip install -r requirements.txt
```

**2. Start the server**

```bash
python app.py
```

**3. Open the interface**

Navigate to [http://localhost:5000](http://localhost:5000) in your browser.

---

## NLP pipeline

Every user message passes through the following stages before a response is selected:

```
[User Input]
     │
     ▼
[Preprocessing]
  ├── Case folding          →  .lower()
  ├── Punctuation removal   →  re.sub(r'[^\w\s]', ' ', text)
  └── Whitespace strip      →  re.sub(r'\s+', ' ', text).strip()
     │
     ▼
[Pass 1 — Regex Matching]
  └── Word-boundary pattern test against each intent's patterns list
     │
     ▼ (if no match)
[Pass 2 — Keyword Scanning]
  └── Substring inclusion check against each intent's keywords list
     │
     ▼ (if no match)
[Fallback Response]
  └── Random selection from global fallback pool
     │
     ▼
[Response Generation]
  ├── Dynamic evaluation    →  date / time strings resolved at runtime
  └── Static selection      →  random.choice() from matched intent's responses list
```

The matched stage (`regex`, `keyword`, or `fallback`) and the triggering pattern are returned alongside the response and surfaced in the UI as a telemetry trace.

---

## Intent schema

Intents are defined in `intents.json` as an array of objects. Each object follows this structure:

```json
{
  "id": "greeting",
  "patterns": ["\\b(hello|hi|hey|howdy|greetings)\\b"],
  "keywords": ["hello", "hi", "hey", "howdy", "greetings"],
  "responses": [
    "Hello. Input received and processed. How can I assist you today?",
    "Hi there. Preprocessing complete. Ready for your query."
  ]
}
```

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique intent identifier used in telemetry and session logs |
| `patterns` | string[] | Regex patterns tested in Pass 1. Use `\\b` word boundaries for precision |
| `keywords` | string[] | Substring tokens tested in Pass 2 if all patterns fail |
| `responses` | string[] | Response pool — one entry selected randomly per match |

**Dynamic responses** are triggered by placing a sentinel string in the responses array:

| Sentinel | Output |
|---|---|
| `"dynamic:time"` | Current local time, resolved at response generation |
| `"dynamic:date"` | Current local date with day-of-year, resolved at response generation |

---

## Supported intents

| Intent | Match strategy | Example triggers |
|---|---|---|
| `greeting` | Regex | "hello", "hey", "hi there" |
| `time` | Regex | "what time is it", "current time" |
| `date` | Regex | "what is today's date", "what day is it" |
| `name` | Regex | "who are you", "what is your name" |
| `creator` | Regex | "who made you", "who built you" |
| `help` | Regex | "help", "what can you do", "commands" |
| `joke` | Keyword | "tell me a joke", "say something funny" |
| `weather` | Regex | "weather", "forecast", "temperature" |
| `mood` | Regex | "how are you", "are you okay" |
| `bye` | Regex | "goodbye", "exit", "see you later" |
| `thanks` | Keyword | "thank you", "thanks", "cheers" |
| `math` | Regex | "calculate", "what is 5 plus 3" |
| `motivate` | Keyword | "motivate me", "I feel sad", "cheer me up" |
| `btech` | Regex | "what is BTech", "CSE", "engineering degree" |

---

## API reference

### POST `/chat`

Accepts a user message and returns a bot response with telemetry metadata.

**Request body**

```json
{
  "message": "what time is it"
}
```

**Response**

```json
{
  "response": "Current time: 14:32:07\n\nTimezone: Asia/Kolkata",
  "intent": "time",
  "stage": "regex",
  "pattern": "time",
  "preprocessed": "what time is it"
}
```

### GET `/api/history`

Returns the full session log as a JSON array.

```json
[
  { "role": "user", "text": "what time is it", "time": "2026-06-14T14:32:06Z" },
  { "role": "bot", "text": "Current time: 14:32:07...", "intent": "time", "stage": "regex", "time": "2026-06-14T14:32:07Z" }
]
```

---

## UI features

**Sidebar telemetry panel**
Live counters update after each exchange: total triggers, user queries, regex matches, keyword matches, fallbacks, and computed match rate percentage.

**Pipeline animation**
Before each bot reply, the four pipeline stages (`preprocess → regex → keyword → generate`) animate sequentially, visualizing the architecture in real time.

**Per-response telemetry trace**
Each bot message displays the matched stage and triggering pattern directly below the response bubble.

**Session export**
Downloads the full conversation as a plaintext `.txt` file with timestamps, intent IDs, match stages, and matched patterns.

**Memory wipe**
Clears all session state, resets all counters, and fires a system telemetry confirmation message.

---

## Adding a new intent

1. Open `intents.json`.
2. Append a new object following the schema above.
3. Write at least one regex pattern (for Pass 1) and two or more keyword tokens (for Pass 2).
4. Add a minimum of two response strings to avoid repeated outputs.
5. Restart the Flask server — no other changes required.

---

## Dependencies

```
flask>=2.3.0
```

Listed in `requirements.txt`. No ML libraries, no NLP frameworks, no external API calls required for core operation.

---

## Planned upgrades

**TF-IDF semantic layer** — Replace keyword substring checks with term-frequency vectors for higher tolerance on typographical errors and paraphrased inputs.

**OpenWeather integration** — Connect the `weather` intent to the OpenWeather REST API, replacing the current static placeholder response.

**SQLite session persistence** — Port the in-memory session log to a `sqlite3` database for durable audit history across server restarts.

**Sentiment-aware response selection** — Detect negative sentiment signals in input (sad, angry, frustrated) and bias response selection toward empathetic variants within the matched intent pool.

---

## License

MIT. Free to use, modify, and distribute.

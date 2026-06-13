# SmartRuleBot

SmartRuleBot is a hybrid intelligent chatbot that combines a rule-based Natural Language Processing (NLP) engine with Google's Gemini AI. The application first attempts to answer user queries using predefined intents and pattern matching. If no suitable intent is found, it seamlessly switches to Gemini AI to generate an intelligent response.

The project demonstrates how traditional rule-based NLP and modern Large Language Models (LLMs) can work together to create a fast, efficient, and scalable conversational assistant.

---

## Features

- Hybrid chatbot architecture
- Rule-based intent detection
- Regular expression and keyword matching
- Automatic fallback to Google Gemini AI
- Real-time chat interface
- Chat history support
- Light and dark theme
- Typing animation
- Intent detection insights
- Responsive user interface
- Built with React, TypeScript, Express, and Vite

---

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- CSS
- Motion

### Backend

- Node.js
- Express.js

### AI Integration

- Google Gemini API
- @google/genai SDK

### NLP Techniques

- Intent Classification
- Regex Pattern Matching
- Keyword Matching
- Text Preprocessing
- Rule-Based Response Generation

---

## Project Structure

```
SmartRuleBot/
│
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── utils/
│   │   └── nlp.ts
│   └── data/
│       └── projectFiles.ts
│
├── server.ts
├── package.json
├── vite.config.ts
├── .env.example
└── README.md
```

---

## How It Works

1. The user submits a message.
2. The input is cleaned and normalized.
3. The NLP engine checks the message against predefined intents.
4. If a matching rule is found, an instant local response is returned.
5. If no rule matches, the request is forwarded to Google Gemini AI.
6. The generated response is displayed in the chat interface.

---

## Architecture

```
                 User Message
                      │
                      ▼
          Text Preprocessing Layer
                      │
                      ▼
          Rule-Based Intent Engine
        (Regex + Keyword Matching)
                      │
          ┌───────────┴───────────┐
          │                       │
     Intent Found            No Match
          │                       │
          ▼                       ▼
  Local Response Engine     Google Gemini AI
          │                       │
          └───────────┬───────────┘
                      ▼
               Chat Response
```

---

## Installation

### Clone the repository

```bash
git clone https://github.com/yourusername/SmartRuleBot.git

cd SmartRuleBot
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env` file in the project root.

```env
GEMINI_API_KEY=YOUR_API_KEY
```

Get your API key from Google AI Studio.

### Run the development server

```bash
npm run dev
```

The application will be available at:

```
http://localhost:3000
```

---

## Available Scripts

```bash
npm run dev
```

Starts the development server.

```bash
npm run build
```

Builds the project for production.

```bash
npm run start
```

Runs the production build.

```bash
npm run lint
```

Checks the project for TypeScript errors.

---

## Future Enhancements

- Voice-based interaction
- Conversation memory
- User authentication
- Multi-language support
- File upload support
- Streaming AI responses
- Database integration
- Conversation export
- RAG (Retrieval-Augmented Generation)
- Admin dashboard

---

## Learning Outcomes

This project demonstrates practical knowledge of:

- Rule-Based NLP
- Intent Classification
- Regular Expressions
- Google Gemini API Integration
- React Development
- Express.js
- TypeScript
- REST APIs
- Prompt Engineering
- Hybrid AI Applications

---

## Author

**Krish Garg**

B.Tech Student | Frontend Developer | AI Enthusiast

Portfolio: https://portfolio-website-gxe6.vercel.app/

LinkedIn: https://www.linkedin.com/in/krish-garg-047649330/

---

## License

This project is licensed under the MIT License.

// TypeScript Translation of SmartRuleBot Python NLP matching logic

export interface IntentRule {
  id: string;
  name: string;
  keywords: string[];
  regex: RegExp;
  regexString: string;
  responses: string[];
  description: string;
}

export const INTENT_RULES: Record<string, IntentRule> = {
  greeting: {
    id: "greeting",
    name: "greetings",
    keywords: ["hi", "hello", "hey", "greetings", "wassup", "sup", "hola"],
    regex: /\b(hi|hello|hey|greetings|yoo?|sup|wassup|hola)\b/i,
    regexString: "\\b(hi|hello|hey|greetings|yoo?|sup|wassup|hola)\\b",
    responses: [
      "Hello! How can I help you today?",
      "Hi there! Nice to meet you.",
      "Greetings! What can I do for you today?"
    ],
    description: "Triggers on basic salutations and initial interaction intents."
  },
  goodbye: {
    id: "goodbye",
    name: "goodbyes",
    keywords: ["bye", "goodbye", "see you", "farewell", "quit", "exit", "leave", "tg", "tc"],
    regex: /\b(bye|goodbye|see you|farewell|gtg|tc|leave|exit|quit)\b/i,
    regexString: "\\b(bye|goodbye|see you|farewell|gtg|tc|leave|exit|quit)\\b",
    responses: [
      "Goodbye! Have a great day.",
      "See you again. Take care!",
      "Farewell! Feel free to chat anytime."
    ],
    description: "Triggers on departure wishes and workspace closing expressions."
  },
  thanks: {
    id: "thanks",
    name: "thankfulness",
    keywords: ["thanks", "thank you", "ty", "appreciate it", "thankful", "appreciated"],
    regex: /\b(thanks?|thank you|ty|appreciated)\b/i,
    regexString: "\\b(thanks?|thank you|ty|appreciated)\\b",
    responses: [
      "You're welcome!",
      "Happy to help.",
      "Anytime! Let me know if you need anything else."
    ],
    description: "Recognizes words of appreciation and thankfulness."
  },
  time: {
    id: "time",
    name: "current time",
    keywords: ["time", "current clock", "what hour", "time please", "minutes", "seconds"],
    regex: /\b(time|clock|hour|minutes|seconds)\b/i,
    regexString: "\\b(time|clock|hour|minutes|seconds)\\b",
    responses: [], // Handled dynamically in matcher
    description: "Responds with the current active system time."
  },
  date: {
    id: "date",
    name: "today's date",
    keywords: ["date", "today", "day", "month", "year"],
    regex: /\b(date|today|day|month|year)\b/i,
    regexString: "\\b(date|today|day|month|year)\\b",
    responses: [], // Handled dynamically in matcher
    description: "Fetches and displays the current calendar day details."
  },
  name: {
    id: "name",
    name: "bot identity",
    keywords: ["name", "who are you", "your identity", "call you"],
    regex: /\b(name|who are you|who you are|identity|call you)\b/i,
    regexString: "\\b(name|who are you|who you are|identity|call you)\\b",
    responses: [
      "I am SmartRuleBot, your virtual educational assistant.",
      "You can call me SmartRuleBot. I process queries using rule-based NLP!"
    ],
    description: "Explains who the conversational agent is."
  },
  help: {
    id: "help",
    name: "help request",
    keywords: ["help", "commands", "options", "support", "what can you do", "features", "instructions"],
    regex: /\b(help|commands?|options|support|can you do|features|instructions)\b/i,
    regexString: "\\b(help|commands?|options|support|can you do|features|instructions)\\b",
    responses: [
      "I can assist you with multiple pre-configured queries! Try asking about: greeting, goodbye, thanks, time, date, my identity, help, weather, study/college explained, motivation lines, or code jokes!"
    ],
    description: "Lists supported queries and capabilities."
  },
  weather: {
    id: "weather",
    name: "weather status",
    keywords: ["weather", "temp", "temperature", "forecast", "rain", "sunny", "climate", "hot", "cold"],
    regex: /\b(weather|temp(erature)?|forecast|rain|sunny|cloudy|climate|hot|cold)\b/i,
    regexString: "\\b(weather|temp(erature)?|forecast|rain|sunny|cloudy|climate|hot|cold)\\b",
    responses: [
      "Weather API is not connected yet. (Demonstration of dummy endpoint handler)."
    ],
    description: "Returns educational fallback info mapping to missing system integrations."
  },
  education: {
    id: "education",
    name: "educational queries",
    keywords: ["btech", "engineering", "college", "study", "degree", "computer science", "cse"],
    regex: /\b(btech|engineering|college|study|degree|cse|science|undergrad)\b/i,
    regexString: "\\b(btech|engineering|college|study|degree|cse|science|undergrad)\\b",
    responses: [
      "BTech (Bachelor of Technology) is a professional undergraduate engineering degree. Engineering is the dynamic application of science, mathematics, and logic to build creative solutions for real-world problems."
    ],
    description: "Furnishes standard responses answering syllabus or college engineering questions."
  },
  motivation: {
    id: "motivation",
    name: "motivational boost",
    keywords: ["motivate", "motivation", "tired", "sad", "depressed", "inspire", "inspiration", "low", "exhausted", "unmotivated"],
    regex: /\b(motivate|motivation|tired|sad|depressed|inspire|inspiration|low|exhausted|unmotivated)\b/i,
    regexString: "\\b(motivate|motivation|tired|sad|depressed|inspire|inspiration|low|exhausted|unmotivated)\\b",
    responses: [
      "Believe you can and you're halfway there! - Theodore Roosevelt",
      "The only way to do great work is to love what you do. - Steve Jobs",
      "Don't worry if it doesn't work right. If everything did, you'd be out of a job. - Mosher's Law",
      "Focus on being productive instead of busy. Keep moving forward!"
    ],
    description: "Outputs randomized encouraging thoughts and motivational philosophy."
  },
  joke: {
    id: "joke",
    name: "programmer jokes",
    keywords: ["joke", "funny", "laugh", "tell me a joke", "comedy", "humor"],
    regex: /\b(joke|funny|laugh|humor|comedy)\b/i,
    regexString: "\\b(joke|funny|laugh|humor|comedy)\\b",
    responses: [
      "Why do programmers wear glasses? Because they don't C#!",
      "How many programmers does it take to change a lightbulb? None, that is a hardware issue!",
      "Why did the developer go broke? Because they cleaned out all their cache!"
    ],
    description: "Returns randomized humorous coding-themed punchlines."
  },
  unknown: {
    id: "unknown",
    name: "unknown input fallback",
    keywords: [],
    regex: /$./i,
    regexString: "None",
    responses: [
      "Sorry, I didn't understand that.",
      "Can you rephrase your question?",
      "I couldn't match that to any of my predefined processing rules. Try typing 'help' to see what I can do!"
    ],
    description: "The default fallback action when no syntax pattern or keywords match."
  }
};

/**
 * Normalizes input text according to strict NLP rule guidelines
 */
export function preprocessText(text: string): {
  original: string;
  lowercased: string;
  punctuationRemoved: string;
  whitespaceCleaned: string;
} {
  const original = text;
  const lowercased = text.toLowerCase();
  // Remove standard punctuations
  const punctuationRemoved = lowercased.replace(/[^\w\s]/g, "");
  // Replace spacing clusters with clean singles
  const whitespaceCleaned = punctuationRemoved.replace(/\s+/g, " ").trim();

  return {
    original,
    lowercased,
    punctuationRemoved,
    whitespaceCleaned
  };
}

export interface MatchResult {
  intent: string;
  matchedBy: "regex" | "keyword" | "fallback";
  matchedPattern: string;
  processedText: string;
  rawInput: string;
}

/**
 * Evaluates the clean processed text against keyword matrices and RegEx boundaries
 */
export function detectIntent(text: string): MatchResult {
  const pre = preprocessText(text);
  const processed = pre.whitespaceCleaned;

  if (!processed) {
    return {
      intent: "unknown",
      matchedBy: "fallback",
      matchedPattern: "Empty preprocessed content",
      processedText: "",
      rawInput: text
    };
  }

  // Phase 1: Try boundaries exact check matching via Regular Expressions
  for (const [intentId, rule] of Object.entries(INTENT_RULES)) {
    if (intentId === "unknown") continue;
    if (rule.regex.test(processed)) {
      return {
        intent: intentId,
        matchedBy: "regex",
        matchedPattern: `RegExp /${rule.regexString}/i`,
        processedText: processed,
        rawInput: text
      };
    }
  }

  // Phase 2: Fall back to keyword scanning array containment loops
  for (const [intentId, rule] of Object.entries(INTENT_RULES)) {
    if (intentId === "unknown") continue;
    for (const keyword of rule.keywords) {
      if (processed.includes(keyword)) {
        return {
          intent: intentId,
          matchedBy: "keyword",
          matchedPattern: `Keyword inclusion '${keyword}'`,
          processedText: processed,
          rawInput: text
        };
      }
    }
  }

  // Default fallback
  return {
    intent: "unknown",
    matchedBy: "fallback",
    matchedPattern: "Default rule match threshold",
    processedText: processed,
    rawInput: text
  };
}

/**
 * Returns response with dynamic evaluations if necessary
 */
export function generateResponse(intent: string): string {
  const rule = INTENT_RULES[intent] || INTENT_RULES.unknown;

  if (intent === "time") {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `The current system time is: ${timeString}.`;
  }

  if (intent === "date") {
    const now = new Date();
    const dateString = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return `Today is ${dateString}.`;
  }

  const list = rule.responses;
  if (!list || list.length === 0) {
    return "Pardon me! I am missing my database records for this action.";
  }

  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
}

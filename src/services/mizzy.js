const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const TAVILY_API_KEY = import.meta.env.VITE_TAVILY_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const TAVILY_URL = "https://api.tavily.com/search";

const MIZZY_SYSTEM = "You are Mizzy, a brilliant and charming AI companion inside Trive AI. You are the perfect blend of a genius best friend, witty comedian, and wise mentor. Your personality: warm funny and genuinely caring like a best friend, sharp and insightful like a genius mentor, playful with light humor, brutally honest when needed but always kind. Your knowledge: you know everything - science tech art culture philosophy coding math history life advice. You give real useful accurate answers with depth and nuance. Communication: always respond in the exact same language the user writes in. Indonesian reply Indonesian. English reply English. Write in natural flowing sentences only. Zero markdown symbols no asterisks no hashtags no dashes as bullets no bold no italic. Just clean beautiful natural prose. Vary response length based on question complexity. Short casual replies for small talk, detailed thorough answers for complex questions. Use emojis naturally and sparingly. Never be robotic. When analyzing images be thorough detailed and insightful. When you have web search results available, use them to give accurate up-to-date information and mention that the info is current.";

const NEEDS_SEARCH_KEYWORDS = [
  "sekarang", "terkini", "terbaru", "hari ini", "kemarin", "minggu ini",
  "bulan ini", "tahun ini", "2024", "2025", "2026", "saat ini", "current",
  "latest", "today", "now", "recent", "update", "berita", "news",
  "presiden", "president", "prime minister", "perdana menteri", "menteri",
  "harga", "price", "stock", "saham", "bitcoin", "crypto",
  "siapa yang", "who is", "what happened", "apa yang terjadi",
  "film terbaru", "lagu terbaru", "album terbaru", "latest movie",
  "cuaca", "weather", "gempa", "earthquake", "banjir",
  "hasil", "score", "skor", "pertandingan", "match", "election", "pemilu"
];

const needsWebSearch = (message) => {
  const lower = message.toLowerCase();
  return NEEDS_SEARCH_KEYWORDS.some(keyword => lower.includes(keyword));
};

const searchWeb = async (query) => {
  try {
    const response = await fetch(TAVILY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + TAVILY_API_KEY
      },
      body: JSON.stringify({
        query: query,
        search_depth: "basic",
        max_results: 5,
        include_answer: true,
      })
    });
    const data = await response.json();
    if (data.answer) {
      let context = "Web search result: " + data.answer + "\n\n";
      if (data.results && data.results.length > 0) {
        context += "Additional sources:\n";
        data.results.slice(0, 3).forEach(function(r) {
          context += "- " + r.title + ": " + r.content.slice(0, 200) + "\n";
        });
      }
      return context;
    }
    return null;
  } catch (error) {
    console.error("Tavily error:", error);
    return null;
  }
};

export const sendMessageToMizzy = async (userMessage, userName, chatHistory, imageBase64) => {
  try {
    const history = chatHistory.slice(-20).map(function(m) {
      return {
        role: m.role === "mizzy" ? "assistant" : "user",
        content: m.content
      };
    });

    const systemWithUser = MIZZY_SYSTEM + " The user name is " + (userName || "Friend") + ". Use their name naturally sometimes.";

    let finalMessage = userMessage;
    let searchContext = "";

    if (needsWebSearch(userMessage)) {
      console.log("Searching web for:", userMessage);
      const searchResult = await searchWeb(userMessage);
      if (searchResult) {
        searchContext = "\n\n[REAL-TIME WEB DATA - use this for accurate current info]:\n" + searchResult;
        finalMessage = userMessage + searchContext;
      }
    }

    const model = imageBase64
      ? "meta-llama/llama-4-scout-17b-16e-instruct"
      : "llama-3.3-70b-versatile";

    let userContent;
    if (imageBase64) {
      userContent = [
        { type: "image_url", image_url: { url: "data:image/jpeg;base64," + imageBase64 } },
        { type: "text", text: finalMessage || "Analisis gambar ini secara detail." }
      ];
    } else {
      userContent = finalMessage;
    }

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + GROQ_API_KEY
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemWithUser },
          ...history,
          { role: "user", content: userContent }
        ],
        temperature: 0.85,
        max_tokens: 1024,
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      let reply = data.choices[0].message.content;
      reply = reply.replace(/[*#`]/g, "");
      reply = reply.replace(/^\s*[-•]\s*/gm, "");
      reply = reply.replace(/\n{3,}/g, "\n\n");
      return reply.trim();
    }

    if (data.error) {
      console.error("Groq error:", data.error);
      return "Waduh ada gangguan teknis. Coba lagi ya!";
    }

    return "Coba kirim lagi ya!";
  } catch (error) {
    console.error("Mizzy error:", error);
    return "Koneksi bermasalah. Coba lagi!";
  }
};
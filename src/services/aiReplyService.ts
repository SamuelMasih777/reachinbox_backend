import { GoogleGenerativeAI } from "@google/generative-ai";
import { getRelevantAgenda } from "./vectorSearchService";

class AIReplyService {
  private genAi;

  constructor() {
    this.genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }

  async generateSuggestedReply(email: any) {
    const agenda = await getRelevantAgenda(email.body);
    const model = this.genAi.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are a professional email assistant. Based on the outreach agenda, write a polite, helpful, and ready-to-send reply to the following email.

Agenda:
${agenda}

Email:
From: ${email.from}
Subject: ${email.subject}
Body: ${email.body}

Reply in formal tone:
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  }
}

export default new AIReplyService();

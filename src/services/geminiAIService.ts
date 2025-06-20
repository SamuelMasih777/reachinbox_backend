import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

class GeminiEmailCategorizationService {
    public genAi: GoogleGenerativeAI;
    constructor() {
        this.genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    }
    async categorizeEmail(subject: string, body: string, from: string) {
        try {
            const model = this.genAi.getGenerativeModel({model:"gemini-2.5-flash"})
            const prompt = `
                You are an email categorization system. Categorize the following email into exactly one of these categories:
                Categories:
                - Interested: Email shows interest in a proposal, job, meeting, or collaboration
                - Meeting Booked: Email confirms or books a meeting/appointment  
                - Not Interested: Email shows rejection or lack of interest
                - Spam: Promotional, unsolicited, or suspicious emails
                - Out of Office: Auto-reply indicating person is unavailable

                Email Details:
                From: ${from}
                Subject: ${subject}
                Body: ${body?.substring(0, 500) || 'No body content'}

                Instructions:
                - Respond with ONLY the category name
                - Be precise and confident in your classification
                - Consider context and intent, not just keywords
                
                Category:`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const category = response.text().trim();
            return this.normalizeCategory(category);
        } catch (error) {
            console.error('Gemini categorization error:', error);
        }
    }

    normalizeCategory(category: string): string {
        const normalized = category.toLowerCase();
        if (normalized.includes('interested') && !normalized.includes('not')) return 'Interested';
        if (normalized.includes('meeting') || normalized.includes('booked')) return 'Meeting Booked';
        if (normalized.includes('not') || normalized.includes('reject')) return 'Not Interested';
        if (normalized.includes('spam') || normalized.includes('promotion')) return 'Spam';
        if (normalized.includes('office') || normalized.includes('away')) return 'Out of Office';
        return 'Not Interested';
    }
}
export default new GeminiEmailCategorizationService();
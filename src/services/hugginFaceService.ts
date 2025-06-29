import { InferenceClient } from '@huggingface/inference';
import axios from 'axios'

class HuggingFaceEmailCategorizationService {
  private hf: InferenceClient;
  private API_URL = 'https://api-inference.huggingface.co/models/facebook/bart-large-mnli';
  private headers = {
    Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY!}`,
  };

  constructor() {
    this.hf = new InferenceClient(process.env.HUGGINGFACE_API_KEY!); // ← note: just the string, not an object
  }

  async categorizeEmail(subject: string, body: string, from: string): Promise<string> {
    try {
    //   const inputText = `From: ${from}\nSubject: ${subject}\nBody: ${body?.slice(0, 500) || 'No content'}`;
         const input = `From: ${from}\nSubject: ${subject}\nBody: ${body?.slice(0, 500) || 'No content'}`;
         const labels = ['Interested', 'Meeting Booked', 'Not Interested', 'Spam', 'Out of Office'];

      const response = await axios.post(
        this.API_URL,
        {
          inputs: input,
          parameters: {
            candidate_labels: labels,
          },
        },
        { headers: this.headers }
      );

      const result = response.data;
      const category = result.labels?.[0] || 'Not Interested';
      console.log(`🧠 Hugging Face categorized email as: ${category}`);
      return category;
    } catch (error) {
      console.error('❌ Hugging Face categorization error:', error);
      return this.fallbackCategorize(subject, body);
    }
  }

  fallbackCategorize(subject: string, body: string): string {
    const content = `${subject} ${body}`.toLowerCase();

    if (content.includes('interested') && !content.includes('not'))
      return 'Interested';
    if (content.includes('meeting') || content.includes('schedule'))
      return 'Meeting Booked';
    if (content.includes('not interested') || content.includes('decline'))
      return 'Not Interested';
    if (content.includes('unsubscribe') || content.includes('offer'))
      return 'Spam';
    if (content.includes('out of office') || content.includes('auto-reply'))
      return 'Out of Office';

    return 'Not Interested';
  }
}

export default new HuggingFaceEmailCategorizationService();

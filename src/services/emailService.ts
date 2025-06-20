import esClient from "../config/elasticSearch";
import slackService from "./slackService";
import axios from "axios";
import geminiAIService from "./geminiAIService";

class EmailService {
    async storeEmail(email: any) {
        try {
            const category = await geminiAIService.categorizeEmail( email.subject || '', email.body ||'', email.from)
            const categorizedEmail = {
                ...email,
                category,
                categorizedAt: new Date()
            }
            await esClient.index({
                index: "emails",
                document: categorizedEmail,
            });
            console.log(`Email categorized as "${category}": ${email.subject}`);
            
            if (email.subject?.toLowerCase().includes("interested")) {
                await slackService.sendMessageToSlackChannel(
                    `*New Interested Email*\n*Subject:* ${email.subject}\n*From:* ${email.from}`
                );
                await axios.post(process.env.WEBHOOK_URL!, { email });
                console.log("Notified Slack and Webhook");
            }
        } catch (error) {
            console.error(
                "Error in storing email or sending notification:",
                error
            );
        }
    }
    async fetchEmails(account: string) {
        const response = await esClient.search({
            index: "emails",
            query: {
                match: { account },
            },
        });

        return response.hits.hits.map((hit: any) => hit._source);
    }
    async searchEmails(query: string, account?: string, folder?: string) {
        const must: any[] = [];

        if (query) {
            must.push({
                multi_match: {
                    query,
                    fields: ['subject', 'body', 'from', 'to']
                }
            });
        }

        if (account) {
            must.push({ match: { account } });
        }

        if (folder) {
            must.push({ match: { folder } });
        }

        const result = await esClient.search({
            index: 'emails',
            query: {
                bool: {
                    must
                }
            }
        });

        return result.hits.hits.map((hit: any) => hit._source);
    }

}

export default new EmailService();

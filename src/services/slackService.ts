import { WebClient } from '@slack/web-api';

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

class SlackService {
    async sendMessageToSlackChannel(message: string) {
        try {
            console.log('message:', message);
            const result = await slackClient.chat.postMessage({
                text: message,
                channel: process.env.SLACK_CHANNEL_ID!,
            });

            console.log('Message sent to Slack channel:', result.ts);
            return result.ts;
        } catch (error) {
            console.error('Error sending message to Slack:', error);
        }
    }
}

export default new SlackService();

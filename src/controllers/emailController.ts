import config from "../config/config";
import emailService from "../services/emailService";

class EmailController {
    async getEmails(account: string) {
        const { httpStatus } = config
        const result: any = { status: 500, message: 'Something went wrong', data: null };
        try {
            result.data = await emailService.fetchEmails(account);
            result.status = httpStatus.success;
        } catch (error: any) {
            console.error(`Error in getEmails: ${error}`);
            result.message = error.message || 'Failed to fetch emails';
            result.status = httpStatus.serverError;
        }
        return result;
    }
}

export default new EmailController();

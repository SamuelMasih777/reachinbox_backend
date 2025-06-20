import { Router } from 'express';
import emailController from '../controllers/emailController';

const router = Router();

router.get('/emails', async (req, res) => {
    const { account } = req.query;
    const result = await emailController.getEmails(account as string);
    res.status(result.status).send(result);
});

export default router;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import app from './app';
import { startAllImap } from './services/Integrations/imap';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  startAllImap();
});

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/ping', (req, res) => {
  res.send('Server is live');
});

export default app;

// import express from 'express';
// import cors from 'cors';
// import morgan from 'morgan';
// import router from './routers';
// import { startImapConnections } from './services/imapService';

// const app = express();
// app.use(cors());
// app.use(express.json());

// if (process.env.NODE_ENV === 'development') {
//     app.use(morgan('dev'));
// }

// // Initialize IMAP sync on startup
// startImapConnections();

// // All Routes Mounted on /api
// app.use('/api', router);

// // Health Check
// app.get('/ping', (req, res) => {
//     res.send('Server is live');
// });

// export default app;

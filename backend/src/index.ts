import express from 'express';
import cors from 'cors';
import { config } from './config';
import { connectDB } from './db';
import { errorHandler } from './middleware/errorHandler';
import summonerRouter from './routes/summoner';

const app = express();

app.use(cors());
app.use(express.json());

// Health check | ping this to confirm the server is running
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.use("/summoner", summonerRouter);

app.use(errorHandler);

async function start() {
    await connectDB();
    app.listen(config.port, () => {
        console.log(`[Server] Running on http://localhost:${config.port}`);
    });
}

start().catch((err) => {
    console.error("[Server] Failed to start:", err);
    process.exit(1);
});
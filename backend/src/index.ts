import express from 'express';
import cors from 'cors';
import { config } from './config';
import { connectDB } from './db';
import { errorHandler } from './middleware/errorHandler';
import { regionResolver } from './middleware/regionResolver';
import summonerRouter from './routes/summoner';
import matchesRouter from './routes/matches';
import championsRouter from './routes/champions';
import rankedRouter from './routes/ranked';
import { Router } from 'express';

const app = express();

app.use(cors());
app.use(express.json());

// Health check | ping this to confirm the server is running
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

const regionRouter = Router();
regionRouter.use("/summoner", summonerRouter);
regionRouter.use("/summoner", matchesRouter);
regionRouter.use("/summoner", championsRouter);
regionRouter.use("/summoner", rankedRouter);

app.use("/:region", regionResolver, regionRouter);
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
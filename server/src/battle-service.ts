import express from 'express';
import { runShowdownBattle } from './showdown-battle.js';
import type { BattleSimulationJob, BattleSimulationResponse } from './battle-service-protocol.js';

const PORT = Number(process.env.PORT ?? 3002);
const TOKEN = process.env.BATTLE_SERVICE_TOKEN;
const app = express();

app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/simulate', (req, res) => {
  if (TOKEN && req.header('X-Battle-Service-Token') !== TOKEN) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const job = req.body as Partial<BattleSimulationJob>;
  if (!Array.isArray(job.leftEntries) || !Array.isArray(job.rightEntries) || typeof job.fieldSize !== 'number') {
    res.status(400).json({ error: 'leftEntries, rightEntries and fieldSize are required' });
    return;
  }

  const started = process.hrtime.bigint();
  try {
    const snapshot = runShowdownBattle(job.leftEntries, job.rightEntries, job.fieldSize);
    const durationMs = Number(process.hrtime.bigint() - started) / 1e6;
    const response: BattleSimulationResponse = { snapshot, durationMs };
    res.json(response);
  } catch (error) {
    console.error('Battle simulation failed:', error);
    res.status(500).json({ error: 'Battle simulation failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Battle service running on http://localhost:${PORT}`);
});

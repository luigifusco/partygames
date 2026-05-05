import { runShowdownBattle } from './showdown-battle.js';
import type { BattleSnapshot } from '../../shared/battle-types.js';
import type { BattleSimulationJob, BattleSimulationResponse } from './battle-service-protocol.js';

const BATTLE_SERVICE_URL = process.env.BATTLE_SERVICE_URL?.replace(/\/+$/g, '');
const BATTLE_SERVICE_TOKEN = process.env.BATTLE_SERVICE_TOKEN;
const BATTLE_SERVICE_TIMEOUT_MS = Number(process.env.BATTLE_SERVICE_TIMEOUT_MS ?? 30000);

function timeoutMs(): number {
  return Number.isFinite(BATTLE_SERVICE_TIMEOUT_MS) && BATTLE_SERVICE_TIMEOUT_MS > 0
    ? BATTLE_SERVICE_TIMEOUT_MS
    : 30000;
}

export async function simulateBattle(job: BattleSimulationJob): Promise<BattleSnapshot> {
  if (!BATTLE_SERVICE_URL) {
    return runShowdownBattle(job.leftEntries, job.rightEntries, job.fieldSize);
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (BATTLE_SERVICE_TOKEN) headers['X-Battle-Service-Token'] = BATTLE_SERVICE_TOKEN;

  const res = await fetch(`${BATTLE_SERVICE_URL}/simulate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(job),
    signal: AbortSignal.timeout(timeoutMs()),
  });

  const data = await res.json().catch(() => ({})) as Partial<BattleSimulationResponse> & { error?: string };
  if (!res.ok || !data.snapshot) {
    const reason = typeof data.error === 'string' ? data.error : `HTTP ${res.status}`;
    throw new Error(`Battle service failed: ${reason}`);
  }

  return data.snapshot;
}

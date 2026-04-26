import path from 'path';

export function projectRoot(): string {
  const cwd = process.cwd();
  return path.basename(cwd) === 'server' ? path.dirname(cwd) : cwd;
}

export function dataDirPath(): string {
  return process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(projectRoot(), 'data');
}

export function clientDistPath(): string {
  return path.join(projectRoot(), 'client/dist');
}

export function showdownSimPath(): string {
  return path.join(projectRoot(), 'pokemon-showdown/dist/sim/index.js');
}

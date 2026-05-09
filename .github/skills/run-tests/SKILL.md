---
name: run-tests
description: Run the Pokemon Party validation and build checks. Use when asked to run tests, validate the project, check regressions, or verify changes before deploying.
user-invocable: true
allowed-tools:
  - bash
---

# Run Pokemon Party tests

Run the project's standard verification sequence from the repository root:

```bash
cd server && npm test && npm run build
cd ../client && npm run build
```

What this covers:

- Server core rule tests in `server/src/scripts/test-core-rules.ts`
- Game-data validation in `server/src/scripts/validate-game-data.ts`
- Server TypeScript build
- Client TypeScript and Vite production build

After running, summarize the result concisely. If a command fails, report the failing command and the relevant error output. Do not deploy unless explicitly asked.

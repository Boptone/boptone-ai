/**
 * Toney Agent Cron Runner
 *
 * Registers a node-cron job that calls runToneyAgentCycle() every 6 hours.
 * Called from server/_core/index.ts on startup.
 */

import cron from "node-cron";
import { runToneyAgentCycle } from "./toneyAgent";

let isRunning = false;

export function startToneyAgentRunner(): void {
  // Run every 6 hours: at 00:00, 06:00, 12:00, 18:00
  cron.schedule("0 */6 * * *", async () => {
    if (isRunning) {
      console.log("[ToneyAgent] Cycle already in progress — skipping");
      return;
    }
    isRunning = true;
    try {
      await runToneyAgentCycle();
    } catch (err) {
      console.error(
        "[ToneyAgent] Unhandled error in cycle:",
        err instanceof Error ? err.message : err
      );
    } finally {
      isRunning = false;
    }
  });

  console.log("[ToneyAgent] Autonomous agent runner started (every 6 hours)");
}

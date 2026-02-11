import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("convex/crons.ts structure", () => {
  const cronsSource = readFileSync(resolve(__dirname, "../crons.ts"), "utf-8");

  it("imports cronJobs from convex/server", () => {
    expect(cronsSource).toContain("cronJobs");
    expect(cronsSource).toContain("convex/server");
  });

  it("defines 4+ cron jobs", () => {
    // Count cron registrations (crons.daily, crons.hourly, crons.monthly)
    const cronCalls = cronsSource.match(
      /crons\.(daily|hourly|monthly|interval)/g,
    );
    expect(cronCalls).not.toBeNull();
    expect(cronCalls!.length).toBeGreaterThanOrEqual(4);
  });

  it("includes invite cleanup cron", () => {
    expect(cronsSource).toContain("cleanup expired invites");
    expect(cronsSource).toContain("cleanupExpiredInvites");
  });

  it("includes monthly credit reset cron", () => {
    expect(cronsSource).toContain("reset monthly credits");
    expect(cronsSource).toContain("resetMonthlyCredits");
  });

  it("includes subscription sync cron", () => {
    expect(cronsSource).toContain("sync subscriptions");
    expect(cronsSource).toContain("syncSubscriptions");
  });

  it("includes session cleanup cron", () => {
    expect(cronsSource).toContain("cleanup stale sessions");
    expect(cronsSource).toContain("cleanupStaleSessions");
  });

  it("exports default crons object", () => {
    expect(cronsSource).toContain("export default crons");
  });
});

describe("convex/cronJobs.ts structure", () => {
  const cronJobsSource = readFileSync(
    resolve(__dirname, "../cronJobs.ts"),
    "utf-8",
  );

  it("exports cleanupExpiredInvites", () => {
    expect(cronJobsSource).toContain("export const cleanupExpiredInvites");
  });

  it("exports cleanupStaleSessions", () => {
    expect(cronJobsSource).toContain("export const cleanupStaleSessions");
  });

  it("exports syncSubscriptions", () => {
    expect(cronJobsSource).toContain("export const syncSubscriptions");
  });

  it("exports resetMonthlyCredits", () => {
    expect(cronJobsSource).toContain("export const resetMonthlyCredits");
  });

  it("cleanupExpiredInvites deletes invites older than 7 days", () => {
    expect(cronJobsSource).toContain("7 * 24 * 60 * 60 * 1000");
  });

  it("cleanupStaleSessions deletes sessions expired > 24h", () => {
    expect(cronJobsSource).toContain("24 * 60 * 60 * 1000");
  });
});
